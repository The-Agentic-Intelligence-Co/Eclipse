import { getAIResponse } from '../../multiagents/agents/responder';
import type { ChatMessage, Tab } from '../../types/hooks';
import type { StreamingCallbacks } from '../streaming/callbackHandler';

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

const buildConversationHistory = (messageId: string, newContent: string, messages: ChatMessage[]): ChatMessage[] => {
  const messageIndex = messages.findIndex(msg => msg.id === messageId);
  const messagesBeforeEdit = messages.slice(0, messageIndex);
  
  return [
    ...messagesBeforeEdit,
    { id: messageId, type: 'user' as const, content: newContent }
  ];
};

export const regenerateResponse = async (
  messageId: string, 
  newContent: string, 
  messages: ChatMessage[], 
  streamingCallbacks: StreamingCallbacks = {}, 
  selectedTabs: Tab[] = [], 
  currentActiveTab: Tab | null = null, 
  showCurrentTabIndicator: boolean = true,
  mode: 'ask' | 'agent' = 'ask'
): Promise<string> => {
  handleStreamingLifecycle(streamingCallbacks, 'start');

  try {
    const streamingCallback = createStreamingCallback(streamingCallbacks);
    const conversationHistory = buildConversationHistory(messageId, newContent, messages);

    const aiResponse = await getAIResponse(
      newContent, 
      conversationHistory, 
      streamingCallback, 
      selectedTabs, 
      currentActiveTab, 
      showCurrentTabIndicator, 
      mode
    );

    handleStreamingLifecycle(streamingCallbacks, 'stop');
    return aiResponse;

  } catch (error) {
    console.error('Error al regenerar respuesta de la IA:', error);
    streamingCallbacks.stopTyping?.();
    throw error;
  }
};
