import { View, Text, FlatList, StyleSheet, ActivityIndicator, Modal, Button, Alert } from 'react-native';
import { useClients } from '../../src/presentation/hooks/useClients';
import { User } from '../../src/domain/entities/User';
import { useState } from 'react';
import { Picker } from '@react-native-picker/picker';

export default function ClientsScreen() {
    const { clients, myRutinas, isLoading, refresh, assignPlan } = useClients();

    // Estado para manejar el modal
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedClient, setSelectedClient] = useState<User | null>(null);
    const [selectedRutinaId, setSelectedRutinaId] = useState<string | null>(null);

    // Abre el modal para asignar un plan a un cliente específico
    const openAssignModal = (client: User) => {
        if (myRutinas.length === 0) {
            Alert.alert('Error', 'Primero debes crear al menos una rutina.');
            return;
        }
        setSelectedClient(client);
        setSelectedRutinaId(myRutinas[0].id); // Pre-selecciona la primera rutina
        setModalVisible(true);
    };

    const handleAssignPlan = async () => {
        if (!selectedClient || !selectedRutinaId) {
            Alert.alert('Error', 'Cliente o rutina no seleccionados.');
            return;
        }

        try {
            await assignPlan(selectedClient.id, selectedRutinaId);
            setModalVisible(false);
            setSelectedClient(null);
            setSelectedRutinaId(null);
        } catch (e) {
            // El hook ya muestra la alerta
        }
    };

    // Renderiza cada cliente en la lista
    const renderClient = ({ item }: { item: User }) => (
        <View style={styles.itemContainer}>
            <View>
                <Text style={styles.itemTitle}>{item.full_name}</Text>
                <Text>{item.email}</Text>
            </View>
            <Button title="Asignar Plan" onPress={() => openAssignModal(item)} />
        </View>
    );

    if (isLoading && clients.length === 0) {
        return <ActivityIndicator style={styles.centered} size="large" />;
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={clients}
                renderItem={renderClient}
                keyExtractor={(item) => item.id}
                onRefresh={refresh}
                refreshing={isLoading}
                ListEmptyComponent={<Text style={styles.emptyText}>No se encontraron clientes.</Text>}
            />

            {/* Modal para Asignar Plan */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalView}>
                    <Text style={styles.modalTitle}>Asignar a {selectedClient?.full_name}</Text>
                    <Text>Selecciona una rutina:</Text>

                    <Picker
                        selectedValue={selectedRutinaId}
                        style={styles.picker}
                        onValueChange={(itemValue) => setSelectedRutinaId(itemValue)}
                    >
                        {myRutinas.map((rutina) => (
                            <Picker.Item label={rutina.name} value={rutina.id} key={rutina.id} />
                        ))}
                    </Picker>

                    <Button title="Confirmar Asignación" onPress={handleAssignPlan} disabled={isLoading} />
                    <Button title="Cancelar" onPress={() => setModalVisible(false)} color="gray" />
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { textAlign: 'center', marginTop: 20, color: '#999' },
    itemContainer: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemTitle: { fontSize: 16, fontWeight: 'bold' },
    // Estilos del Modal
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        marginTop: '50%',
    },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
    picker: { width: '100%', height: 150 },
});