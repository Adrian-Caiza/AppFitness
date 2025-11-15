import { Tabs } from 'expo-router';
import { useAuth } from '../../src/presentation/context/AuthContext';
import { FontAwesome } from '@expo/vector-icons'

export default function TabsLayout() {
  const { user } = useAuth();

  // Si el usuario aún no se ha cargado, no mostramos nada
  if (!user) {
    return null;
  }

  return (
    <Tabs>
      {/* Tabs comunes para ambos roles */}
      <Tabs.Screen name="index" options={{ title: 'Inicio' }} />
      <Tabs.Screen name="chat" options={{ title: 'Chat' }} />

      {/* Tab exclusiva para Entrenadores */}
      {user.role === 'trainer' && (
        <Tabs.Screen
          name="crear-rutina"
          options={{ title: 'Crear Rutina' }}
        />
      )}

      {/* ¡NUEVA TAB! */}
      {user.role === 'trainer' && (
        <Tabs.Screen
          name="ejercicios" 
          options={{ title: 'Ejercicios' }}
        />
      )}

      {user.role === 'trainer' && (
        <Tabs.Screen
          name="clients" 
          options={{ title: 'Clientes' }}
        />
      )}

      {/* Tab exclusiva para Usuarios */}
      {user.role === 'user' && (
        <Tabs.Screen
          name="mi-plan"
          options={{ title: 'Mi Plan' }}
        />
      )}
      
      {/* Perfil (para hacer logout) */}
      <Tabs.Screen name="profile" options={{ title: 'Perfil' }} />
    </Tabs>
  );
}