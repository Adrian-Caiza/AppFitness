import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session } from '@supabase/supabase-js';
import { User } from '../../domain/entities/User';
import { AuthRepository, SignInParams, SignUpParams } from '../../domain/repositories/AuthRepository';
import { SupabaseAuthRepository } from '../../data/repositories/SupabaseAuthRepository';
import { Text } from 'react-native';

// Definir la forma del contexto
interface AuthContextType {
    session: Session | null;
    user: User | null;
    isLoading: boolean;
    signIn: (params: SignInParams) => Promise<{ error: Error | null }>;
    signUp: (params: SignUpParams) => Promise<{ error: Error | null }>;
    signOut: () => Promise<void>;
}

// Crear el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Instanciar nuestro repositorio de datos
const authRepository: AuthRepository = new SupabaseAuthRepository();

// Crear el Proveedor (Provider)
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // 1. Cargar la sesión inicial al abrir la app
        const fetchSession = async () => {
            try {
                const { session, user } = await authRepository.getSession();
                setSession(session);
                setUser(user);
            } catch (e) {
                console.error('Error fetching initial session', e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSession();

        // 2. Escuchar cambios de autenticación (login/logout)
        const { unsubscribe } = authRepository.onAuthStateChange((session, user) => {
            setSession(session);
            setUser(user);
        });

        // 3. Limpiar el listener al desmontar
        return () => {
            unsubscribe();
        };
    }, []);

    // Funciones que la UI podrá llamar
    const signIn = async (params: SignInParams) => {
        const { user, error } = await authRepository.signIn(params);
        if (user) setUser(user); // Actualiza el estado local
        return { error };
    };

    const signUp = async (params: SignUpParams) => {
        // Nota: Supabase puede auto-autenticar después del registro.
        // El listener onAuthStateChange debería manejar la actualización del estado.
        const { error } = await authRepository.signUp(params);
        return { error };
    };

    const signOut = async () => {
        await authRepository.signOut();
    };

    // Si está cargando, mostramos un loader simple
    if (isLoading) {
        // Aquí podrías poner tu <SplashScreen />
        return <Text>Loading...</Text>;
    }

    // El valor que proveemos al resto de la app
    const value = {
        session,
        user,
        isLoading,
        signIn,
        signUp,
        signOut,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook personalizado para consumir el contexto fácilmente
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
