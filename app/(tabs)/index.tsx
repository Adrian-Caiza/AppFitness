import { View, Text, Button } from 'react-native';
import { useAuth } from '../../src/presentation/context/AuthContext';

export default function HomeScreen() {
  const { user, signOut } = useAuth();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20 }}>¡Bienvenido, {user?.full_name}!</Text>
      <Text style={{ fontSize: 18, marginVertical: 10 }}>
        Tu rol es: <Text style={{ fontWeight: 'bold' }}>{user?.role}</Text>
      </Text>
    </View>
  );
}

