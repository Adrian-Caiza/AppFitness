// src/presentation/hooks/useUserPlans.ts (Archivo renombrado)

import { useState, useEffect, useCallback } from 'react';
import { PlanAsignado } from '../../domain/types/types';
import { PlanRepository } from '../../domain/repositories/PlanRepository';
import { SupabasePlanRepository } from '../../data/repositories/SupabasePlanRepository';
import { useAuth } from '../context/AuthContext';

const planRepository: PlanRepository = new SupabasePlanRepository();

export const useUserPlans = () => {
    const { user } = useAuth();
    const [plans, setPlans] = useState<PlanAsignado[]>([]); // Ahora es un array
    const [isLoading, setIsLoading] = useState(true);

    const fetchPlans = useCallback(async () => {
        if (!user || user.role !== 'user') {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const data = await planRepository.getMyPlans(user.id); // Llama a la nueva función
            setPlans(data);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchPlans();
    }, [fetchPlans]);

    return { plans, isLoading, refreshPlans: fetchPlans };
};