// src/presentation/hooks/usePlanDetalle.ts (¡Archivo NUEVO!)

import { useState, useEffect, useCallback } from 'react';
import { PlanCompleto } from '../../domain/types/types';
import { PlanRepository } from '../../domain/repositories/PlanRepository';
import { SupabasePlanRepository } from '../../data/repositories/SupabasePlanRepository';
import { useAuth } from '../context/AuthContext';

const planRepository: PlanRepository = new SupabasePlanRepository();

export const usePlanDetalle = (planId: string) => {
    const { user } = useAuth();
    const [plan, setPlan] = useState<PlanCompleto | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchPlan = useCallback(async () => {
        if (!user || !planId) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            // Llama a la nueva función de detalle
            const data = await planRepository.getPlanDetalle(planId, user.id);
            setPlan(data);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [user, planId]);

    useEffect(() => {
        fetchPlan();
    }, [fetchPlan]);

    return { plan, isLoading, refreshPlan: fetchPlan };
};