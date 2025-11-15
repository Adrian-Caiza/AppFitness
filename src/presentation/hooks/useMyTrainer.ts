import { useState, useEffect } from 'react';
import { User } from '../../domain/entities/User';
import { ProfileRepository } from '../../domain/repositories/ProfileRepository';
import { SupabaseProfileRepository } from '../../data/repositories/SupabaseProfileRepository';
import { useAuth } from '../context/AuthContext';

// Instanciar repositorio
const profileRepository: ProfileRepository = new SupabaseProfileRepository();

export const useMyTrainer = () => {
    const { user } = useAuth();
    const [trainer, setTrainer] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user && user.role === 'user') {
            setIsLoading(true);
            profileRepository.getMyTrainer(user.id)
                .then(setTrainer)
                .catch(e => console.error(e))
                .finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    }, [user]);

    return { trainer, isLoading };
};