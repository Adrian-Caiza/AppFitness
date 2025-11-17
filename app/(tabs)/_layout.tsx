// app/(tabs)/_layout.tsx

import { Tabs } from 'expo-router';
import { useAuth } from '../../src/presentation/context/AuthContext';
import { FontAwesome } from '@expo/vector-icons'; // ¡Asegúrate de que esta línea esté importada!

/**
 * Un helper para renderizar el icono.
 * Puedes ajustar el 'size' aquí si lo deseas.
 */
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={24} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabsLayout() {
  const { user } = useAuth();

  if (!user) {
    return null; // Aún no sabemos el rol, no renderizar nada
  }

  return (
    <Tabs>
      {/* Pestañas comunes para AMBOS roles */}
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Inicio',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }} 
      />
      
      {/* Pestaña de Chat (Común para ambos) */}
      <Tabs.Screen
        name="chat"
        options={{ 
          title: 'Chat',
          tabBarIcon: ({ color }) => <TabBarIcon name="comments" color={color} />,
        }}
      />

      {/* --- Pestañas de ENTRENADOR --- */}
      {/* Usamos href={null} para OCULTAR la pestaña si no es el rol correcto */}
      
      {/* @ts-ignore Ignoramos el error falso de 'href' */}
      <Tabs.Screen
        name="crear-rutina"
        options={{ 
          title: 'Crear Rutina',
          tabBarIcon: ({ color }) => <TabBarIcon name="clipboard" color={color} />,
          href: user.role === 'trainer' ? '/(tabs)/crear-rutina' : null,
        }}
      />
      {/* @ts-ignore Ignoramos el error falso de 'href' */}
      <Tabs.Screen
        name="ejercicios"
        options={{ 
          title: 'Ejercicios',
          tabBarIcon: ({ color }) => <TabBarIcon name="list-alt" color={color} />,
          href: user.role === 'trainer' ? '/(tabs)/ejercicios' : null,
        }}
      />
      {/* @ts-ignore Ignoramos el error falso de 'href' */}
      <Tabs.Screen
        name="clients"
        options={{ 
          title: 'Clientes',
          tabBarIcon: ({ color }) => <TabBarIcon name="users" color={color} />,
          href: user.role === 'trainer' ? '/(tabs)/clients' : null,
        }}
      />

      {/* --- Pestaña de USUARIO --- */}
      
      {/* @ts-ignore Ignoramos el error falso de 'href' */}
      <Tabs.Screen
        name="mi-plan"
        options={{ 
          title: 'Mi Plan',
          tabBarIcon: ({ color }) => <TabBarIcon name="calendar-check-o" color={color} />,
          href: user.role === 'user' ? '/(tabs)/mi-plan' : null,
        }}
      />

      <Tabs.Screen 
        name="profile" 
        options={{ 
          title: 'Perfil',
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }} 
      />
    </Tabs>
  );
}

