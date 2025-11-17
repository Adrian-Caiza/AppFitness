import { Stack, useRouter, Slot } from 'expo-router';
import { AuthProvider, useAuth } from '../src/presentation/context/AuthContext';
import { useEffect } from 'react';

function RootLayoutNav() {
    const { session, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) {
            return; // Espera a que termine de cargar
        }

        if (!session) {
            // Si no hay sesión, llévalo al grupo (auth)
            router.replace('/(auth)/login');
        } else {
            // Si hay sesión, llévalo al grupo (tabs)
            router.replace('/(tabs)');
        }
    }, [session, isLoading]);

    // `Slot` renderizará la ruta actual (login o tabs)
    return (
        <Stack>
            {/* El grupo (auth) no tendrá header, usa su propio layout */}
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            
            {/* El grupo (tabs) no tendrá header, usa su propio layout */}
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            
            {/* Definimos las pantallas que se pueden "empujar" encima */}
            <Stack.Screen name="rutina/[id]" />
            <Stack.Screen name="chat/[id]" />
            <Stack.Screen name="plan-detalle/[id]" />
        </Stack>
    );
}

export default function RootLayout() {
    return (
        <AuthProvider>
            <RootLayoutNav />
        </AuthProvider>
    );
}