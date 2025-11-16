// app/rutina/[id].tsx

import { View, Text, FlatList, StyleSheet, ActivityIndicator, Modal, TextInput, Button, Alert } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useRutinaDetalle } from '../../src/presentation/hooks/useRutinaDetalle';
import { EjercicioEnRutina } from '../../src/domain/types/types';
import { useState } from 'react';
import { Picker } from '@react-native-picker/picker'; // npx expo install @react-native-picker/picker

export default function RutinaDetalleScreen() {
    const { id } = useLocalSearchParams(); // Obtiene el [id] de la URL
    const rutinaId = Array.isArray(id) ? id[0] : id;

    if (!rutinaId) return <Text>ID de rutina no encontrado.</Text>;

    const { rutina, ejerciciosDisponibles, isLoading, refresh, addEjercicio } = useRutinaDetalle(rutinaId);

    // Estado para el modal/formulario
    const [modalVisible, setModalVisible] = useState(false);
    const [ejercicioId, setEjercicioId] = useState<string | null>(null);
    const [sets, setSets] = useState('');
    const [reps, setReps] = useState('');
    const [rest, setRest] = useState('');

    // Maneja el guardado del formulario
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
            // Limpiar y cerrar modal
            setModalVisible(false);
            setEjercicioId(null);
            setSets('');
            setReps('');
            setRest('');
        } catch (e) {
            // El hook ya muestra la alerta
        }
    };

    // Renderiza cada ejercicio *dentro* de la rutina
    const renderEjercicioEnRutina = ({ item }: { item: EjercicioEnRutina }) => (
        <View style={styles.ejercicioContainer}>
            <Text style={styles.ejercicioTitle}>{item.ejercicios.name}</Text>
            <Text>Sets: {item.sets || 'N/A'} | Reps: {item.reps || 'N/A'} | Descanso: {item.rest_time_seconds || 'N/A'}s</Text>
        </View>
    );

    if (isLoading && !rutina) {
        return <ActivityIndicator style={styles.centered} size="large" />;
    }

    if (!rutina) {
        return <Text style={styles.centered}>Rutina no encontrada.</Text>;
    }

    return (
        <View style={styles.container}>

            {/* ¡ESTA LÍNEA CORRIGE EL TÍTULO! */}
            <Stack.Screen options={{ title: rutina.name, headerBackTitle: 'Rutinas' }} />

            {/* ¡ESTE ES EL BOTÓN QUE TE FALTA! */}
            <Button title="Añadir Ejercicio" onPress={() => setModalVisible(true)} />

            {/* Lista de ejercicios en la rutina */}
            <View style={{ flex: 1 }}>
                <FlatList
                data={rutina.rutina_ejercicios}
                renderItem={renderEjercicioEnRutina}
                keyExtractor={(item) => item.id}
                onRefresh={refresh}
                refreshing={isLoading}
                ListHeaderComponent={<Text style={styles.title}>{rutina.description}</Text>}
                ListEmptyComponent={<Text style={styles.emptyText}>Esta rutina aún no tiene ejercicios.</Text>}
                />
            </View>

            {/* Modal para añadir ejercicio */}
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
                    >
                        <Picker.Item label="Selecciona un ejercicio..." value={null} />
                        {ejerciciosDisponibles.map((ej) => (
                            <Picker.Item label={ej.name} value={ej.id} key={ej.id} />
                        ))}
                    </Picker>

                    <TextInput placeholder="Sets (ej: 4)" value={sets} onChangeText={setSets} style={styles.input} keyboardType="numeric" />
                    <TextInput placeholder="Reps (ej: 10-12)" value={reps} onChangeText={setReps} style={styles.input} />
                    <TextInput placeholder="Descanso (segundos, ej: 60)" value={rest} onChangeText={setRest} style={styles.input} keyboardType="numeric" />

                    <Button title="Guardar" onPress={handleAddEjercicio} disabled={isLoading} />
                    <Button title="Cancelar" onPress={() => setModalVisible(false)} color="gray" />
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 18, padding: 15, textAlign: 'center', color: '#666' },
    emptyText: { textAlign: 'center', marginTop: 20, color: '#999' },
    ejercicioContainer: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
    ejercicioTitle: { fontSize: 16, fontWeight: 'bold' },
    // Estilos del Modal
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
    input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5, width: '100%' },
});