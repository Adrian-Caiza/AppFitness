import { useState, useEffect } from 'react';
import { User } from '../../domain/entities/User';
import { ProfileRepository } from '../../domain/repositories/ProfileRepository';
import { SupabaseProfileRepository } from '../../data/repositories/SupabaseProfileRepository';
import { useAuth } from '../context/AuthContext';

// Instanciar repositorio
const profileRepository: ProfileRepository = new SupabaseProfileRepository();

export const useMyTrainers = () => {
    const { user } = useAuth();
    const [trainers, setTrainers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user && user.role === 'user') {
            setIsLoading(true);
            profileRepository.getMyTrainers(user.id)
                .then(setTrainers)
                .catch(e => console.error(e))
                .finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    }, [user]);

    return { trainers, isLoading };
};