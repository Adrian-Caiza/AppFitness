import { RealtimeChannel } from '@supabase/supabase-js';
import { ChatMessage } from '../../domain/entities/ChatMessage';
import { ChatRepository } from '../../domain/repositories/ChatRepository';
import { supabase } from '../../lib/supabase';

export class SupabaseChatRepository implements ChatRepository {

    private channel: RealtimeChannel | null = null;

    async getMessages(senderId: string, receiverId: string): Promise<ChatMessage[]> {
        const { data, error } = await supabase
            .from('chat_messages')
            .select('*')
            .or(
                `and(sender_id.eq.${senderId},receiver_id.eq.${receiverId}),` +
                `and(sender_id.eq.${receiverId},receiver_id.eq.${senderId})`
            )
            .order('created_at', { ascending: false }); 

        if (error) {
            console.error('Error fetching messages:', error.message);
            throw error;
        }
        return data;
    }

    async sendMessage(senderId: string, receiverId: string, content: string): Promise<ChatMessage> {
        // Tu RLS "Users can send messages" protege esto
        const { data, error } = await supabase
            .from('chat_messages')
            .insert({
                sender_id: senderId,
                receiver_id: receiverId,
                content: content,
            })
            .select()
            .single();

        if (error) {
            console.error('Error sending message:', error.message);
            throw error;
        }
        return data;
    }

    subscribeToMessages(
        onNewMessage: (message: ChatMessage) => void
    ): () => void {

        // Tu SQL "ALTER PUBLICATION..." permite esto.
        // La RLS "Users can read messages..." filtra
        // automáticamente los mensajes que este cliente puede recibir.
        this.channel = supabase
            .channel('public:chat_messages')
            .on<ChatMessage>(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'chat_messages' },
                (payload) => {
                    // Recibimos el nuevo mensaje
                    const newMessage = payload.new;
                    onNewMessage(newMessage);
                }
            )
            .subscribe();

        // Devuelve la función de limpieza
        return () => {
            if (this.channel) {
                supabase.removeChannel(this.channel);
                this.channel = null;
            }
        };
    }
}