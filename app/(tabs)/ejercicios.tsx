import { View, Text, TextInput, Button, FlatList, StyleSheet, Alert, ActivityIndicator, Image } from 'react-native';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { useEjercicios } from '../../src/presentation/hooks/useEjercicios';
import { Ejercicio } from '../../src/domain/entities/Ejercicio';

export default function EjerciciosScreen() {
    const { ejercicios, isLoading, fetchEjercicios, pickVideo, createEjercicio } = useEjercicios();

    // Estado del formulario
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [videoAsset, setVideoAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);

    const handlePickVideo = async () => {
        const asset = await pickVideo();
        if (asset) {
            setVideoAsset(asset);
        }
    };

    const handleCreate = async () => {
        if (!name || !videoAsset) {
            Alert.alert('Campos incompletos', 'El nombre y el video son obligatorios.');
            return;
        }

        try {
            await createEjercicio({
                name,
                description: description || null,
                videoAsset,
            });
            // Limpiar formulario
            setName('');
            setDescription('');
            setVideoAsset(null);
        } catch (e) {
            // El hook ya maneja la alerta de error
        }
    };

    // Renderiza cada ejercicio en la lista
    const renderEjercicio = ({ item }: { item: Ejercicio }) => (
        <View style={styles.itemContainer}>
            <Text style={styles.itemTitle}>{item.name}</Text>
            {/* Podríamos mostrar un thumbnail si la URL lo permite */}
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Formulario de Creación */}
            <View style={styles.formContainer}>
                <Text style={styles.title}>Crear Nuevo Ejercicio</Text>
                <TextInput
                    placeholder="Nombre del Ejercicio"
                    value={name}
                    onChangeText={setName}
                    style={styles.input}
                />
                <TextInput
                    placeholder="Descripción (opcional)"
                    value={description}
                    onChangeText={setDescription}
                    style={styles.input}
                />

                <View style={styles.videoPicker}>
                    <Button title="Seleccionar Video" onPress={handlePickVideo} />
                    {videoAsset && (
                        <Text style={styles.videoText}>Video: {videoAsset.fileName || 'seleccionado.mp4'}</Text>
                    )}
                </View>

                <Button title="Crear Ejercicio" onPress={handleCreate} disabled={isLoading} />
                {isLoading && <ActivityIndicator style={{ marginTop: 10 }} />}
            </View>

            {/* Lista de Ejercicios Creados */}
            <Text style={styles.title}>Mis Ejercicios Creados</Text>
            <FlatList
                data={ejercicios}
                renderItem={renderEjercicio}
                keyExtractor={(item) => item.id}
                onRefresh={fetchEjercicios}
                refreshing={isLoading}
                ListEmptyComponent={<Text>No has creado ningún ejercicio.</Text>}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 10 },
    formContainer: {
        marginBottom: 20,
        padding: 15,
        borderRadius: 10,
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 3,
    },
    title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
    input: {
        borderBottomWidth: 1,
        borderColor: '#D1D1D6',
        padding: 10,
        marginBottom: 10,
        fontSize: 16
    },
    videoPicker: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    videoText: { fontStyle: 'italic', maxWidth: '45%' },
    itemContainer: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#eee', backgroundColor: 'white' },
    itemTitle: { fontSize: 16, fontWeight: 'bold' },
});