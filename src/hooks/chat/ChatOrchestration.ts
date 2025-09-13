import { useCallback, useEffect } from 'react';
import { AIService } from '../../services/aiService';
import { isMessageEmpty } from '../../utils/messageUtils';
import type { 
  MessageCallbacks, 
  StreamingCallbacks, 
  UseChatManagementReturn,
  Tab,
  UserMessageEvent,
  ChatMessage
} from '../../types/hooks';

/**
 * Hook personalizado para gestionar el chat
 * @param {MessageCallbacks} messageCallbacks - Callbacks para gestión de mensajes
 * @param {StreamingCallbacks} streamingCallbacks - Callbacks para streaming
 * @param {Tab[]} selectedTabs - Pestañas seleccionadas para contexto
 * @param {Tab | null} currentActiveTab - Pestaña activa actual para contexto
 * @param {boolean} showCurrentTabIndicator - Si mostrar la pestaña activa en el contexto
 * @returns {UseChatManagementReturn} Funciones para gestión del chat
 */
export const useChatManagement = (
  messageCallbacks: MessageCallbacks, 
  streamingCallbacks: StreamingCallbacks, 
  selectedTabs: Tab[] = [], 
  currentActiveTab: Tab | null = null, 
  showCurrentTabIndicator: boolean = true
): UseChatManagementReturn => {
  const {
    addUserMessage,
    addAIResponse,
    addErrorMessage,
    updateMessage,
    removeMessagesAfter,
    startTyping,
    stopTyping
  } = messageCallbacks;

  const {
    startStreaming,
    stopStreaming,
    handleStreamingChunk
  } = streamingCallbacks;

  /**
   * Procesa un mensaje del usuario y obtiene respuesta de la IA
   * @param {string} userMessage - Mensaje del usuario
   * @param {string} mode - Modo de operación ('ask' o 'agent')
   * @param {Function} onChatStart - Callback cuando inicia el chat
   */
  const handleUserMessage = useCallback(async (
    userMessage: string, 
    mode: string, 
    onChatStart?: () => void
  ): Promise<void> => {
    // Notificar que el chat ha comenzado
    if (onChatStart) {
      onChatStart();
    }
    
    // Agregar mensaje del usuario
    const newMessages = addUserMessage(userMessage);
    
    try {
      // Usar el servicio de IA para procesar el mensaje
      const aiResponse = await AIService.processUserMessage(
        userMessage, 
        newMessages, 
        mode, 
        {
          startTyping,
          stopTyping,
          startStreaming,
          stopStreaming,
          handleStreamingChunk
        },
        selectedTabs, // ← Pasar las pestañas seleccionadas
        currentActiveTab, // ← Pasar la pestaña activa
        showCurrentTabIndicator // ← Pasar el estado del indicador
      );
      
      // Agregar respuesta de la IA
      addAIResponse(aiResponse);
      
    } catch (error) {
      console.error('Error al obtener respuesta de la IA:', error);
      addErrorMessage();
    }
  }, [addUserMessage, addAIResponse, addErrorMessage, startTyping, stopTyping, startStreaming, stopStreaming, handleStreamingChunk, selectedTabs, currentActiveTab, showCurrentTabIndicator]);

  /**
   * Confirma la edición de un mensaje y regenera la respuesta de la IA
   * @param {string} messageId - ID del mensaje editado
   * @param {string} newContent - Nuevo contenido del mensaje
   * @param {ChatMessage[]} messages - Array completo de mensajes
   * @param {Function} onEditComplete - Callback cuando se completa la edición
   */
  const handleConfirmEdit = useCallback(async (
    messageId: string, 
    newContent: string, 
    messages: ChatMessage[], 
    onEditComplete?: () => void
  ): Promise<void> => {
    if (isMessageEmpty(newContent)) return;

    // Actualizar el mensaje editado
    updateMessage(messageId, newContent);

    // Eliminar todos los mensajes posteriores (incluyendo respuestas de IA)
    removeMessagesAfter(messageId);

    try {
      // Usar el servicio de IA para regenerar la respuesta
      const aiResponse = await AIService.regenerateResponse(
        messageId,
        newContent,
        messages,
        {
          startTyping,
          stopTyping,
          startStreaming,
          stopStreaming,
          handleStreamingChunk
        },
        selectedTabs, // ← Pasar las pestañas seleccionadas
        currentActiveTab, // ← Pasar la pestaña activa
        showCurrentTabIndicator, // ← Pasar el estado del indicador
        'ask' // ← Pasar el modo por defecto
      );
      
      // Agregar nueva respuesta de la IA
      addAIResponse(aiResponse);
      
    } catch (error) {
      console.error('Error al regenerar respuesta de la IA:', error);
      addErrorMessage();
    }

    // Notificar que la edición se ha completado
    if (onEditComplete) {
      onEditComplete();
    }
  }, [updateMessage, removeMessagesAfter, addAIResponse, addErrorMessage, startTyping, stopTyping, startStreaming, stopStreaming, handleStreamingChunk, selectedTabs, currentActiveTab, showCurrentTabIndicator]);

  return {
    handleUserMessage,
    handleConfirmEdit
  };
};

/**
 * Hook personalizado para manejar eventos de mensajes del usuario
 * @param {Function} onUserMessage - Callback cuando llega un mensaje del usuario
 * @param {boolean} hasStartedChat - Si el chat ya ha comenzado
 */
export const useMessageEvents = (
  onUserMessage: (userMessage: string, mode: string) => Promise<void>, 
  hasStartedChat: boolean
): void => {
  useEffect(() => {
    // Escuchar mensajes del usuario desde el Footer
    const handleUserMessage = async (event: Event) => {
      const customEvent = event as UserMessageEvent;
      const { message: userMessage, mode } = customEvent.detail;
      
      // Llamar al callback con el mensaje y modo
      await onUserMessage(userMessage, mode);
    };

    window.addEventListener('addUserMessage', handleUserMessage);
    
    return () => {
      window.removeEventListener('addUserMessage', handleUserMessage);
    };
  }, [onUserMessage, hasStartedChat]);
};
