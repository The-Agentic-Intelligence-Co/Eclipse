import React from 'react';
import { renderMarkdown } from '../../utils/markdownUtils';
import { positionCursorAtEnd } from '../../utils/cursorUtils';
import type { MessageItemProps } from '../../types/hooks';

// Helper functions for cleaner code
const createMessageClasses = (messageType: string, isEditing: boolean) => 
  `message ${messageType === 'user' ? 'user-message' : 'ai-message'} ${isEditing ? 'editing' : ''}`;

const createMessageStyle = (messageType: string) => 
  messageType === 'user' ? { cursor: 'pointer' } : {};

const setupEditMode = (editRef: React.RefObject<HTMLSpanElement>, initialContent: string) => {
  setTimeout(() => {
    if (editRef.current) {
      editRef.current.textContent = initialContent;
      positionCursorAtEnd(editRef.current);
    }
  }, 0);
};

const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isEditing,
  onStartEdit,
  onUpdateContent,
  onBlur,
  onConfirm,
  onCancel,
  editRef
}) => {
  // Event handlers
  const handleClick = (): void => {
    if (message.type === 'user') {
      const initialContent = onStartEdit(message.id, message.content);
      setupEditMode(editRef, initialContent);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLSpanElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onConfirm();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div 
      className={createMessageClasses(message.type, isEditing)}
      onClick={message.type === 'user' ? handleClick : undefined}
      style={createMessageStyle(message.type)}
    >
      {message.type === 'user' ? (
        <div className="user-message-content">
          {isEditing ? (
            <div className="edit-mode">
              <span
                ref={editRef}
                contentEditable
                suppressContentEditableWarning={true}
                onInput={(e) => onUpdateContent(e.currentTarget.textContent || '')}
                onKeyDown={handleKeyDown}
                onBlur={onBlur}
                className="edit-content"
                data-placeholder="Editar mensaje..."
              />
            </div>
          ) : (
            <span className="user-text">{message.content}</span>
          )}
        </div>
      ) : (
        <div 
          className="markdown-content"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }}
        />
      )}
    </div>
  );
};

export default MessageItem;
