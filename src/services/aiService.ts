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

// Service for handling AI logic and message processing
export class AIService {
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

    if (startTyping) startTyping();

    try {
      let aiResponse;

      if (mode === 'ask') {
        if (startStreaming) startStreaming();

        aiResponse = await getAIResponse(userMessage, chatHistory, (chunk: string, fullResponse: string, isFirstChunk: boolean) => {
          if (handleStreamingChunk) {
            // Handle both normal content and tool descriptions
            if (chunk && chunk.includes('🤖 **Ejecutando herramienta:**')) {
              handleStreamingChunk(chunk, chunk, true, stopTyping);
            } else {
              handleStreamingChunk(chunk, fullResponse, isFirstChunk, stopTyping);
            }
          }
        }, selectedTabs, currentActiveTab, showCurrentTabIndicator, mode);

        if (stopStreaming) stopStreaming();
      } else {
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

    // Find the index of the edited message
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    
    // Build conversation history with the edited message
    const messagesBeforeEdit = messages.slice(0, messageIndex);
    const conversationHistory = [
      ...messagesBeforeEdit,
      { id: messageId, type: 'user' as const, content: newContent }
    ];

    if (startTyping) startTyping();

    try {
      if (startStreaming) startStreaming();

      const aiResponse = await getAIResponse(newContent, conversationHistory, (chunk: string, fullResponse: string, isFirstChunk: boolean) => {
        if (handleStreamingChunk) {
          handleStreamingChunk(chunk, fullResponse, isFirstChunk, stopTyping);
        }
      }, selectedTabs, currentActiveTab, showCurrentTabIndicator, mode);

      if (stopStreaming) stopStreaming();

      return aiResponse;

    } catch (error) {
      console.error('Error al regenerar respuesta de la IA:', error);
      if (stopTyping) stopTyping();
      throw error;
    }
  }
}
