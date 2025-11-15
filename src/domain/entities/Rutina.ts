export interface Rutina {
    id: string; // uuid
    name: string;
    description: string | null;
    trainer_id: string; // uuid del trainer
}
