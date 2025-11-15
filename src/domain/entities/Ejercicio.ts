export interface Ejercicio {
    id: string; // uuid
    name: string;
    description: string | null;
    video_url: string | null;
    created_by: string; // uuid del trainer
}
