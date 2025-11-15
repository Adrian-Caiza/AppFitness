import { decode } from 'base64-arraybuffer';
import { Progreso } from '../../domain/entities/Progreso';
import { CreateProgresoParams, ProgresoRepository } from '../../domain/repositories/ProgresoRepository';
import { FileUpload } from '../../domain/repositories/EjercicioRepository';
import { supabase } from '../../lib/supabase';

export class SupabaseProgresoRepository implements ProgresoRepository {

    /**
     * Sube una foto de progreso al bucket 'fotos_progreso'.
     * Devuelve el 'path' del archivo, no una URL pública.
     */
    private async uploadPhoto(
        userId: string,
        photoFile: FileUpload
    ): Promise<string> {

        const fileBuffer = decode(photoFile.base64);
        const fileExtension = photoFile.mimeType.split('/')[1] || 'jpg';
        const filePath = `${userId}/${new Date().getTime()}.${fileExtension}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('fotos_progreso') // Bucket NO público
            .upload(filePath, fileBuffer, {
                contentType: photoFile.mimeType,
            });

        if (uploadError) {
            console.error('Error uploading photo:', uploadError.message);
            throw uploadError;
        }

        // Devolvemos solo el path, NO la URL pública
        return uploadData.path;
    }

    /**
     * Crea un nuevo registro de progreso
     */
    async createProgreso(params: CreateProgresoParams): Promise<Progreso> {
        let photoPath: string | null = null;

        // 1. Si hay foto, subirla primero
        if (params.photoFile) {
            photoPath = await this.uploadPhoto(params.user_id, params.photoFile);
        }

        // 2. Crear el registro en la BD
        const { data, error } = await supabase
            .from('progreso')
            .insert({
                user_id: params.user_id,
                ejercicio_id: params.ejercicio_id,
                weight: params.weight,
                reps: params.reps,
                duration_seconds: params.duration_seconds,
                notes: params.notes,
                photo_url: photoPath, // Guardamos el 'path'
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating progreso:', error.message);
            // ¡Tu RLS del Paso 0 protege esta inserción!
            throw error;
        }

        return data;
    }

    /**
     * Obtiene el historial de progreso y genera URLs firmadas
     * para las fotos de forma segura.
     */
    async getProgresoByEjercicio(userId: string, ejercicioId: string): Promise<Progreso[]> {

        // 1. Obtener los registros de progreso
        const { data: progresos, error } = await supabase
            .from('progreso')
            .select('*')
            .eq('user_id', userId)
            .eq('ejercicio_id', ejercicioId)
            .order('created_at', { ascending: false }); // Más reciente primero

        if (error) {
            console.error('Error fetching progreso:', error.message);
            throw error;
        }

        if (!progresos) return [];

        // 2. Generar URLs firmadas para las fotos (¡La parte segura!)
        const progresosConUrls = await Promise.all(
            progresos.map(async (progreso) => {
                if (progreso.photo_url) { // 'photo_url' es en realidad un 'path'
                    const { data, error: urlError } = await supabase.storage
                        .from('fotos_progreso')
                        .createSignedUrl(progreso.photo_url, 3600); // URL válida por 1 hora

                    if (urlError) {
                        console.error('Error creating signed URL:', urlError.message);
                        // Si falla, solo deja la URL nula
                        progreso.photo_url = null;
                    } else {
                        progreso.photo_url = data.signedUrl;
                    }
                }
                return progreso;
            })
        );

        return progresosConUrls as Progreso[];
    }
}