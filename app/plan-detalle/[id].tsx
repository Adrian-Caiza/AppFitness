// app/plan-detalle/[id].tsx (¡Código COMPLETO!)

import { View, Text, StyleSheet, ActivityIndicator, FlatList, Button, Modal, TextInput, Image } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { useLocalSearchParams, Stack } from 'expo-router';
import { EjercicioEnRutina } from '../../src/domain/types/types';
import React, { useState } from 'react';
import { useProgreso } from '../../src/presentation/hooks/useProgreso';
import * as ImagePicker from 'expo-image-picker';
import { FileUpload } from '../../src/domain/repositories/EjercicioRepository';
import { Progreso } from '../../src/domain/entities/Progreso';
import * as FileSystem from 'expo-file-system/legacy';
import { usePlanDetalle } from '../../src/presentation/hooks/usePlanDetalle';

export default function PlanDetalleScreen() {
    const { id } = useLocalSearchParams();
    const planId = Array.isArray(id) ? id[0] : id;

    if (!planId) return <Text>ID de plan no encontrado.</Text>;

    const { plan, isLoading: planLoading } = usePlanDetalle(planId);

    // --- ¡Todo este estado es necesario para los modales! ---
    const [registrarModalVisible, setRegistrarModalVisible] = useState(false);
    const [historialModalVisible, setHistorialModalVisible] = useState(false);
    const [selectedEjercicio, setSelectedEjercicio] = useState<EjercicioEnRutina | null>(null);
    const { historial, isLoading: progresoLoading, fetchHistorial, createProgreso, pickImage } = useProgreso();
    const [weight, setWeight] = useState('');
    const [reps, setReps] = useState('');
    const [notes, setNotes] = useState('');
    const [photoAsset, setPhotoAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);

    // --- ¡Todas estas funciones son necesarias! ---
    const openRegistrarModal = (ejercicio: EjercicioEnRutina) => {
        setSelectedEjercicio(ejercicio);
        setRegistrarModalVisible(true);
        setWeight('');
        setReps('');
        setNotes('');
        setPhotoAsset(null);
    };

    const openHistorialModal = (ejercicio: EjercicioEnRutina) => {
        setSelectedEjercicio(ejercicio);
        fetchHistorial(ejercicio.ejercicio_id);
        setHistorialModalVisible(true);
    };

    const handlePickImage = async () => {
        const asset = await pickImage();
        if (asset) setPhotoAsset(asset);
    };

    const handleCreateProgreso = async () => {
        if (!selectedEjercicio) return;
        let photoFile: FileUpload | null = null;
        if (photoAsset) {
            const base64 = await FileSystem.readAsStringAsync(photoAsset.uri, {
                encoding: 'base64',
            });
            photoFile = {
                uri: photoAsset.uri,
                base64: base64,
                mimeType: photoAsset.mimeType || 'image/jpeg',
            };
        }

        await createProgreso(selectedEjercicio.ejercicio_id, {
            weight: weight ? parseFloat(weight) : null,
            reps: reps ? parseInt(reps) : null,
            notes: notes || null,
            duration_seconds: null,
            photoFile: photoFile,
        });
        setRegistrarModalVisible(false);
    };

    // --- ¡Estas funciones de renderizado son necesarias! ---
    const renderEjercicio = ({ item }: { item: EjercicioEnRutina }) => (
        <View style={styles.ejercicioContainer}>
            <Text style={styles.ejercicioTitle}>{item.ejercicios.name}</Text>
            <Text>Series: {item.sets || 'N/A'} | Reps: {item.reps || 'N/A'} | Descanso: {item.rest_time_seconds || 'N/A'} seg.</Text>
            {item.ejercicios.video_url && (
                <View style={styles.videoContainer}>
                    <Video
                        style={styles.video}
                        source={{ uri: item.ejercicios.video_url }}
                        useNativeControls
                        resizeMode={ResizeMode.CONTAIN}
                    />
                </View>
            )}
            <View style={styles.buttonRow}>
                <Button title="Registrar Progreso" onPress={() => openRegistrarModal(item)} />
                <Button title="Ver Historial" onPress={() => openHistorialModal(item)} />
            </View>
        </View>
    );

    const renderHistorialItem = ({ item }: { item: Progreso }) => (
        <View style={styles.historialItem}>
            <Text>{new Date(item.created_at).toLocaleDateString()}</Text>
            <Text>Peso: {item.weight || 'N/A'} kg | Reps: {item.reps || 'N/A'}</Text>
            {item.notes && <Text>Notas: {item.notes}</Text>}
            {item.photo_url && (
                <Image source={{ uri: item.photo_url }} style={styles.progressPhoto} />
            )}
        </View>
    );

    // --- (Lógica de carga) ---
    if (planLoading) {
        return <ActivityIndicator style={styles.centered} size="large" />;
    }

    if (!plan || !plan.rutinas) {
        return (
            <View style={styles.centered}>
                <Text>No se encontró el plan.</Text>
            </View>
        );
    }

    // --- ¡RETURN PRINCIPAL CON LOS MODALES COMPLETOS! ---
    return (
        <View style={{ flex: 1 }}>
            <Stack.Screen options={{ title: plan.rutinas.name, headerBackTitle: 'Planes' }} />

            <FlatList
                data={plan.rutinas.rutina_ejercicios}
                renderItem={renderEjercicio}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={<Text style={styles.planTitle}>{plan.rutinas.name}</Text>}
                ListEmptyComponent={<Text>Esta rutina aún no tiene ejercicios.</Text>}
                contentContainerStyle={styles.container}
            />

            {/* ¡Modal para REGISTRAR Progreso (COMPLETO)! */}
            <Modal visible={registrarModalVisible} onRequestClose={() => setRegistrarModalVisible(false)} animationType="slide">
                <View style={styles.modalView}>
                    <Text style={styles.modalTitle}>Registrar {selectedEjercicio?.ejercicios.name}</Text>
                    <TextInput placeholder="Peso (ej: 50)" value={weight} onChangeText={setWeight} style={styles.input} keyboardType="numeric" />
                    <TextInput placeholder="Reps (ej: 8)" value={reps} onChangeText={setReps} style={styles.input} keyboardType="numeric" />
                    <TextInput placeholder="Notas (opcional)" value={notes} onChangeText={setNotes} style={styles.input} multiline />

                    <Button title="Seleccionar Foto" onPress={handlePickImage} />
                    {photoAsset && <Image source={{ uri: photoAsset.uri }} style={styles.photoPreview} />}

                    <Button title="Guardar Progreso" onPress={handleCreateProgreso} disabled={progresoLoading} />
                    <Button title="Cancelar" onPress={() => setRegistrarModalVisible(false)} color="gray" />
                </View>
            </Modal>

            {/* ¡Modal para VER HISTORIAL (COMPLETO)! */}
            <Modal visible={historialModalVisible} onRequestClose={() => setHistorialModalVisible(false)} animationType="slide">
                <View style={styles.modalView}>
                    <Text style={styles.modalTitle}>Historial de {selectedEjercicio?.ejercicios.name}</Text>
                    {progresoLoading ? (
                        <ActivityIndicator />
                    ) : (
                        <FlatList
                            data={historial}
                            renderItem={renderHistorialItem}
                            keyExtractor={(item) => item.id}
                            ListEmptyComponent={<Text>No hay registros para este ejercicio.</Text>}
                        />
                    )}
                    <Button title="Cerrar" onPress={() => setHistorialModalVisible(false)} color="gray" />
                </View>
            </Modal>
        </View>
    );
}

