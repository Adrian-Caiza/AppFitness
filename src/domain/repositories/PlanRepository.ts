import { PlanCompleto, PlanAsignado } from '../types/types';
import { PlanEntrenamiento } from '../entities/PlanEntrenamiento';

export interface AssignPlanParams {
    user_id: string;
    trainer_id: string;
    rutina_id: string;
    start_date: string;
}

export interface PlanRepository {
    // Para la pantalla 'mi-plan'
    // ¡CAMBIADO! Ahora devuelve una lista
    getMyPlans(userId: string): Promise<PlanAsignado[]>;

    // ¡NUEVO! Obtiene los detalles de un solo plan
    getPlanDetalle(planId: string, userId: string): Promise<PlanCompleto | null>;

    assignPlan(params: AssignPlanParams): Promise<PlanEntrenamiento>;

    // (Añadiremos más aquí después, como assignPlanToUser)
}
