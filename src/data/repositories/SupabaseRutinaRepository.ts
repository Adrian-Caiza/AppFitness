import { Rutina } from '../../domain/entities/Rutina';
import { AddEjercicioParams, CreateRutinaParams, RutinaRepository } from '../../domain/repositories/RutinaRepository';
import { RutinaEjercicio } from '../../domain/entities/RutinaEjercicio';
import { RutinaCompleta } from '../../domain/types/types';
import { supabase } from '../../lib/supabase';

export class SupabaseRutinaRepository implements RutinaRepository {

    async getRutinasByTrainer(trainerId: string): Promise<Rutina[]> {
        const { data, error } = await supabase
            .from('rutinas')
            .select('*')
            .eq('trainer_id', trainerId);

        if (error) {
            console.error('Error fetching rutinas:', error.message);
            throw error;
        }

        return data || [];
    }

    async createRutina(params: CreateRutinaParams): Promise<Rutina> {
        const { data, error } = await supabase
            .from('rutinas')
            .insert(params)
            .select()
            .single(); // Devuelve el objeto creado

        if (error) {
            console.error('Error creating rutina:', error.message);
            // ¡Tu RLS de "Trainers can create routines" te protege aquí!
            // Si un 'user' intenta esto, fallará.
            throw error;
        }

        return data;
    }

    // ¡NUEVO MÉTODO!
    async getRutinaDetallada(rutinaId: string): Promise<RutinaCompleta | null> {
        // Esta consulta trae la rutina Y hace JOIN con sus ejercicios
        const { data, error } = await supabase
            .from('rutinas')
            .select(`
        *,
        rutina_ejercicios (
          *,
            ejercicios (*)
        )
    `)
            .eq('id', rutinaId)
            .single();

        if (error) {
            console.error('Error fetching rutina detallada:', error.message);
            throw error;
        }

        return data as RutinaCompleta | null;
    }

    // ¡NUEVO MÉTODO!
    async addEjercicioToRutina(params: AddEjercicioParams): Promise<RutinaEjercicio> {
        const { data, error } = await supabase
            .from('rutina_ejercicios')
            .insert(params)
            .select()
            .single();

        if (error) {
            console.error('Error adding ejercicio:', error.message);
            // ¡Tu RLS del Paso 0 te protege aquí!
            throw error;
        }

        return data;
    }
}
