import { View, Text, TextInput, Button, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useChatSession } from '../../src/presentation/hooks/useChatSession';
import { useAuth } from '../../src/presentation/context/AuthContext';
import { useState } from 'react';
import { ChatMessage } from '../../src/domain/entities/ChatMessage';

export default function ChatSessionScreen() {
    const { id: receiverId } = useLocalSearchParams(); // ID de la persona con la que chateamos
    const { user: me } = useAuth();
    const { messages, isLoading, sendMessage } = useChatSession(receiverId as string);

    const [content, setContent] = useState('');

    const handleSend = () => {
        sendMessage(content);
        setContent(''); // Limpiar input
    };

    const renderMessage = ({ item }: { item: ChatMessage }) => {
        const isMyMessage = item.sender_id === me?.id;
        return (
            <View style={isMyMessage ? styles.myMessage : styles.otherMessage}>
                <Text style={{ color: isMyMessage ? 'black' : 'white' }}>{item.content}</Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Opcional: Cargar el nombre del receptor y ponerlo en el título */}
            <Stack.Screen options={{ title: 'Chat' }} />

            {isLoading && <ActivityIndicator />}

            <FlatList
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item) => item.id.toString()}
                inverted // ¡Importante para chat! Muestra mensajes de abajo hacia arriba
                style={styles.messageList}
            />

            <View style={styles.inputContainer}>
                <TextInput
                    value={content}
                    onChangeText={setContent}
                    placeholder="Escribe un mensaje..."
                    style={styles.input}
                    multiline
                />
                <Button title="Enviar" onPress={handleSend} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f0f0' },
    messageList: { flex: 1, padding: 10 },
    inputContainer: {
        flexDirection: 'row',
        padding: 10,
        borderTopWidth: 1,
        borderColor: '#ccc',
        backgroundColor: '#fff',
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginRight: 10,
    },
    myMessage: {
        backgroundColor: '#d1f0d1', // Verde claro
        padding: 10,
        borderRadius: 10,
        alignSelf: 'flex-end',
        marginVertical: 5,
        maxWidth: '80%',
    },
    otherMessage: {
        backgroundColor: 'blue', // Azul
        padding: 10,
        borderRadius: 10,
        alignSelf: 'flex-start',
        marginVertical: 5,
        maxWidth: '80%',
    },
});