// ¡Estilos completos!
const styles = StyleSheet.create({
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    container: { paddingBottom: 20 },
    planTitle: { fontSize: 22, fontWeight: 'bold', marginVertical: 15, textAlign: 'center' },
    ejercicioContainer: {
        padding: 15,
        borderWidth: 1, // Dejamos este borde para separar ejercicios
        borderColor: '#ddd',
        borderRadius: 8,
        marginHorizontal: 10,
        marginBottom: 10,
        backgroundColor: '#fff',
    },
    ejercicioTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
    videoContainer: { marginTop: 10, width: '100%', aspectRatio: 16 / 9, backgroundColor: 'black' },
    video: { width: '100%', height: '100%' },
    buttonRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 15 },
    modalView: {
        flex: 1,
        padding: 20,
        marginTop: 40,
    },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    input: { // ¡Estilo de input actualizado!
        borderBottomWidth: 1,
        borderColor: '#D1D1D6',
        padding: 10,
        marginBottom: 10,
        width: '100%',
        fontSize: 16,
    },
    photoPreview: { width: 100, height: 100, marginVertical: 10, alignSelf: 'center' },
    historialItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    progressPhoto: {
        width: '100%',
        height: 200,
        resizeMode: 'contain',
        marginTop: 10,
    },
});