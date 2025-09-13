import { useState } from 'react';
import { generateMessageId } from '../../utils/messageUtils';
import type { 
  ChatMessage, 
  UseChatMessagesReturn
} from '../../types/hooks';

/**
 * Hook personalizado para manejar los mensajes del chat
 * @returns {UseChatMessagesReturn} Estados y funciones para gestión de mensajes
 */
export const useChatMessages = (): UseChatMessagesReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);

  /**
   * Agrega un mensaje del usuario
   * @param {string} content - Contenido del mensaje
   * @returns {ChatMessage[]} Nuevo array de mensajes
   */
  const addUserMessage = (content: string): ChatMessage[] => {
    const newMessage: ChatMessage = {
      id: generateMessageId(),
      type: 'user',
      content
    };
    
    const newMessages = [...messages, newMessage];
    setMessages(newMessages);
    return newMessages;
  };

  /**
   * Agrega una respuesta de la IA
   * @param {string} content - Contenido de la respuesta
   */
  const addAIResponse = (content: string): void => {
    const aiMessage: ChatMessage = {
      id: generateMessageId(),
      type: 'ai',
      content
    };
    
    setMessages(prev => [...prev, aiMessage]);
  };

  /**
   * Agrega un mensaje de error
   * @param {string} errorMessage - Mensaje de error
   */
  const addErrorMessage = (errorMessage: string = "Lo siento, hubo un error al procesar tu consulta. Por favor, intenta de nuevo."): void => {
    const errorMsg: ChatMessage = {
      id: generateMessageId(),
      type: 'ai',
      content: errorMessage
    };
    
    setMessages(prev => [...prev, errorMsg]);
  };

  /**
   * Actualiza el contenido de un mensaje existente
   * @param {string} messageId - ID del mensaje a actualizar
   * @param {string} newContent - Nuevo contenido del mensaje
   */
  const updateMessage = (messageId: string, newContent: string): void => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, content: newContent }
        : msg
    ));
  };

  /**
   * Elimina todos los mensajes posteriores a un mensaje específico
   * @param {string} messageId - ID del mensaje hasta donde mantener la conversación
   */
  const removeMessagesAfter = (messageId: string): void => {
    setMessages(prev => {
      const messageIndex = prev.findIndex(msg => msg.id === messageId);
      if (messageIndex === -1) return prev;
      return prev.slice(0, messageIndex + 1);
    });
  };

  /**
   * Activa el estado de typing
   */
  const startTyping = (): void => {
    setIsTyping(true);
  };

  /**
   * Desactiva el estado de typing
   */
  const stopTyping = (): void => {
    setIsTyping(false);
  };

  return {
    messages,
    isTyping,
    addUserMessage,
    addAIResponse,
    addErrorMessage,
    updateMessage,
    removeMessagesAfter,
    startTyping,
    stopTyping
  };
};
