import { getAIResponse } from '../../multiagents/agents/responder';
import { getAgentResponse } from '../../multiagents/agents/orchestrator';
import type { ChatMessage, Tab } from '../../types/hooks';
import type { StreamingCallbacks } from '../streaming/callbackHandler';

// Helper functions for cleaner code
const createStreamingCallback = (callbacks: StreamingCallbacks) => {
  return (chunk: string, fullResponse: string, isFirstChunk: boolean) => {
    callbacks.handleStreamingChunk?.(chunk, fullResponse, isFirstChunk, callbacks.stopTyping);
  };
};

const handleStreamingLifecycle = (callbacks: StreamingCallbacks, action: 'start' | 'stop') => {
  if (action === 'start') {
    callbacks.startTyping?.();
    callbacks.startStreaming?.();
  } else {
    callbacks.stopStreaming?.();
    callbacks.stopTyping?.();
  }
};

// Main function - clean and elegant
export const processUserMessage = async (
  userMessage: string, 
  chatHistory: ChatMessage[], 
  mode: string, 
  streamingCallbacks: StreamingCallbacks = {}, 
  selectedTabs: Tab[] = [], 
  currentActiveTab: Tab | null = null, 
  showCurrentTabIndicator: boolean = true
): Promise<string> => {
  handleStreamingLifecycle(streamingCallbacks, 'start');

  try {
    const streamingCallback = createStreamingCallback(streamingCallbacks);
    
    const aiResponse = mode === 'ask' 
      ? await getAIResponse(userMessage, chatHistory, streamingCallback, selectedTabs, currentActiveTab, showCurrentTabIndicator, 'ask')
      : await getAgentResponse(userMessage, chatHistory, selectedTabs, currentActiveTab, showCurrentTabIndicator, streamingCallback);

    handleStreamingLifecycle(streamingCallbacks, 'stop');
    return aiResponse;

  } catch (error) {
    console.error('Error al obtener respuesta de la IA:', error);
    streamingCallbacks.stopTyping?.();
    throw error;
  }
};
