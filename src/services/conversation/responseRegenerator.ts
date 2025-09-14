import { getAIResponse } from '../../multiagents/agents/responder';
import type { ChatMessage, Tab } from '../../types/hooks';
import type { StreamingCallbacks } from '../streaming/callbackHandler';

// Regenerate AI responses based on edited messages
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
};
