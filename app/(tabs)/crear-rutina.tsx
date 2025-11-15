import { View, Text, TextInput, Button, FlatList, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useTrainerData } from '../../src/presentation/hooks/useTrainerData';
import { Rutina } from '../../src/domain/entities/Rutina';
import { Link } from 'expo-router';
import { Pressable } from 'react-native';

export default function CrearRutinaScreen() {
    const { rutinas, isLoading, createRutina, refreshRutinas } = useTrainerData();
    const [nombreRutina, setNombreRutina] = useState('');
    const [descripcion, setDescripcion] = useState('');

    const handleCrearRutina = async () => {
        if (!nombreRutina) {
            Alert.alert('Error', 'El nombre de la rutina es obligatorio.');
            return;
        }

        try {
            await createRutina({ name: nombreRutina, description: descripcion || null });
            setNombreRutina('');
            setDescripcion('');
            Alert.alert('Éxito', 'Rutina creada correctamente.');
        } catch (e: any) {
            Alert.alert('Error', e.message);
        }
    };

    const renderRutina = ({ item }: { item: Rutina }) => (
        <Link href={`/rutina/${item.id}`} asChild>
            <Pressable style={styles.itemContainer}>
                <Text style={styles.itemTitle}>{item.name}</Text>
                <Text>{item.description}</Text>
                <Text style={styles.verMas}>Ver/Editar {'->'}</Text>
            </Pressable>
        </Link>
    );

    return (
        <View style={styles.container}>
            {/* Formulario para crear nueva rutina */}
            <View style={styles.formContainer}>
                <Text style={styles.title}>Crear Nueva Rutina</Text>
                <TextInput
                    placeholder="Nombre de la Rutina"
                    value={nombreRutina}
                    onChangeText={setNombreRutina}
                    style={styles.input}
                />
                <TextInput
                    placeholder="Descripción (opcional)"
                    value={descripcion}
                    onChangeText={setDescripcion}
                    style={styles.input}
                />
                <Button title="Crear Rutina" onPress={handleCrearRutina} disabled={isLoading} />
            </View>

            {/* Lista de rutinas existentes */}
            <Text style={styles.title}>Mis Rutinas</Text>
            {isLoading && rutinas.length === 0 && <ActivityIndicator />}
            <FlatList
                data={rutinas}
                renderItem={renderRutina}
                keyExtractor={(item) => item.id}
                onRefresh={refreshRutinas}
                refreshing={isLoading}
                ListEmptyComponent={<Text>No tienes rutinas creadas.</Text>}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 10 },
    formContainer: { marginBottom: 20, padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 8 },
    title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
    input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 },
    itemContainer: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
    itemTitle: { fontSize: 16, fontWeight: 'bold' },
    verMas: { color: 'blue', marginTop: 5, textAlign: 'right' },
});