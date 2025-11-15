import { Stack, useRouter } from 'expo-router';
import { useAuth } from '../../src/presentation/context/AuthContext';
import { useEffect } from 'react';

export default function AuthLayout() {
    const { session } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Si el usuario ya está logueado, sacarlo de las pantallas de auth
        if (session) {
            router.replace('/(tabs)');
        }
    }, [session]);

    // Grupo de pantallas sin header
    return <Stack screenOptions={{ headerShown: false }} />;
}
