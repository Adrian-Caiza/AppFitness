import { Ejercicio } from '../entities/Ejercicio';

// Tipo genérico para un archivo a subir
export interface FileUpload {
    uri: string;
    base64: string;
    mimeType: string;
}

// Parámetros para crear un ejercicio
export interface CreateEjercicioParams {
    name: string;
    description: string | null;
    trainer_id: string; // El ID del 'created_by'
    videoFile: FileUpload;
}

// El contrato
export interface EjercicioRepository {
    createEjercicio(params: CreateEjercicioParams): Promise<Ejercicio>;
    getEjerciciosByTrainer(trainerId: string): Promise<Ejercicio[]>;
}
