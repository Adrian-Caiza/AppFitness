// src/constants/AuthStyles.ts
import { StyleSheet } from 'react-native';

// Este es un StyleSheet que será importado
export const authStyles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 30,
    },
    input: {
        height: 50,
        fontSize: 16,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        marginBottom: 20,
    },
    button: {
        height: 50,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    linkText: {
        textAlign: 'center',
        marginTop: 20,
    },
    // --- Estilos para el Toggle (Hire/Work) ---
    toggleContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        height: 44,
    },
    toggleButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
    },
    toggleButtonActive: {
        // Estilo para el botón activo (ej: "Hire")
    },
    toggleButtonInactive: {
        // Estilo para el botón inactivo (ej: "Work")
    },
    toggleTextActive: {
        fontWeight: 'bold',
    },
    toggleTextInactive: {
        // Estilo para el texto inactivo
    },
});