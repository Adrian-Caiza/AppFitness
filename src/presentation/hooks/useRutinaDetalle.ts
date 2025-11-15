import { useState, useEffect, useCallback } from 'react';
import { RutinaCompleta, EjercicioEnRutina } from '../../domain/types/types';
import { Ejercicio } from '../../domain/entities/Ejercicio';
import { AddEjercicioParams, RutinaRepository } from '../../domain/repositories/RutinaRepository';
import { SupabaseRutinaRepository } from '../../data/repositories/SupabaseRutinaRepository';
import { EjercicioRepository } from '../../domain/repositories/EjercicioRepository';
import { SupabaseEjercicioRepository } from '../../data/repositories/SupabaseEjercicioRepository';
import { useAuth } from '../context/AuthContext';
import { Alert } from 'react-native';

// Instanciar ambos repositorios
const rutinaRepository: RutinaRepository = new SupabaseRutinaRepository();
const ejercicioRepository: EjercicioRepository = new SupabaseEjercicioRepository();

export const useRutinaDetalle = (rutinaId: string) => {
    const { user } = useAuth();
    const [rutina, setRutina] = useState<RutinaCompleta | null>(null);
    const [ejerciciosDisponibles, setEjerciciosDisponibles] = useState<Ejercicio[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Cargar todos los datos
    const fetchData = useCallback(async () => {
        if (!user || !rutinaId) return;

        setIsLoading(true);
        try {
            // Cargar en paralelo
            const [rutinaData, ejerciciosData] = await Promise.all([
                rutinaRepository.getRutinaDetallada(rutinaId),
                ejercicioRepository.getEjerciciosByTrainer(user.id)
            ]);

            setRutina(rutinaData);
            setEjerciciosDisponibles(ejerciciosData);

        } catch (e: any) {
            Alert.alert('Error', 'No se pudieron cargar los datos de la rutina: ' + e.message);
        } finally {
            setIsLoading(false);
        }
    }, [rutinaId, user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Función para añadir un ejercicio (que llamará el formulario)
    const addEjercicio = async (params: Omit<AddEjercicioParams, 'rutina_id'>) => {
        setIsLoading(true);
        try {
            const newEjercicioEnRutina = await rutinaRepository.addEjercicioToRutina({
                ...params,
                rutina_id: rutinaId,
            });

            // Para evitar recargar todo, actualizamos el estado local
            // (Esta parte es avanzada, requiere cargar el ejercicio completo)
            // Por ahora, lo más simple es recargar todo:
            await fetchData();
            Alert.alert('Éxito', 'Ejercicio añadido a la rutina.');

        } catch (e: any) {
            Alert.alert('Error', 'No se pudo añadir el ejercicio: ' + e.message);
            throw e;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        rutina,
        ejerciciosDisponibles, // La lista para el <Picker> o Dropdown
        isLoading,
        refresh: fetchData,
        addEjercicio,
    };
};