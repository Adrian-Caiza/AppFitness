// Define el tipo de rol basado en tu SQL
export type UserRole = 'trainer' | 'user';

export interface User {
    id: string;
    email: string;
    full_name: string | null;
    role: UserRole;
}