import React, { useState, useEffect, useRef } from 'react';
import logo from '../assets/icons/eclipse_logo.svg';
import { useStreaming } from '../../hooks/streaming';
import { useWelcomeMessages } from '../../hooks/ui';
import { useChatMessages, useMessageEditing, useChatManagement, useMessageEvents } from '../../hooks/chat';
import MessageItem from './MessageItem';
import type { ContentProps } from '../../types/hooks';

const Content: React.FC<ContentProps> = ({ 
  selectedTabs, 
  showCurrentTabIndicator, 
  currentActiveTab,
  onChatStart
}) => {
  const [hasStartedChat, setHasStartedChat] = useState<boolean>(false);
  const editRef = useRef<HTMLSpanElement>(null);
  
  // Hooks personalizados
  const {
    streamingHtml,
    isStreaming,
    startStreaming,
    stopStreaming,
    handleStreamingChunk,
  } = useStreaming();
  
  const {
    messages,
    isTyping,
    addUserMessage,
    addAIResponse,
    addErrorMessage,
    startTyping,
    stopTyping,
    updateMessage,
    removeMessagesAfter,
  } = useChatMessages();

  const {
    editingMessageId,
    editingContent,
    startEdit,
    cancelEdit,
    updateEditingContent,
  } = useMessageEditing();

  const {
    currentWelcomeMessage,
    hasWelcomeMessages
  } = useWelcomeMessages(hasStartedChat);

  // Hook para gestión del chat
  const { handleUserMessage, handleConfirmEdit } = useChatManagement(
    {
      addUserMessage,
      addAIResponse,
      addErrorMessage,
      updateMessage,
      removeMessagesAfter,
      startTyping,
      stopTyping
    },
    {
      startStreaming,
      stopStreaming,
      handleStreamingChunk
    },
    selectedTabs, // ← Pasar las pestañas seleccionadas
    currentActiveTab, // ← Pasar la pestaña activa
    showCurrentTabIndicator // ← Pasar el estado del indicador
  );

  // Efecto para manejar el foco automático cuando se activa la edición
  useEffect(() => {
    if (editingMessageId && editRef.current) {
      // Solo establecer foco cuando se activa la edición, no cuando cambia el contenido
      editRef.current.focus();
    }
  }, [editingMessageId]); // Solo se ejecuta cuando cambia editingMessageId, no editingContent

  // Función para manejar mensajes del usuario
  const handleUserMessageWrapper = async (userMessage: string, mode: string): Promise<void> => {
    await handleUserMessage(userMessage, mode, () => {
      setHasStartedChat(true);
      if (onChatStart) onChatStart();
    });
  };

  // Función para confirmar edición
  const handleConfirmEditWrapper = async (messageId: string, newContent: string): Promise<void> => {
    await handleConfirmEdit(messageId, newContent, messages, cancelEdit);
  };

  // Usar el hook de eventos de mensajes
  useMessageEvents(handleUserMessageWrapper, hasStartedChat);

  // Estado inicial: Mensaje de bienvenida
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

  // Estado de chat: Historial de conversación
  return (
    <main className="sidebar-content chat-mode">
      <div className="chat-container">
        {/* Mensajes de la conversación */}
        {messages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            isEditing={editingMessageId === message.id}
            onStartEdit={startEdit}
            onUpdateContent={updateEditingContent}
            onBlur={cancelEdit}
            onConfirm={() => handleConfirmEditWrapper(message.id, editingContent)}
            onCancel={cancelEdit}
            editRef={editRef}
          />
        ))}
        
        {/* Indicador de escritura */}
        {isTyping && (
          <div className="message ai-message typing">
            <span className="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </span>
          </div>
        )}
        
        {/* Mensaje de streaming en tiempo real */}
        {isStreaming && streamingHtml && (
          <div className="message ai-message streaming">
            <div 
              className="markdown-content"
              dangerouslySetInnerHTML={{ __html: streamingHtml }}
            />
            <span className="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </span>
          </div>
        )}
        
        {/* Espaciador para separar el último mensaje del footer */}
        <div className="chat-bottom-spacer"></div>
      </div>
    </main>
  );
};

export default Content;
