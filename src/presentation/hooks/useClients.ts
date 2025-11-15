import { useState, useEffect, useCallback } from 'react';
import { User } from '../../domain/entities/User';
import { Rutina } from '../../domain/entities/Rutina';
import { ProfileRepository } from '../../domain/repositories/ProfileRepository';
import { RutinaRepository } from '../../domain/repositories/RutinaRepository';
import { PlanRepository } from '../../domain/repositories/PlanRepository';
import { SupabaseProfileRepository } from '../../data/repositories/SupabaseProfileRepository';
import { SupabaseRutinaRepository } from '../../data/repositories/SupabaseRutinaRepository';
import { SupabasePlanRepository } from '../../data/repositories/SupabasePlanRepository';
import { useAuth } from '../context/AuthContext';
import { Alert } from 'react-native';

// Instanciar todos los repositorios necesarios
const profileRepository: ProfileRepository = new SupabaseProfileRepository();
const rutinaRepository: RutinaRepository = new SupabaseRutinaRepository();
const planRepository: PlanRepository = new SupabasePlanRepository();

export const useClients = () => {
    const { user } = useAuth();
    const [clients, setClients] = useState<User[]>([]);
    const [myRutinas, setMyRutinas] = useState<Rutina[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Cargar clientes y rutinas en paralelo
    const fetchData = useCallback(async () => {
        if (!user || user.role !== 'trainer') return;

        setIsLoading(true);
        try {
            const [clientData, rutinaData] = await Promise.all([
                profileRepository.getClientList(),
                rutinaRepository.getRutinasByTrainer(user.id)
            ]);
            setClients(clientData);
            setMyRutinas(rutinaData);
        } catch (e: any) {
            Alert.alert('Error', 'No se pudieron cargar los datos: ' + e.message);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Función para asignar el plan
    const assignPlan = async (clientId: string, rutinaId: string) => {
        if (!user) throw new Error('No autenticado');

        setIsLoading(true);
        try {
            await planRepository.assignPlan({
                user_id: clientId,
                rutina_id: rutinaId,
                trainer_id: user.id,
                start_date: new Date().toISOString().split('T')[0], // 'YYYY-MM-DD'
            });
            Alert.alert('Éxito', 'Plan asignado correctamente.');
        } catch (e: any) {
            Alert.alert('Error', 'No se pudo asignar el plan: ' + e.message);
            throw e;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        clients,
        myRutinas, // La lista de rutinas para el <Picker>
        isLoading,
        refresh: fetchData,
        assignPlan,
    };
};