import { PlanCompleto } from '../types/types';
import { PlanEntrenamiento } from '../entities/PlanEntrenamiento';

export interface AssignPlanParams {
    user_id: string;
    trainer_id: string;
    rutina_id: string;
    start_date: string; 
}

export interface PlanRepository {
    // Para la pantalla 'mi-plan'
    getMyPlan(userId: string): Promise<PlanCompleto | null>;

    assignPlan(params: AssignPlanParams): Promise<PlanEntrenamiento>;

    // (Añadiremos más aquí después, como assignPlanToUser)
}
