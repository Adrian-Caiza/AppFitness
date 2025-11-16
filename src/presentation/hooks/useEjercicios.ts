// src/presentation/hooks/useEjercicios.ts

import { useState, useEffect, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Ejercicio } from '../../domain/entities/Ejercicio';
import { EjercicioRepository, FileUpload } from '../../domain/repositories/EjercicioRepository';
import { SupabaseEjercicioRepository } from '../../data/repositories/SupabaseEjercicioRepository';
import { useAuth } from '../context/AuthContext';
import { Alert, Linking } from 'react-native'; // Importar Alert y Linking
import * as FileSystem from 'expo-file-system/legacy'; // ¡Usar la importación 'legacy'!

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
     * Función para que la UI llame al selector de video (CORREGIDA)
     */
    const pickVideo = async (): Promise<ImagePicker.ImagePickerAsset | null> => {

        // 1. Comprobar estado del permiso
        let currentStatus = await ImagePicker.getMediaLibraryPermissionsAsync();

        // 2. Pedir si es 'undetermined'
        if (currentStatus.status === ImagePicker.PermissionStatus.UNDETERMINED) {
            const { status: requestedStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            currentStatus.status = requestedStatus;
        }

        // 3. Enviar a configuración si está 'denied'
        if (currentStatus.status === ImagePicker.PermissionStatus.DENIED) {
            Alert.alert(
                'Permiso Requerido',
                'Necesitas dar permisos a la galería para subir un video. Por favor, habilítalos en la configuración de tu dispositivo.',
                [
                    { text: 'Ir a Configuración', onPress: () => Linking.openSettings() },
                    { text: 'Cancelar', style: 'cancel' }
                ]
            );
            return null;
        }

        // 4. Abrir la galería
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Videos,
            allowsEditing: true,
            quality: 0.7,
            base64: false, // ¡No pedir base64 aquí!
        });

        if (result.canceled || !result.assets[0]) {
            return null;
        }

        return result.assets[0];
    };

    /**
     * Función para crear el ejercicio (CORREGIDA)
     */
    const createEjercicio = async (params: FormParams) => {
        if (!user) throw new Error('Usuario no autenticado');

        setIsLoading(true);
        try {
            // 1. Leer el archivo desde la 'uri'
            const base64 = await FileSystem.readAsStringAsync(params.videoAsset.uri, {
                encoding: 'base64', // ¡Usar la cadena 'base64'!
            });

            // 2. Mapear a FileUpload
            const videoFile: FileUpload = {
                uri: params.videoAsset.uri,
                base64: base64, // ¡Usar el base64 leído!
                mimeType: params.videoAsset.mimeType || 'video/mp4',
            };

            // 3. Llamar al repositorio
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
            throw e;
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