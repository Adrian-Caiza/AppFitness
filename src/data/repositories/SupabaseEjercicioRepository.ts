import { decode } from 'base64-arraybuffer'; // npx expo install base64-arraybuffer
import { Ejercicio } from '../../domain/entities/Ejercicio';
import {
    CreateEjercicioParams,
    EjercicioRepository,
} from '../../domain/repositories/EjercicioRepository';
import { supabase } from '../../lib/supabase';

export class SupabaseEjercicioRepository implements EjercicioRepository {

    /**
     * Paso 1: Sube el video a Supabase Storage
     */
    private async uploadVideo(
        trainerId: string,
        videoFile: CreateEjercicioParams['videoFile']
    ): Promise<string> {

        // 1. Decodificar el base64 a un ArrayBuffer
        const fileBuffer = decode(videoFile.base64);

        // 2. Crear un path único (ej: trainerId/timestamp.mp4)
        const fileExtension = videoFile.mimeType.split('/')[1] || 'mp4';
        const filePath = `${trainerId}/${new Date().getTime()}.${fileExtension}`;

        // 3. Subir el archivo al bucket 'videos_ejercicios'
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('videos_ejercicios') // Nombre de tu bucket
            .upload(filePath, fileBuffer, {
                contentType: videoFile.mimeType,
            });

        if (uploadError) {
            console.error('Error uploading video:', uploadError.message);
            throw uploadError;
        }

        // 4. Obtener la URL pública del archivo subido
        const { data: publicUrlData } = supabase.storage
            .from('videos_ejercicios')
            .getPublicUrl(uploadData.path);

        return publicUrlData.publicUrl;
    }

    /**
     * Paso 2: Crea el registro en la tabla 'ejercicios'
     */
    async createEjercicio(params: CreateEjercicioParams): Promise<Ejercicio> {

        // Primero, sube el video
        const videoUrl = await this.uploadVideo(params.trainer_id, params.videoFile);

        // Luego, inserta el registro en la tabla 'ejercicios'
        const { data, error } = await supabase
            .from('ejercicios')
            .insert({
                name: params.name,
                description: params.description,
                video_url: videoUrl,
                created_by: params.trainer_id,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating ejercicio:', error.message);
            // Gracias al RLS del "Paso 0", esto fallará si un 'user' lo intenta
            throw error;
        }

        return data;
    }

    /**
     * Obtiene todos los ejercicios creados por un entrenador
     */
    async getEjerciciosByTrainer(trainerId: string): Promise<Ejercicio[]> {
        const { data, error } = await supabase
            .from('ejercicios')
            .select('*')
            .eq('created_by', trainerId)
            .order('name', { ascending: true });

        if (error) {
            console.error('Error fetching ejercicios:', error.message);
            throw error;
        }

        return data || [];
    }
}
