import { useState, useEffect, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker'; // npx expo install expo-image-picker
import { Ejercicio } from '../../domain/entities/Ejercicio';
import { EjercicioRepository, FileUpload } from '../../domain/repositories/EjercicioRepository';
import { SupabaseEjercicioRepository } from '../../data/repositories/SupabaseEjercicioRepository';
import { useAuth } from '../context/AuthContext';
import { Alert } from 'react-native';

// Instanciar el repositorio
const ejercicioRepository: EjercicioRepository = new SupabaseEjercicioRepository();

// Tipo para los parámetros del formulario
interface FormParams {
    name: string;
    description: string | null;
    videoAsset: ImagePicker.ImagePickerAsset;
}

export const useEjercicios = () => {
    const { user } = useAuth();
    const [ejercicios, setEjercicios] = useState<Ejercicio[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Cargar los ejercicios del entrenador
    const fetchEjercicios = useCallback(async () => {
        if (!user || user.role !== 'trainer') return;

        setIsLoading(true);
        try {
            const data = await ejercicioRepository.getEjerciciosByTrainer(user.id);
            setEjercicios(data);
        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'No se pudieron cargar los ejercicios.');
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    // Cargar ejercicios al montar el hook
    useEffect(() => {
        fetchEjercicios();
    }, [fetchEjercicios]);

    /**
     * Función para que la UI llame al selector de video
     */
    const pickVideo = async (): Promise<ImagePicker.ImagePickerAsset | null> => {
        // Pedir permiso
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permiso denegado', 'Necesitas dar permisos para acceder a los videos.');
            return null;
        }

        // Lanzar el selector
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Videos,
            allowsEditing: true,
            quality: 0.7,
            base64: true, // ¡CRUCIAL! Necesitamos el base64 para subirlo
        });

        if (result.canceled || !result.assets[0]) {
            return null;
        }

        return result.assets[0];
    };

    /**
     * Función para crear el ejercicio
     */
    const createEjercicio = async (params: FormParams) => {
        if (!user) throw new Error('Usuario no autenticado');

        setIsLoading(true);
        try {
            // Mapear el Asset de ImagePicker al tipo FileUpload del dominio
            const videoFile: FileUpload = {
                uri: params.videoAsset.uri,
                base64: params.videoAsset.base64!,
                mimeType: params.videoAsset.mimeType || 'video/mp4',
            };

            const newEjercicio = await ejercicioRepository.createEjercicio({
                name: params.name,
                description: params.description,
                trainer_id: user.id,
                videoFile: videoFile,
            });

            // Actualizar el estado local
            setEjercicios((current) => [newEjercicio, ...current]);
            Alert.alert('Éxito', 'Ejercicio creado correctamente.');

        } catch (e: any) {
            console.error(e);
            Alert.alert('Error', 'No se pudo crear el ejercicio: ' + e.message);
            throw e; // Relanzar para que la UI sepa que falló
        } finally {
            setIsLoading(false);
        }
    };

    return {
        ejercicios,
        isLoading,
        fetchEjercicios,
        pickVideo,
        createEjercicio,
    };
};