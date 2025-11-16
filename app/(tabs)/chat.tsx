import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../../src/presentation/context/AuthContext';
import { useClients } from '../../src/presentation/hooks/useClients';
import { useMyTrainers } from '../../src/presentation/hooks/useMyTrainers';
import { User } from '../../src/domain/entities/User';
import { Link, useRouter } from 'expo-router';
import { useEffect } from 'react';

// Vista para el Entrenador (Lista de Clientes)
const TrainerChatList = () => {
    const { clients, isLoading, refresh } = useClients();

    const renderClient = ({ item }: { item: User }) => (
        <Link href={`/chat/${item.id}`} asChild>
            <Pressable style={styles.itemContainer}>
                <Text style={styles.itemTitle}>{item.full_name}</Text>
                <Text>{'->'}</Text>
            </Pressable>
        </Link>
    );

    if (isLoading) {
        return <ActivityIndicator style={styles.centered} />;
    }

    return (
        <FlatList
            data={clients}
            renderItem={renderClient}
            keyExtractor={(item) => item.id}
            onRefresh={refresh}
            refreshing={isLoading}
            ListEmptyComponent={<Text style={styles.emptyText}>No tienes clientes.</Text>}
        />
    );
};

// Vista para el Usuario (Redirige a su Entrenador)
const UserTrainerList = () => {
    const { trainers, isLoading } = useMyTrainers();
    const router = useRouter();

    const renderTrainer = ({ item }: { item: User }) => (
        <Link href={`/chat/${item.id}`} asChild>
            <Pressable style={styles.itemContainer}>
                <Text style={styles.itemTitle}>{item.full_name}</Text>
                <Text>{'->'}</Text>
            </Pressable>
        </Link>
    );



    if (isLoading) {
        return <ActivityIndicator style={styles.centered} />;
    }

    return (
        <FlatList
            data={trainers}
            renderItem={renderTrainer}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={<Text style={styles.emptyText}>No tienes entrenadores asignados.</Text>}
        />
    );

};

// Componente principal que decide qué mostrar
export default function ChatScreenRouter() {
    const { user } = useAuth();

    if (!user) return <ActivityIndicator style={styles.centered} />;

    if (user.role === 'trainer') {
        return <TrainerChatList />;
    }

    if (user.role === 'user') {
        return <UserTrainerList />;
    }

    return <Text>Rol no reconocido</Text>;
}

const styles = StyleSheet.create({
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { textAlign: 'center', color: '#999' },
    itemContainer: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    itemTitle: { fontSize: 16, fontWeight: 'bold' },
});