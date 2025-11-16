import { User } from '../entities/User';

export interface ProfileRepository {
    // Obtiene todos los perfiles que tienen el rol de 'user'
    getClientList(): Promise<User[]>;

    getMyTrainers(userId: string): Promise<User[]>;
}


