import { useState } from 'react';
import { generateMessageId } from '../../utils/messageUtils';
import type { ChatMessage, UseChatMessagesReturn } from '../../types/hooks';

// Manages chat messages (add, update, delete)
export const useChatMessages = (): UseChatMessagesReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);

  // Add a user message
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

  // Add AI response
  const addAIResponse = (content: string): void => {
    const aiMessage: ChatMessage = {
      id: generateMessageId(),
      type: 'ai',
      content
    };
    
    setMessages(prev => [...prev, aiMessage]);
  };

  // Add error message
  const addErrorMessage = (errorMessage: string = "Sorry, there was an error processing your request. Please try again."): void => {
    const errorMsg: ChatMessage = {
      id: generateMessageId(),
      type: 'ai',
      content: errorMessage
    };
    
    setMessages(prev => [...prev, errorMsg]);
  };

  // Update existing message content
  const updateMessage = (messageId: string, newContent: string): void => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, content: newContent }
        : msg
    ));
  };

  // Remove all messages after a specific message
  const removeMessagesAfter = (messageId: string): void => {
    setMessages(prev => {
      const messageIndex = prev.findIndex(msg => msg.id === messageId);
      if (messageIndex === -1) return prev;
      return prev.slice(0, messageIndex + 1);
    });
  };

  // Show typing indicator
  const startTyping = (): void => {
    setIsTyping(true);
  };

  // Hide typing indicator
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
