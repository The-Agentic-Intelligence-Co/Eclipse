import { getAIResponse } from '../multiagents/agents/responder';
import { getNavigatorResponse } from '../multiagents/agents/navigator';
import type { ChatMessage, Tab } from '../types/hooks';

interface StreamingCallbacks {
  startTyping?: () => void;
  stopTyping?: () => void;
  startStreaming?: () => void;
  stopStreaming?: () => void;
  handleStreamingChunk?: (chunk: string, fullResponse: string, isFirstChunk: boolean, stopTyping?: () => void) => void;
}

/**
 * Servicio para manejar la lógica de IA y procesamiento de mensajes
 */
export class AIService {
  /**
   * Procesa un mensaje del usuario y obtiene respuesta de la IA
   * @param {string} userMessage - Mensaje del usuario
   * @param {Array} chatHistory - Historial de conversación
   * @param {string} mode - Modo de operación ('ask' o 'agent')
   * @param {Object} streamingCallbacks - Callbacks para streaming
   * @param {Array} selectedTabs - Pestañas seleccionadas para contexto
   * @param {Object} currentActiveTab - Pestaña activa actual para contexto
   * @param {boolean} showCurrentTabIndicator - Si mostrar la pestaña activa en el contexto
   * @returns {Promise<string>} Respuesta de la IA
   */
  static async processUserMessage(
    userMessage: string, 
    chatHistory: ChatMessage[], 
    mode: string, 
    streamingCallbacks: StreamingCallbacks = {}, 
    selectedTabs: Tab[] = [], 
    currentActiveTab: Tab | null = null, 
    showCurrentTabIndicator: boolean = true
  ): Promise<string> {
    const { startTyping, stopTyping, startStreaming, stopStreaming, handleStreamingChunk } = streamingCallbacks;

    // Activar indicador de escritura
    if (startTyping) startTyping();

    try {
      let aiResponse;

      if (mode === 'ask') {
        // Modo Ask: Llamar a la IA real con historial de conversación

        // Activar streaming
        if (startStreaming) startStreaming();

        // Llamar a la IA con callback para streaming, pestañas seleccionadas, pestaña activa y estado del indicador
        aiResponse = await getAIResponse(userMessage, chatHistory, (chunk: string, fullResponse: string, isFirstChunk: boolean) => {
          if (handleStreamingChunk) {
            // Manejar tanto contenido normal como descripciones de herramientas
            if (chunk && chunk.includes('🤖 **Ejecutando herramienta:**')) {
              // Es un mensaje de descripción de herramienta, tratarlo como primer chunk
              handleStreamingChunk(chunk, chunk, true, stopTyping);
            } else {
              // Es contenido normal de streaming
              handleStreamingChunk(chunk, fullResponse, isFirstChunk, stopTyping);
            }
          }
        }, selectedTabs, currentActiveTab, showCurrentTabIndicator, mode);

        // Desactivar streaming
        if (stopStreaming) stopStreaming();
      } else {
        // Modo Agent: Llamar a navigator.js con streaming
        if (startStreaming) startStreaming();
        
        aiResponse = await getNavigatorResponse(userMessage, chatHistory, selectedTabs, currentActiveTab, showCurrentTabIndicator, (chunk: string, fullResponse: string, isFirstChunk: boolean) => {
          if (handleStreamingChunk) {
            handleStreamingChunk(chunk, fullResponse, isFirstChunk, stopTyping);
          }
        });
        
        if (stopStreaming) stopStreaming();
        if (stopTyping) stopTyping();
      }

      return aiResponse;

    } catch (error) {
      console.error('Error al obtener respuesta de la IA:', error);
      if (stopTyping) stopTyping();
      throw error;
    }
  }

  /**
   * Regenera la respuesta de la IA basándose en un mensaje editado
   * @param {string} messageId - ID del mensaje editado
   * @param {string} newContent - Nuevo contenido del mensaje
   * @param {Array} messages - Array completo de mensajes
   * @param {Object} streamingCallbacks - Callbacks para streaming
   * @param {Array} selectedTabs - Pestañas seleccionadas para contexto
   * @param {Object} currentActiveTab - Pestaña activa actual para contexto
   * @param {boolean} showCurrentTabIndicator - Si mostrar la pestaña activa en el contexto
   * @returns {Promise<string>} Nueva respuesta de la IA
   */
  static async regenerateResponse(
    messageId: string, 
    newContent: string, 
    messages: ChatMessage[], 
    streamingCallbacks: StreamingCallbacks = {}, 
    selectedTabs: Tab[] = [], 
    currentActiveTab: Tab | null = null, 
    showCurrentTabIndicator: boolean = true,
    mode: 'ask' | 'agent' = 'ask'
  ): Promise<string> {
    const { startTyping, stopTyping, startStreaming, stopStreaming, handleStreamingChunk } = streamingCallbacks;

    // Encontrar el índice del mensaje editado
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    
    // Construir historial de conversación con el mensaje editado
    const messagesBeforeEdit = messages.slice(0, messageIndex);
    const conversationHistory = [
      ...messagesBeforeEdit,
      { id: messageId, type: 'user' as const, content: newContent }
    ];

    // Activar indicador de escritura
    if (startTyping) startTyping();

    try {
      // Activar streaming
      if (startStreaming) startStreaming();

      // Llamar a la IA con el mensaje editado, pestañas seleccionadas, pestaña activa y estado del indicador
      const aiResponse = await getAIResponse(newContent, conversationHistory, (chunk: string, fullResponse: string, isFirstChunk: boolean) => {
        if (handleStreamingChunk) {
          handleStreamingChunk(chunk, fullResponse, isFirstChunk, stopTyping);
        }
      }, selectedTabs, currentActiveTab, showCurrentTabIndicator, mode);

      // Desactivar streaming
      if (stopStreaming) stopStreaming();

      return aiResponse;

    } catch (error) {
      console.error('Error al regenerar respuesta de la IA:', error);
      if (stopTyping) stopTyping();
      throw error;
    }
  }

}
