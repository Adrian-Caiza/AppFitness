export interface RutinaEjercicio {
    id: string; // uuid
    rutina_id: string;
    ejercicio_id: string;
    sets: number | null;
    reps: string | null;
    rest_time_seconds: number | null;
}