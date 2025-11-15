export interface PlanEntrenamiento {
    id: string; // uuid
    user_id: string;
    trainer_id: string;
    rutina_id: string;
    start_date: string; // date
    end_date: string | null; // date
}