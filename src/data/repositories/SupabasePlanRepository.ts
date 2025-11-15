import { PlanRepository, AssignPlanParams } from '../../domain/repositories/PlanRepository';
import { PlanCompleto } from '../../domain/types/types';
import { PlanEntrenamiento } from '../../domain/entities/PlanEntrenamiento';
import { supabase } from '../../lib/supabase';

export class SupabasePlanRepository implements PlanRepository {

    async getMyPlan(userId: string): Promise<PlanCompleto | null> {
        // Esta es una consulta compleja que trae todo lo que 'mi-plan.tsx' necesita
        // 1. Trae el 'plan_entrenamiento' del usuario
        // 2. Hace "JOIN" con la 'rutina' de ese plan
        // 3. Hace "JOIN" con 'rutina_ejercicios' de esa rutina
        // 4. Hace "JOIN" con 'ejercicios' de esa rutina_ejercicios
        // ¡Todo en una sola consulta gracias a las relaciones de Supabase!

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
            .eq('user_id', userId)
            .maybeSingle(); // Puede que el usuario no tenga un plan (null)

        if (error) {
            console.error('Error fetching plan:', error.message);
            // Tu RLS "Users can see their own training plans" te protege aquí
            throw error;
        }

        // El tipado de Supabase es genérico, lo forzamos a nuestro tipo
        return data as PlanCompleto | null;
    }

    async assignPlan(params: AssignPlanParams): Promise<PlanEntrenamiento> {
    // NOTA: Si un usuario ya tiene un plan, esto asignará uno nuevo.
    // En una app real, quizás querrías usar .upsert() para reemplazar
    // el plan existente si 'user_id' fuera una clave única.
    // Pero según tu schema, un usuario puede tener múltiples planes
    // (lo cual está bien, podemos mostrar el más reciente).
    
    const { data, error } = await supabase
        .from('planes_entrenamiento')
        .insert(params)
        .select()
        .single();

    if (error) {
        console.error('Error assigning plan:', error.message);
        // ¡Tu RLS del Paso 0 protege esta inserción!
        throw error;
    }
    
    return data;
    }
}