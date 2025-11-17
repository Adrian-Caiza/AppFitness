// app/chat/[id].tsx

import {
    View, Text, TextInput, Button, FlatList,
    StyleSheet, ActivityIndicator,
    KeyboardAvoidingView, Platform
} from 'react-native';
// ¡¡CORRECCIÓN 1: Importar desde 'react-native-safe-area-context'!!
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useChatSession } from '../../src/presentation/hooks/useChatSession';
import { useAuth } from '../../src/presentation/context/AuthContext';
import { useState } from 'react';
import { ChatMessage } from '../../src/domain/entities/ChatMessage';
import { Colors } from '@/constants/theme';

export default function ChatSessionScreen() {
    const { id: receiverId } = useLocalSearchParams();
    const { user: me } = useAuth();
    const { messages, isLoading, sendMessage } = useChatSession(receiverId as string);
    const [content, setContent] = useState('');

    const handleSend = () => {
        sendMessage(content);
        setContent('');
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
        // ¡¡CORRECCIÓN 2: Ahora esta SafeAreaView es la correcta!!
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
                // ¡¡CORRECCIÓN 3: Un pequeño ajuste para que el teclado funcione mejor!!
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 90}
            >
                <Stack.Screen options={{ title: 'Chat' }} />

                {isLoading && <ActivityIndicator />}

                <FlatList
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(item) => item.id.toString()}
                    inverted
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
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f0f0f0',
    },
    container: {
        flex: 1,
        backgroundColor: '#f0f0f0'
    },
    messageList: {
        flex: 1,
        padding: 10
    },
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
        backgroundColor: '#E1FFC7', // Verde claro (como WhatsApp)
        padding: 10,
        borderRadius: 10,
        alignSelf: 'flex-end',
        marginVertical: 5,
        maxWidth: '80%',
    },
    otherMessage: {
        backgroundColor: Colors.light.primary, // ¡Nuestro azul primario!
        padding: 10,
        borderRadius: 10,
        alignSelf: 'flex-start',
        marginVertical: 5,
        maxWidth: '80%',
    },
});