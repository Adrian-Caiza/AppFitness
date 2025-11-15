import { Rutina } from '../entities/Rutina';
import { RutinaEjercicio } from '../entities/RutinaEjercicio';
import { RutinaCompleta } from '../types/types';

export interface CreateRutinaParams {
    name: string;
    description: string | null;
    trainer_id: string;
}

// ¡NUEVA INTERFAZ!
// Parámetros para añadir un ejercicio a una rutina
export interface AddEjercicioParams {
    rutina_id: string;
    ejercicio_id: string;
    sets: number | null;
    reps: string | null;
    rest_time_seconds: number | null;
}

export interface RutinaRepository {
    // Para la pantalla 'crear-rutina'
    getRutinasByTrainer(trainerId: string): Promise<Rutina[]>;
    createRutina(params: CreateRutinaParams): Promise<Rutina>;

    // ¡NUEVOS MÉTODOS!
    getRutinaDetallada(rutinaId: string): Promise<RutinaCompleta | null>;
    addEjercicioToRutina(params: AddEjercicioParams): Promise<RutinaEjercicio>;
}
