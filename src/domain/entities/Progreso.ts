export interface Progreso {
    id: string; // uuid
    user_id: string;
    ejercicio_id: string;
    created_at: string;

    weight: number | null;
    reps: number | null;
    duration_seconds: number | null;
    notes: string | null;

    // Esta URL será un path en la BD, pero la
    // capa de datos la convertirá en una URL firmada
    photo_url: string | null;
}