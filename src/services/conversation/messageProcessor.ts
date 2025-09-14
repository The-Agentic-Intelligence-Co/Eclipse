import { getAIResponse } from '../../multiagents/agents/responder';
import { getNavigatorResponse } from '../../multiagents/agents/navigator';
import type { ChatMessage, Tab } from '../../types/hooks';
import type { StreamingCallbacks } from '../streaming/callbackHandler';

// Process user messages and coordinate with AI agents
export const processUserMessage = async (
  userMessage: string, 
  chatHistory: ChatMessage[], 
  mode: string, 
  streamingCallbacks: StreamingCallbacks = {}, 
  selectedTabs: Tab[] = [], 
  currentActiveTab: Tab | null = null, 
  showCurrentTabIndicator: boolean = true
): Promise<string> => {
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
};
