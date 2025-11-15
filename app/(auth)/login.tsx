import { View, TextInput, Button, Alert } from 'react-native';
import { useState } from 'react';
import { useAuth } from '../../src/presentation/context/AuthContext';
import { Link } from 'expo-router';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { signIn } = useAuth();

    const handleLogin = async () => {
        const { error } = await signIn({ email, password });
        if (error) {
            Alert.alert('Error', error.message);
        }
        // Si es exitoso, el listener del _layout nos redirigirá
    };

    return (
        <View style={{ padding: 20, justifyContent: 'center', flex: 1 }}>
            <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
            />
            <TextInput
                placeholder="Contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={{ borderWidth: 1, padding: 10, marginBottom: 20 }}
            />
            <Button title="Iniciar Sesión" onPress={handleLogin} />
            <Link href="/(auth)/register" style={{ textAlign: 'center', marginTop: 20 }}>
                ¿No tienes cuenta? Regístrate
            </Link>
        </View>
    );
}
