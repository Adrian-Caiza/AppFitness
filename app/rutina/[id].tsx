// app/rutina/[id].tsx

import { View, Text, FlatList, StyleSheet, ActivityIndicator, Modal, TextInput, Button, Alert } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useRutinaDetalle } from '../../src/presentation/hooks/useRutinaDetalle';
import { EjercicioEnRutina } from '../../src/domain/types/types';
import { useState } from 'react';
import { Picker } from '@react-native-picker/picker';

export default function RutinaDetalleScreen() {
    const { id } = useLocalSearchParams();
    const rutinaId = Array.isArray(id) ? id[0] : id;

    if (!rutinaId) return <Text>ID de rutina no encontrado.</Text>;

    const { rutina, ejerciciosDisponibles, isLoading, refresh, addEjercicio } =
        useRutinaDetalle(rutinaId);

    const [modalVisible, setModalVisible] = useState(false);
    const [ejercicioId, setEjercicioId] = useState<string | null>(null);
    const [sets, setSets] = useState('');
    const [reps, setReps] = useState('');
    const [rest, setRest] = useState('');

    const handleAddEjercicio = async () => {
        if (!ejercicioId) {
            Alert.alert('Error', 'Debes seleccionar un ejercicio.');
            return;
        }

        try {
            await addEjercicio({
                ejercicio_id: ejercicioId,
                sets: sets ? parseInt(sets) : null,
                reps: reps || null,
                rest_time_seconds: rest ? parseInt(rest) : null,
            });

            setModalVisible(false);
            setEjercicioId(null);
            setSets('');
            setReps('');
            setRest('');
        } catch (e) { }
    };

    const renderEjercicioEnRutina = ({ item }: { item: EjercicioEnRutina }) => (
        <View style={styles.ejercicioContainer}>
            <Text style={styles.ejercicioTitle}>{item.ejercicios.name}</Text>
            <Text>
                Sets: {item.sets || 'N/A'} | Reps: {item.reps || 'N/A'} | Descanso: {item.rest_time_seconds || 'N/A'}s
            </Text>
        </View>
    );

    if (isLoading && !rutina) {
        return <ActivityIndicator style={styles.centered} size="large" />;
    }

    if (!rutina) {
        return <Text style={styles.centered}>Rutina no encontrada.</Text>;
    }

    return (
        <>
            {/* ✅ CORREGIDO: Stack.Screen debe ir arriba del layout */}
            <Stack.Screen
                options={{
                    title: rutina.name,
                    headerBackTitle: 'Rutinas'
                }}
            />

            <View style={styles.container}>
                <Button title="Añadir Ejercicio" onPress={() => setModalVisible(true)} />

                <FlatList
                    data={rutina.rutina_ejercicios}
                    renderItem={renderEjercicioEnRutina}
                    keyExtractor={(item) => item.id}
                    onRefresh={refresh}
                    refreshing={isLoading}
                    ListHeaderComponent={<Text style={styles.title}>{rutina.description}</Text>}
                    ListEmptyComponent={<Text style={styles.emptyText}>Esta rutina aún no tiene ejercicios.</Text>}
                />

                {/* Modal */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalView}>
                        <Text style={styles.modalTitle}>Añadir Ejercicio</Text>

                        <Picker
                            selectedValue={ejercicioId}
                            onValueChange={(itemValue) => setEjercicioId(itemValue)}
                            style={styles.input}
                        >
                            <Picker.Item label="Selecciona un ejercicio..." value={null} />
                            {ejerciciosDisponibles.map((ej) => (
                                <Picker.Item label={ej.name} value={ej.id} key={ej.id} />
                            ))}
                        </Picker>

                        <TextInput
                            placeholder="Sets (ej: 4)"
                            value={sets}
                            onChangeText={setSets}
                            style={styles.input}
                            keyboardType="numeric"
                        />

                        <TextInput
                            placeholder="Reps (ej: 10-12)"
                            value={reps}
                            onChangeText={setReps}
                            style={styles.input}
                        />

                        <TextInput
                            placeholder="Descanso (segundos, ej: 60)"
                            value={rest}
                            onChangeText={setRest}
                            style={styles.input}
                            keyboardType="numeric"
                        />

                        <Button title="Guardar" onPress={handleAddEjercicio} disabled={isLoading} />
                        <Button title="Cancelar" onPress={() => setModalVisible(false)} color="gray" />
                    </View>
                </Modal>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 18, padding: 15, textAlign: 'center', color: '#666' },
    emptyText: { textAlign: 'center', marginTop: 20, color: '#999' },
    ejercicioContainer: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
    ejercicioTitle: { fontSize: 16, fontWeight: 'bold' },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        marginTop: '50%',
    },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
    input: { // ¡Estilo de input actualizado!
        borderBottomWidth: 1,
        borderColor: '#D1D1D6',
        padding: 10,
        marginBottom: 10,
        width: '100%',
        fontSize: 16,
    },
});
