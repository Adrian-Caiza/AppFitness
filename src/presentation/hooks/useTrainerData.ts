import { useState, useEffect, useCallback } from 'react';
import { Rutina } from '../../domain/entities/Rutina';
import { CreateRutinaParams, RutinaRepository } from '../../domain/repositories/RutinaRepository';
import { SupabaseRutinaRepository } from '../../data/repositories/SupabaseRutinaRepository';
import { useAuth } from '../context/AuthContext';

// Instanciamos el repositorio
const rutinaRepository: RutinaRepository = new SupabaseRutinaRepository();

export const useTrainerData = () => {
    const { user } = useAuth();
    const [rutinas, setRutinas] = useState<Rutina[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Cargar las rutinas del entrenador
    const fetchRutinas = useCallback(async () => {
        if (!user || user.role !== 'trainer') return;

        setIsLoading(true);
        try {
            const data = await rutinaRepository.getRutinasByTrainer(user.id);
            setRutinas(data);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    // Crear una nueva rutina
    const createRutina = async (params: Omit<CreateRutinaParams, 'trainer_id'>) => {
        if (!user) throw new Error('User not authenticated');

        setIsLoading(true);
        try {
            const newRutina = await rutinaRepository.createRutina({
                ...params,
                trainer_id: user.id,
            });
            // Añadir la nueva rutina a la lista local
            setRutinas((current) => [newRutina, ...current]);
        } catch (e: any) {
            console.error(e);
            throw new Error(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Cargar rutinas cuando el hook se monta
    useEffect(() => {
        fetchRutinas();
    }, [fetchRutinas]);

    return { rutinas, isLoading, createRutina, refreshRutinas: fetchRutinas };
};
