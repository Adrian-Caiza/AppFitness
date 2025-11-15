import { useState, useEffect, useCallback } from 'react';
import { ChatMessage } from '../../domain/entities/ChatMessage';
import { ChatRepository } from '../../domain/repositories/ChatRepository';
import { SupabaseChatRepository } from '../../data/repositories/SupabaseChatRepository';
import { useAuth } from '../context/AuthContext';
import { Alert } from 'react-native';

// Instanciar repositorio
const chatRepository: ChatRepository = new SupabaseChatRepository();

export const useChatSession = (receiverId: string) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Cargar historial
    useEffect(() => {
        if (!user) return;

        setIsLoading(true);
        chatRepository.getMessages(user.id, receiverId)
            .then(setMessages)
            .catch(e => Alert.alert('Error', 'No se pudo cargar el chat'))
            .finally(() => setIsLoading(false));
    }, [user, receiverId]);

    // Suscribirse a Realtime
    useEffect(() => {
        const unsubscribe = chatRepository.subscribeToMessages((newMessage) => {
            // Filtra solo mensajes de esta conversación
            const myId = user?.id;
            if (
                (newMessage.sender_id === myId && newMessage.receiver_id === receiverId) ||
                (newMessage.sender_id === receiverId && newMessage.receiver_id === myId)
            ) {
                setMessages((currentMessages) => [newMessage, ...currentMessages]);
            }
        });

        // Limpiar al desmontar
        return () => unsubscribe();
    }, [user, receiverId]);

    // Función para enviar mensaje
    const sendMessage = useCallback(async (content: string) => {
        if (!user || !content.trim()) return;

        try {
            // No necesitamos añadir el mensaje al estado local
            // porque el listener de Realtime lo capturará (incluyendo nuestros propios mensajes)
            // y lo añadirá al estado.
            await chatRepository.sendMessage(user.id, receiverId, content);
        } catch (e: any) {
            Alert.alert('Error', 'No se pudo enviar el mensaje: ' + e.message);
        }
    }, [user, receiverId]);

    return { messages, isLoading, sendMessage };
};