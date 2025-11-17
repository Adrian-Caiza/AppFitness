// app/(auth)/register.tsx
import { View, TextInput, Alert, Text, Pressable } from 'react-native';
import { useState } from 'react';
import { useAuth } from '../../src/presentation/context/AuthContext';
import { Link, useRouter } from 'expo-router';
import { UserRole } from '../../src/domain/entities/User';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Colors } from '@/constants/theme';
import { authStyles } from '../../src/constants/AuthStyles'; // Importa los estilos

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState<UserRole>('user');
    const { signUp } = useAuth();
    const router = useRouter();

    // --- Obtener colores del tema ---
    const containerBg = useThemeColor({}, 'background');
    const inputBorder = useThemeColor({}, 'border');
    const inputText = useThemeColor({}, 'text');
    const placeholderText = useThemeColor({}, 'muted');
    const primaryColor = useThemeColor({}, 'primary');
    const linkColor = useThemeColor({}, 'link');
    // Colores para el Toggle
    const activeColor = useThemeColor({}, 'activeGreen');
    const activeTextColor = useThemeColor({ light: '#FFF', dark: '#000' }, 'text');
    const inactiveColor = useThemeColor({}, 'card');
    const inactiveTextColor = useThemeColor({}, 'muted');
    // ---

    const handleRegister = async () => {
        const { error } = await signUp({
            email,
            password,
            full_name: fullName,
            role,
        });
        if (error) {
            Alert.alert('Error', error.message);
        } else {
            Alert.alert('Éxito', '¡Cuenta creada! Por favor, verifica tu email.');
            router.replace('/(auth)/login');
        }
    };

    return (
        <ThemedView style={[authStyles.container, { backgroundColor: containerBg }]}>
            <ThemedText style={authStyles.title}>Crear Cuenta</ThemedText>

            <TextInput
                placeholder="Nombre Completo"
                value={fullName}
                onChangeText={setFullName}
                placeholderTextColor={placeholderText}
                style={[authStyles.input, { borderBottomColor: inputBorder, color: inputText }]}
            />
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

            {/* --- ¡NUEVO TOGGLE DE ROL! --- */}
            <ThemedText style={{ color: inactiveTextColor, marginBottom: 5 }}>Quiero ser:</ThemedText>
            <View style={authStyles.toggleContainer}>
                <Pressable
                    onPress={() => setRole('user')}
                    style={[
                        authStyles.toggleButton,
                        role === 'user'
                            ? [authStyles.toggleButtonActive, { backgroundColor: activeColor }]
                            : [authStyles.toggleButtonInactive, { backgroundColor: inactiveColor }]
                    ]}
                >
                    <Text style={role === 'user' ? [authStyles.toggleTextActive, { color: activeTextColor }] : [authStyles.toggleTextInactive, { color: inactiveTextColor }]}>
                        Usuario
                    </Text>
                </Pressable>
                <View style={{ width: 10 }} />
                <Pressable
                    onPress={() => setRole('trainer')}
                    style={[
                        authStyles.toggleButton,
                        role === 'trainer'
                            ? [authStyles.toggleButtonActive, { backgroundColor: activeColor }]
                            : [authStyles.toggleButtonInactive, { backgroundColor: inactiveColor }]
                    ]}
                >
                    <Text style={role === 'trainer' ? [authStyles.toggleTextActive, { color: activeTextColor }] : [authStyles.toggleTextInactive, { color: inactiveTextColor }]}>
                        Entrenador
                    </Text>
                </Pressable>
            </View>
            {/* --- FIN DEL TOGGLE --- */}

            <Pressable style={[authStyles.button, { backgroundColor: primaryColor }]} onPress={handleRegister}>
                <Text style={authStyles.buttonText}>Registrarse</Text>
            </Pressable>

            <Link href="/(auth)/login" asChild>
                <Pressable>
                    <ThemedText style={[authStyles.linkText, { color: linkColor }]}>
                        ¿Ya tienes cuenta? Inicia Sesión
                    </ThemedText>
                </Pressable>
            </Link>
        </ThemedView>
    );
}