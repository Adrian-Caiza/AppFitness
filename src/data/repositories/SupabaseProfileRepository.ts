import { User } from '../../domain/entities/User';
import { ProfileRepository } from '../../domain/repositories/ProfileRepository';
import { supabase } from '../../lib/supabase';

export class SupabaseProfileRepository implements ProfileRepository {

    async getClientList(): Promise<User[]> {
        // Tu RLS "Allow users to see all profiles" permite esta consulta
        const { data, error } = await supabase
            .from('profiles')
            .select('id, full_name, role, email:dummy_email_field') // email no está en tu 'profiles'
            .eq('role', 'user'); // Traer solo a los clientes

        if (error) {
            console.error('Error fetching client list:', error.message);
            throw error;
        }

        // Adaptar los datos a la entidad User.
        // Nota: 'email' no está en tu tabla 'profiles', así que lo omitimos
        // o lo ponemos como 'dummy'. Lo mejor es modificar tu entidad User
        // o tu tabla 'profiles' para que coincidan.
        // Por ahora, asumiré que 'email' no es vital para esta lista.
        return data.map(p => ({
            id: p.id,
            full_name: p.full_name,
            role: p.role,
            email: '' // Opcional: hacer un JOIN con auth.users para obtener el email
        })) as User[];
    }

    async getMyTrainer(userId: string): Promise<User | null> {
        // 1. Busca en 'planes_entrenamiento' quién es el entrenador de este usuario
        const { data: planData, error: planError } = await supabase
            .from('planes_entrenamiento')
            .select('trainer_id')
            .eq('user_id', userId)
            .limit(1) // Asumimos que solo tiene un entrenador
            .single();

        if (planError || !planData) {
            console.log('User has no trainer assigned.');
            return null;
        }

        // 2. Busca el perfil de ese entrenador
        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('id, full_name, role') // Omitimos email por ahora
            .eq('id', planData.trainer_id)
            .single();

        if (profileError) {
            console.error('Error fetching trainer profile:', profileError.message);
            return null;
        }

        // Asignación con email vacío (ya que 'profiles' no lo tiene)
        return { ...profileData, email: '' } as User;
    }
}