import React from 'react';
import { renderMarkdown } from '../../utils/markdownUtils';
import { positionCursorAtEnd } from '../../utils/cursorUtils';
import type { MessageItemProps } from '../../types/hooks';

/**
 * Componente para renderizar un mensaje individual del chat
 */
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
  const handleClick = (): void => {
    if (message.type === 'user') {
      const initialContent = onStartEdit(message.id, message.content);
      // Establecer el contenido inicial directamente en el DOM después de un pequeño delay
      setTimeout(() => {
        if (editRef.current) {
          editRef.current.textContent = initialContent;
          // Colocar el cursor al final del texto después de establecer el contenido
          positionCursorAtEnd(editRef.current);
        }
      }, 0);
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
      className={`message ${message.type === 'user' ? 'user-message' : 'ai-message'} ${isEditing ? 'editing' : ''}`}
      onClick={message.type === 'user' ? handleClick : undefined}
      style={message.type === 'user' ? { cursor: 'pointer' } : {}}
    >
      {message.type === 'user' ? (
        // Mensaje del usuario - editable al hacer click
        <div className="user-message-content">
          {isEditing ? (
            // Modo edición
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
            // Modo visualización
            <span className="user-text">{message.content}</span>
          )}
        </div>
      ) : (
        // Mensaje de IA - no editable
        <div 
          className="markdown-content"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }}
        />
      )}
    </div>
  );
};

export default MessageItem;
