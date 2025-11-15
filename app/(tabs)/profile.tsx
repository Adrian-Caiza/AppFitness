import { View, Button, Alert } from 'react-native';
import { useAuth } from '../../src/presentation/context/AuthContext';

export default function ProfileScreen() {
    const { signOut } = useAuth();

    const handleLogout = async () => {
        try {
            await signOut();
            // El listener del _layout nos redirigirá a /login
        } catch (e: any) {
            Alert.alert('Error', e.message);
        }
    };

    return (
        <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
            <Button title="Cerrar Sesión" color="red" onPress={handleLogout} />
        </View>
    );
}
