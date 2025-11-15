import { useState, useEffect, useCallback } from 'react';
import { PlanCompleto } from '../../domain/types/types';
import { PlanRepository } from '../../domain/repositories/PlanRepository';
import { SupabasePlanRepository } from '../../data/repositories/SupabasePlanRepository';
import { useAuth } from '../context/AuthContext';

// Instanciamos el repositorio
const planRepository: PlanRepository = new SupabasePlanRepository();

export const useUserPlan = () => {
    const { user } = useAuth();
    const [plan, setPlan] = useState<PlanCompleto | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Cargar el plan del usuario
    const fetchPlan = useCallback(async () => {
        if (!user || user.role !== 'user') {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const data = await planRepository.getMyPlan(user.id);
            setPlan(data);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    // Cargar el plan cuando el hook se monta
    useEffect(() => {
        fetchPlan();
    }, [fetchPlan]);

    return { plan, isLoading, refreshPlan: fetchPlan };
};
