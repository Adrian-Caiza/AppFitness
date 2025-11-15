import { User } from './User';

export interface ChatMessage {
    id: number; // bigserial
    sender_id: string; // uuid
    receiver_id: string; // uuid
    content: string;
    created_at: string;

    // Opcional: para mostrar el nombre del remitente en la UI
    sender?: Pick<User, 'full_name' | 'role'>;
}