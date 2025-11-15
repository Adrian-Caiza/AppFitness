import { User, UserRole } from '../entities/User';
import { Session } from '@supabase/supabase-js';

// Argumentos para el registro
export interface SignUpParams {
    email: string;
    password: string;
    full_name: string;
    role: UserRole;
}

// Argumentos para el inicio de sesión
export interface SignInParams {
    email: string;
    password: string;
}

// Lo que esperamos de un repositorio de autenticación
export interface AuthRepository {
    signUp(params: SignUpParams): Promise<{ user: User | null; error: Error | null }>;
    signIn(params: SignInParams): Promise<{ user: User | null; error: Error | null }>;
    signOut(): Promise<void>;
    getSession(): Promise<{ session: Session | null; user: User | null }>;

    // Para escuchar cambios de sesión en tiempo real
    onAuthStateChange(
        callback: (session: Session | null, user: User | null) => void
    ): { unsubscribe: () => void };
}