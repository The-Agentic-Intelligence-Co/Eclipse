import React, { useState, useEffect, useRef } from 'react';
import logo from '../assets/icons/eclipse_logo.svg';
import { useStreaming } from '../../hooks/streaming';
import { useWelcomeMessages } from '../../hooks/ui';
import { useChatMessages, useMessageEditing, useChatManagement, useMessageEvents } from '../../hooks/chat';
import MessageItem from './MessageItem';
import type { ContentProps } from '../../types/hooks';

// Helper functions for cleaner code
const createChatCallbacks = (chatMessages: any) => ({
  addUserMessage: chatMessages.addUserMessage,
  addAIResponse: chatMessages.addAIResponse,
  addErrorMessage: chatMessages.addErrorMessage,
  updateMessage: chatMessages.updateMessage,
  removeMessagesAfter: chatMessages.removeMessagesAfter,
  startTyping: chatMessages.startTyping,
  stopTyping: chatMessages.stopTyping
});

const createStreamingCallbacks = (streaming: any) => ({
  startStreaming: streaming.startStreaming,
  stopStreaming: streaming.stopStreaming,
  handleStreamingChunk: streaming.handleStreamingChunk
});

const Content: React.FC<ContentProps> = ({ 
  selectedTabs, 
  showCurrentTabIndicator, 
  currentActiveTab,
  onChatStart
}) => {
  const [hasStartedChat, setHasStartedChat] = useState<boolean>(false);
  const editRef = useRef<HTMLSpanElement>(null);
  
  // Hooks personalizados
  const streaming = useStreaming();
  const chatMessages = useChatMessages();
  const messageEditing = useMessageEditing();
  const { currentWelcomeMessage, hasWelcomeMessages } = useWelcomeMessages(hasStartedChat);

  // Chat management
  const { handleUserMessage, handleConfirmEdit } = useChatManagement(
    createChatCallbacks(chatMessages),
    createStreamingCallbacks(streaming),
    selectedTabs,
    currentActiveTab,
    showCurrentTabIndicator
  );

  // Auto-focus when editing starts
  useEffect(() => {
    if (messageEditing.editingMessageId && editRef.current) {
      editRef.current.focus();
    }
  }, [messageEditing.editingMessageId]);

  // Event handlers
  const handleUserMessageWrapper = async (userMessage: string, mode: string): Promise<void> => {
    await handleUserMessage(userMessage, mode, () => {
      setHasStartedChat(true);
      onChatStart?.();
    });
  };

  useMessageEvents(handleUserMessageWrapper);

  // Welcome state
  if (hasWelcomeMessages) {
    return (
      <main className="sidebar-content">
        <div className="welcome-container">
          <div className="welcome-message">
            <img src={logo} alt="Logo" className="welcome-logo" />
            <span className="welcome-text">{currentWelcomeMessage}</span>
          </div>
        </div>
      </main>
    );
  }

  // Chat state
  return (
    <main className="sidebar-content chat-mode">
      <div className="chat-container">
        {chatMessages.messages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            isEditing={messageEditing.editingMessageId === message.id}
            onStartEdit={messageEditing.startEdit}
            onUpdateContent={messageEditing.updateEditingContent}
            onBlur={messageEditing.cancelEdit}
            onConfirm={() => handleConfirmEdit(message.id, messageEditing.editingContent, chatMessages.messages, messageEditing.cancelEdit)}
            onCancel={messageEditing.cancelEdit}
            editRef={editRef}
          />
        ))}
        
        {chatMessages.isTyping && (
          <div className="message ai-message typing">
            <span className="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </span>
          </div>
        )}
        
        {streaming.isStreaming && streaming.streamingHtml && (
          <div className="message ai-message streaming">
            <div 
              className="markdown-content"
              dangerouslySetInnerHTML={{ __html: streaming.streamingHtml }}
            />
            <span className="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </span>
          </div>
        )}
        
        <div className="chat-bottom-spacer"></div>
      </div>
    </main>
  );
};

export default Content;
