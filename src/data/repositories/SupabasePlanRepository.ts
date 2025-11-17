// src/data/repositories/SupabasePlanRepository.ts

import { PlanRepository, AssignPlanParams } from '../../domain/repositories/PlanRepository';
import { PlanCompleto, PlanAsignado } from '../../domain/types/types';
import { PlanEntrenamiento } from '../../domain/entities/PlanEntrenamiento';
import { supabase } from '../../lib/supabase';

export class SupabasePlanRepository implements PlanRepository {

    // ¡CAMBIADO! Ahora se llama getMyPlans y devuelve un array
    async getMyPlans(userId: string): Promise<PlanAsignado[]> {

        const { data, error } = await supabase
            .from('planes_entrenamiento')
            // ¡INICIO DE LA CORRECCIÓN!
            .select(`
        id,
        rutinas!inner ( name ),
        profiles:trainer_id!inner ( full_name ) 
        `)
            // ¡FIN DE LA CORRECCIÓN!
            .eq('user_id', userId)
            .order('start_date', { ascending: false });

        if (error) {
            console.error('Error fetching plans list:', error.message);
            throw error;
        }

        // Ahora 'data' SÍ coincide con la interfaz PlanAsignado
        return data as unknown as PlanAsignado[];
    }

    // ¡NUEVA FUNCIÓN! Esta es tu consulta ANTERIOR, pero más segura
    async getPlanDetalle(planId: string, userId: string): Promise<PlanCompleto | null> {

        const { data, error } = await supabase
            .from('planes_entrenamiento')
            .select(`
        *,
        rutinas (
          *,
          rutina_ejercicios (
            *,
            ejercicios (*)
          )
        )
      `)
            .eq('id', planId) // Busca el ID del plan específico
            .eq('user_id', userId) // ¡Seguridad! Asegura que el usuario sea el dueño
            .single();

        if (error) {
            console.error('Error fetching plan detail:', error.message);
            throw error;
        }

        return data as PlanCompleto | null;
    }

    // Esta función se queda igual
    async assignPlan(params: AssignPlanParams): Promise<PlanEntrenamiento> {
        // ... (código existente sin cambios) ...
        const { data, error } = await supabase
            .from('planes_entrenamiento')
            .insert(params)
            .select()
            .single();

        if (error) {
            console.error('Error assigning plan:', error.message);
            throw error;
        }

        return data;
    }
}