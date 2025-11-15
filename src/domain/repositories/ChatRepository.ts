import { ChatMessage } from '../entities/ChatMessage';

export interface ChatRepository {
    /** Obtiene el historial de mensajes entre dos usuarios */
    getMessages(senderId: string, receiverId: string): Promise<ChatMessage[]>;

    /** Envía un nuevo mensaje */
    sendMessage(senderId: string, receiverId: string, content: string): Promise<ChatMessage>;

    /**
     * Se suscribe a nuevos mensajes.
     * Devuelve una función para des-suscribirse.
     */
    subscribeToMessages(
        onNewMessage: (message: ChatMessage) => void
    ): () => void;
}