// app/(auth)/login.tsx
import { View, TextInput, Button, Alert, Text, Pressable } from 'react-native';
import { useState } from 'react';
import { useAuth } from '../../src/presentation/context/AuthContext';
import { Link, useRouter } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Colors } from '@/constants/theme';
import { authStyles } from '../../src/constants/AuthStyles'; // Importa los estilos

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { signIn } = useAuth();
    const router = useRouter();

    // Obtener colores del tema
    const containerBg = useThemeColor({}, 'background');
    const inputBorder = useThemeColor({}, 'border');
    const inputText = useThemeColor({}, 'text');
    const placeholderText = useThemeColor({}, 'muted');
    const primaryColor = useThemeColor({}, 'primary');
    const linkColor = useThemeColor({}, 'link');

    const handleLogin = async () => {
        try {
            const { error } = await signIn({ email, password });
            if (error) {
                Alert.alert('Error', error.message);
            }
            // El _layout se encargará de redirigir
        } catch (e: any) {
            Alert.alert('Error', e.message);
        }
    };

    return (
        <ThemedView style={[authStyles.container, { backgroundColor: containerBg }]}>
            <ThemedText style={authStyles.title}> FitnessApp </ThemedText>

            <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholderTextColor={placeholderText}
                style={[authStyles.input, { borderBottomColor: inputBorder, color: inputText }]}
            />
            <TextInput
                placeholder="Contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholderTextColor={placeholderText}
                style={[authStyles.input, { borderBottomColor: inputBorder, color: inputText }]}
            />

            <Pressable style={[authStyles.button, { backgroundColor: primaryColor }]} onPress={handleLogin}>
                <Text style={authStyles.buttonText}>Iniciar Sesión</Text>
            </Pressable>

            <Link href="/(auth)/register" asChild>
                <Pressable>
                    <ThemedText style={[authStyles.linkText, { color: linkColor }]}>
                        ¿No tienes cuenta? Regístrate
                    </ThemedText>
                </Pressable>
            </Link>
        </ThemedView>
    );
}