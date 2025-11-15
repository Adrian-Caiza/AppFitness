import { View, TextInput, Button, Alert, Text, Switch } from 'react-native';
import { useState } from 'react';
import { useAuth } from '../../src/presentation/context/AuthContext';
import { Link, useRouter } from 'expo-router';
import { UserRole } from '../../src/domain/entities/User';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState<UserRole>('user'); // Por defecto 'user'
    const { signUp } = useAuth();
    const router = useRouter();

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
        <View style={{ padding: 20, justifyContent: 'center', flex: 1 }}>
            <TextInput
                placeholder="Nombre Completo"
                value={fullName}
                onChangeText={setFullName}
                style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
            />
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

            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                <Text>Usuario</Text>
                <Switch
                    value={role === 'trainer'}
                    onValueChange={(val) => setRole(val ? 'trainer' : 'user')}
                />
                <Text>Entrenador</Text>
            </View>

            <Button title="Registrarse" onPress={handleRegister} />
            <Link href="/(auth)/login" style={{ textAlign: 'center', marginTop: 20 }}>
                ¿Ya tienes cuenta? Inicia Sesión
            </Link>
        </View>
    );
}
