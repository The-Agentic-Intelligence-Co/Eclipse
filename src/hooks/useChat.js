import { useState, useCallback, useEffect } from 'react';
import { AIService } from '../services/aiService';
import { generateMessageId, isMessageEmpty } from '../utils/messageUtils';

/**
 * Hook personalizado para manejar los mensajes del chat
 * @returns {Object} Estados y funciones para gestión de mensajes
 */
export const useChatMessages = () => {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  /**
   * Agrega un mensaje del usuario
   * @param {string} content - Contenido del mensaje
   * @returns {Array} Nuevo array de mensajes
   */
  const addUserMessage = (content) => {
    const newMessage = {
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
  const addAIResponse = (content) => {
    const aiMessage = {
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
  const addErrorMessage = (errorMessage = "Lo siento, hubo un error al procesar tu consulta. Por favor, intenta de nuevo.") => {
    const errorMsg = {
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
  const updateMessage = (messageId, newContent) => {
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
  const removeMessagesAfter = (messageId) => {
    setMessages(prev => {
      const messageIndex = prev.findIndex(msg => msg.id === messageId);
      if (messageIndex === -1) return prev;
      return prev.slice(0, messageIndex + 1);
    });
  };

  /**
   * Activa el estado de typing
   */
  const startTyping = () => {
    setIsTyping(true);
  };

  /**
   * Desactiva el estado de typing
   */
  const stopTyping = () => {
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

/**
 * Hook personalizado para manejar la edición de mensajes del usuario
 * @returns {Object} Estados y funciones para edición de mensajes
 */
export const useMessageEditing = () => {
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingContent, setEditingContent] = useState('');

  /**
   * Inicia la edición de un mensaje
   * @param {string} messageId - ID del mensaje a editar
   * @param {string} content - Contenido actual del mensaje
   */
  const startEdit = (messageId, content) => {
    setEditingMessageId(messageId);
    setEditingContent(content);
    
    // Retornar el contenido para establecerlo directamente en el DOM
    return content;
  };

  /**
   * Cancela la edición actual
   */
  const cancelEdit = () => {
    setEditingMessageId(null);
    setEditingContent('');
  };

  /**
   * Actualiza el contenido que se está editando
   * @param {string} content - Nuevo contenido
   */
  const updateEditingContent = (content) => {
    setEditingContent(content);
  };

  return {
    editingMessageId,
    editingContent,
    startEdit,
    cancelEdit,
    updateEditingContent
  };
};

/**
 * Hook personalizado para gestionar el chat
 * @param {Object} messageCallbacks - Callbacks para gestión de mensajes
 * @param {Object} streamingCallbacks - Callbacks para streaming
 * @param {Array} selectedTabs - Pestañas seleccionadas para contexto
 * @param {Object} currentActiveTab - Pestaña activa actual para contexto
 * @param {boolean} showCurrentTabIndicator - Si mostrar la pestaña activa en el contexto
 * @returns {Object} Funciones para gestión del chat
 */
export const useChatManagement = (messageCallbacks, streamingCallbacks, selectedTabs = [], currentActiveTab = null, showCurrentTabIndicator = true) => {
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
  const handleUserMessage = useCallback(async (userMessage, mode, onChatStart) => {
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
   * @param {Array} messages - Array completo de mensajes
   * @param {Function} onEditComplete - Callback cuando se completa la edición
   */
  const handleConfirmEdit = useCallback(async (messageId, newContent, messages, onEditComplete) => {
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
        showCurrentTabIndicator // ← Pasar el estado del indicador
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
export const useMessageEvents = (onUserMessage, hasStartedChat) => {
  useEffect(() => {
    // Escuchar mensajes del usuario desde el Footer
    const handleUserMessage = async (event) => {
      const { message: userMessage, mode } = event.detail;
      
      // Llamar al callback con el mensaje y modo
      await onUserMessage(userMessage, mode);
    };

    window.addEventListener('addUserMessage', handleUserMessage);
    
    return () => {
      window.removeEventListener('addUserMessage', handleUserMessage);
    };
  }, [onUserMessage, hasStartedChat]);
};
