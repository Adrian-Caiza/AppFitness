import { Ejercicio } from '../entities/Ejercicio';
import { PlanEntrenamiento } from '../entities/PlanEntrenamiento';
import { Rutina } from '../entities/Rutina';
import { RutinaEjercicio } from '../entities/RutinaEjercicio';

// Un ejercicio dentro de una rutina (con sets, reps, etc.)
export interface EjercicioEnRutina extends RutinaEjercicio {
    ejercicios: Ejercicio; // El ejercicio completo
}

// Una rutina completa con todos sus ejercicios
export interface RutinaCompleta extends Rutina {
    rutina_ejercicios: EjercicioEnRutina[];
}

// El plan completo de un usuario
export interface PlanCompleto extends PlanEntrenamiento {
    rutinas: RutinaCompleta; // La rutina completa asignada
}

// Para la lista de planes, solo necesitamos los nombres.
export interface PlanAsignado {
    id: string; // ID del plan
    rutinas: {
        name: string; // Nombre de la rutina
    };
    profiles: {
        full_name: string; // Nombre del entrenador
    };
}
