import { Progreso } from '../entities/Progreso';
import { FileUpload } from './EjercicioRepository'; // Reutilizamos este tipo

export interface CreateProgresoParams {
    user_id: string;
    ejercicio_id: string;
    weight: number | null;
    reps: number | null;
    duration_seconds: number | null;
    notes: string | null;
    photoFile: FileUpload | null; // Opcional
}

export interface ProgresoRepository {
    // Para registrar el progreso
    createProgreso(params: CreateProgresoParams): Promise<Progreso>;

    // Para ver el historial de un ejercicio
    getProgresoByEjercicio(userId: string, ejercicioId: string): Promise<Progreso[]>;
}