import {
    AuthRepository,
    SignInParams,
    SignUpParams,
} from '../../domain/repositories/AuthRepository';
import { User, UserRole } from '../../domain/entities/User';
import { supabase } from '../../lib/supabase';
import { Session, AuthError } from '@supabase/supabase-js';

export class SupabaseAuthRepository implements AuthRepository {

    /**
     * Obtiene el perfil de un usuario desde la tabla 'profiles'.
     * Esta función es clave porque `auth.user()` no tiene el 'role'.
     */
    private async getProfile(userId: string): Promise<Pick<User, 'full_name' | 'role'> | null> {
        const { data, error } = await supabase
            .from('profiles')
            .select('full_name, role')
            .eq('id', userId)
            .single();

        if (error || !data) {
            console.error('Error fetching profile:', error?.message);
            return null;
        }

        return data as { full_name: string | null; role: UserRole };
    }

    /**
     * REGISTRO: Crea el usuario en `auth.users` y LUEGO crea su perfil en `public.profiles`.
     */
    async signUp(params: SignUpParams): Promise<{ user: User | null; error: Error | null }> {

        // 1. Llamar a signUp pasando el rol y nombre como metadata
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: params.email,
            password: params.password,
            options: {
                data: {
                    full_name: params.full_name,
                    role: params.role
                }
            }
        });

        if (authError || !authData.user) {
            return { user: null, error: authError };
        }

        // 2. ¡Ya no insertamos en 'profiles' desde aquí! El trigger lo hará.

        // 3. Devolver el usuario (aún sin perfil, pero la alerta de "revisa tu email" se mostrará)
        // El tipo 'User' aquí es solo parcial, ya que el perfil
        // se está creando en la DB.
        const partialUser: User = {
            id: authData.user.id,
            email: authData.user.email!,
            full_name: params.full_name, // Lo tomamos de los params
            role: params.role,          // Lo tomamos de los params
        };

        return { user: partialUser, error: null };
    }

    /**
     * INICIO DE SESIÓN: Autentica y luego obtiene el perfil para sacar el ROL.
     */
    async signIn(params: SignInParams): Promise<{ user: User | null; error: Error | null }> {
        // 1. Iniciar sesión con Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: params.email,
            password: params.password,
        });

        if (authError || !authData.session) {
            return { user: null, error: authError };
        }

        // 2. Obtener el perfil (rol)
        const profile = await this.getProfile(authData.user.id);
        if (!profile) {
            return { user: null, error: new Error('User profile not found.') };
        }

        // 3. Devolver la entidad de Usuario completa
        const user: User = {
            id: authData.user.id,
            email: authData.user.email!,
            ...profile,
        };

        return { user, error: null };
    }

    /**
     * CERRAR SESIÓN
     */
    async signOut(): Promise<void> {
        await supabase.auth.signOut();
    }

    /**
     * OBTENER SESIÓN: Comprueba la sesión activa y obtiene el perfil/rol.
     */
    async getSession(): Promise<{ session: Session | null; user: User | null }> {
        // 1. Obtener la sesión de Supabase Auth
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session) {
            return { session: null, user: null };
        }

        // 2. Obtener el perfil (rol)
        const profile = await this.getProfile(session.user.id);
        if (!profile) {
            // El usuario está autenticado pero no tiene perfil (estado anómalo)
            return { session: session, user: null };
        }

        // 3. Devolver la entidad de Usuario completa
        const user: User = {
            id: session.user.id,
            email: session.user.email!,
            ...profile,
        };

        return { session, user };
    }

    /**
     * OBSERVADOR: Escucha cambios (login, logout) en tiempo real.
     */
    onAuthStateChange(
        callback: (session: Session | null, user: User | null) => void
    ): { unsubscribe: () => void } {

        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (event === 'SIGNED_IN' && session) {
                    // Si inicia sesión, buscamos su perfil
                    const profile = await this.getProfile(session.user.id);
                    if (profile) {
                        const user: User = { id: session.user.id, email: session.user.email!, ...profile };
                        callback(session, user);
                    } else {
                        callback(session, null); // Logueado pero sin perfil
                    }
                } else if (event === 'SIGNED_OUT') {
                    // Si cierra sesión, todo es nulo
                    callback(null, null);
                }
            }
        );

        return {
            unsubscribe: authListener.subscription.unsubscribe,
        };
    }
}
