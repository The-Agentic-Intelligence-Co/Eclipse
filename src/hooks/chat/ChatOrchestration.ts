import { useCallback, useEffect } from 'react';
import { processUserMessage, regenerateResponse } from '../../services/conversation';
import { isMessageEmpty } from '../../utils/messageUtils';
import type { 
  MessageCallbacks, 
  StreamingCallbacks, 
  UseChatManagementReturn,
  Tab,
  UserMessageEvent,
  ChatMessage
} from '../../types/hooks';

// Helper function for error handling
const handleAIError = (error: unknown, context: string, addErrorMessage: () => void) => {
  console.error(`Error ${context}:`, error);
  addErrorMessage();
};

// Helper function to process AI response
const processAIResponse = async (
  processFn: () => Promise<string>,
  addAIResponse: (response: string) => void,
  addErrorMessage: () => void,
  context: string
) => {
  try {
    const aiResponse = await processFn();
    addAIResponse(aiResponse);
  } catch (error) {
    handleAIError(error, context, addErrorMessage);
  }
};

// Manages chat conversations with AI
export const useChatManagement = (
  messageCallbacks: MessageCallbacks, 
  streamingCallbacks: StreamingCallbacks, 
  selectedTabs: Tab[] = [], 
  currentActiveTab: Tab | null = null, 
  showCurrentTabIndicator: boolean = true
): UseChatManagementReturn => {
  const {
    addUserMessage, addAIResponse, addErrorMessage, updateMessage, 
    removeMessagesAfter, startTyping, stopTyping
  } = messageCallbacks;

  // Handles when user sends a message
  const handleUserMessage = useCallback(async (
    userMessage: string, 
    mode: string, 
    onChatStart?: () => void
  ): Promise<void> => {
    onChatStart?.();
    const newMessages = addUserMessage(userMessage);
    
    await processAIResponse(
      () => processUserMessage(
        userMessage, 
        newMessages, 
        mode, 
        { startTyping, stopTyping, ...streamingCallbacks }, 
        selectedTabs, 
        currentActiveTab, 
        showCurrentTabIndicator
      ),
      addAIResponse,
      addErrorMessage,
      'getting AI response'
    );
  }, [addUserMessage, addAIResponse, addErrorMessage, startTyping, stopTyping, streamingCallbacks, selectedTabs, currentActiveTab, showCurrentTabIndicator]);

  // Handles when user edits a message
  const handleConfirmEdit = useCallback(async (
    messageId: string, 
    newContent: string, 
    messages: ChatMessage[], 
    onEditComplete?: () => void
  ): Promise<void> => {
    if (isMessageEmpty(newContent)) return;

    updateMessage(messageId, newContent);
    removeMessagesAfter(messageId);

    await processAIResponse(
      () => regenerateResponse(
        messageId, 
        newContent, 
        messages, 
        { startTyping, stopTyping, ...streamingCallbacks },
        selectedTabs, 
        currentActiveTab, 
        showCurrentTabIndicator, 
        'ask'
      ),
      addAIResponse,
      addErrorMessage,
      'regenerating AI response'
    );

    onEditComplete?.();
  }, [updateMessage, removeMessagesAfter, addAIResponse, addErrorMessage, startTyping, stopTyping, streamingCallbacks, selectedTabs, currentActiveTab, showCurrentTabIndicator]);

  return {
    handleUserMessage,
    handleConfirmEdit
  };
};

// Listens for messages from the input area
export const useMessageEvents = (
  onUserMessage: (userMessage: string, mode: string) => Promise<void>
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
  }, [onUserMessage]);
};
