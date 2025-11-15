import { Redirect } from 'expo-router';

// Este archivo solo redirige. El _layout.tsx tiene la lógica.
export default function Index() {
    return <Redirect href="/(auth)/login" />;
}