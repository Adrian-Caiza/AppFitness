import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Progreso } from '../../domain/entities/Progreso';
import { ProgresoRepository, CreateProgresoParams } from '../../domain/repositories/ProgresoRepository';
import { SupabaseProgresoRepository } from '../../data/repositories/SupabaseProgresoRepository';
import { useAuth } from '../context/AuthContext';
import { Alert } from 'react-native';
import { FileUpload } from '../../domain/repositories/EjercicioRepository';

// Instanciar el repositorio
const progresoRepository: ProgresoRepository = new SupabaseProgresoRepository();

export const useProgreso = () => {
    const { user } = useAuth();
    const [historial, setHistorial] = useState<Progreso[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Seleccionar foto de la galería
    const pickImage = async (): Promise<ImagePicker.ImagePickerAsset | null> => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permiso denegado', 'Necesitas dar permisos para acceder a las fotos.');
            return null;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.7,
            base64: true, // ¡CRUCIAL para subir!
        });

        if (result.canceled || !result.assets[0]) {
            return null;
        }

        return result.assets[0];
    };

    // Cargar el historial de un ejercicio
    const fetchHistorial = useCallback(async (ejercicioId: string) => {
        if (!user) return;

        setIsLoading(true);
        try {
            const data = await progresoRepository.getProgresoByEjercicio(user.id, ejercicioId);
            setHistorial(data);
        } catch (e: any) {
            Alert.alert('Error', 'No se pudo cargar el historial: ' + e.message);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    // Crear un nuevo registro de progreso
    const createProgreso = async (
        ejercicioId: string,
        params: Omit<CreateProgresoParams, 'user_id' | 'ejercicio_id'>
    ) => {
        if (!user) throw new Error('Usuario no autenticado');

        setIsLoading(true);
        try {
            await progresoRepository.createProgreso({
                ...params,
                user_id: user.id,
                ejercicio_id: ejercicioId,
            });
            // Opcional: Refrescar el historial después de crear
            // await fetchHistorial(ejercicioId);
            Alert.alert('Éxito', 'Progreso guardado.');

        } catch (e: any) {
            Alert.alert('Error', 'No se pudo guardar el progreso: ' + e.message);
            throw e;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        historial,
        isLoading,
        fetchHistorial,
        createProgreso,
        pickImage,
    };
};