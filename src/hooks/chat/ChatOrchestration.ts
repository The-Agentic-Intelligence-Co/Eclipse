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

// Manages chat conversations with AI
export const useChatManagement = (
  messageCallbacks: MessageCallbacks, 
  streamingCallbacks: StreamingCallbacks, 
  selectedTabs: Tab[] = [], 
  currentActiveTab: Tab | null = null, 
  showCurrentTabIndicator: boolean = true
): UseChatManagementReturn => {
  // Functions to handle messages (add, update, delete)
  const {
    addUserMessage, addAIResponse, addErrorMessage, updateMessage, 
    removeMessagesAfter, startTyping, stopTyping
  } = messageCallbacks;

  // Functions to show real-time responses
  const { startStreaming, stopStreaming, handleStreamingChunk } = streamingCallbacks;

  // Groups all streaming functions together
  const streamingHandlers = {
    startTyping, stopTyping, startStreaming, stopStreaming, handleStreamingChunk
  };

  // Information about selected tabs to give context to AI
  const contextParams = { selectedTabs, currentActiveTab, showCurrentTabIndicator };

  // Handles when user sends a message
  const handleUserMessage = useCallback(async (
    userMessage: string, 
    mode: string, 
    onChatStart?: () => void
  ): Promise<void> => {
    // Notify that conversation started
    onChatStart?.();
    
    // Save user's message
    const newMessages = addUserMessage(userMessage);
    
    try {
      // Ask AI for response with tab context
      const aiResponse = await AIService.processUserMessage(
        userMessage, newMessages, mode, streamingHandlers, 
        contextParams.selectedTabs, contextParams.currentActiveTab, contextParams.showCurrentTabIndicator
      );
      addAIResponse(aiResponse);
    } catch (error) {
      console.error('Error getting AI response:', error);
      // Show error message if something fails
      addErrorMessage();
    }
  }, [addUserMessage, addAIResponse, addErrorMessage, streamingHandlers, contextParams]);

  // Handles when user edits a message
  const handleConfirmEdit = useCallback(async (
    messageId: string, 
    newContent: string, 
    messages: ChatMessage[], 
    onEditComplete?: () => void
  ): Promise<void> => {
    // Don't do anything if message is empty
    if (isMessageEmpty(newContent)) return;

    // Update the edited message
    updateMessage(messageId, newContent);
    // Remove all messages after this one
    removeMessagesAfter(messageId);

    try {
      // Ask AI to regenerate response with new message
      const aiResponse = await AIService.regenerateResponse(
        messageId, newContent, messages, streamingHandlers,
        contextParams.selectedTabs, contextParams.currentActiveTab, 
        contextParams.showCurrentTabIndicator, 'ask'
      );
      addAIResponse(aiResponse);
    } catch (error) {
      console.error('Error regenerating AI response:', error);
      addErrorMessage();
    }

    // Notify that editing is complete
    onEditComplete?.();
  }, [updateMessage, removeMessagesAfter, addAIResponse, addErrorMessage, streamingHandlers, contextParams]);

  return {
    handleUserMessage,
    handleConfirmEdit
  };
};

// Listens for messages from the input area
export const useMessageEvents = (
  onUserMessage: (userMessage: string, mode: string) => Promise<void>, 
  hasStartedChat: boolean
): void => {
  useEffect(() => {
    // Handle when user types a message
    const handleUserMessage = async (event: Event) => {
      const { message: userMessage, mode } = (event as UserMessageEvent).detail;
      await onUserMessage(userMessage, mode);
    };

    // Start listening for messages
    window.addEventListener('addUserMessage', handleUserMessage);
    // Stop listening when component is removed
    return () => window.removeEventListener('addUserMessage', handleUserMessage);
  }, [onUserMessage, hasStartedChat]);
};
