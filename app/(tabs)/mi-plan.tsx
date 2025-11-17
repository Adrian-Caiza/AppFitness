// app/(tabs)/mi-plan.tsx (¡Refactorizado a una lista!)

import { View, Text, StyleSheet, ActivityIndicator, FlatList, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { useUserPlans } from '../../src/presentation/hooks/useUserPlans'; // Hook renombrado
import { PlanAsignado } from '../../src/domain/types/types';

export default function MiPlanScreen() {
    const { plans, isLoading, refreshPlans } = useUserPlans();

    if (isLoading) {
        return <ActivityIndicator style={styles.centered} size="large" />;
    }

    if (!plans || plans.length === 0) {
        return (
            <View style={styles.centered}>
                <Text>No tienes ningún plan asignado.</Text>
                <Text>Contacta a tu entrenador.</Text>
            </View>
        );
    }

    const renderPlan = ({ item }: { item: PlanAsignado }) => (
        <Link
            href={{
                pathname: '/plan-detalle/[id]',
                params: { id: item.id }
            }}
            asChild
        >
            <Pressable style={styles.planContainer}>
                <Text style={styles.planTitle}>{item.rutinas.name}</Text>
                <Text style={styles.trainerName}>Asignado por: {item.profiles.full_name}</Text>
            </Pressable>
        </Link>
    );

    return (
        <FlatList
            data={plans}
            renderItem={renderPlan}
            keyExtractor={(item) => item.id}
            onRefresh={refreshPlans}
            refreshing={isLoading}
            contentContainerStyle={styles.container}
        />
    );
}

const styles = StyleSheet.create({
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    container: { padding: 10 },
    planContainer: {
        padding: 20,
        borderRadius: 10,
        backgroundColor: 'white',
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 3,
    },
    planTitle: { fontSize: 18, fontWeight: 'bold' },
    trainerName: { fontSize: 14, color: '#666', marginTop: 5 },
});