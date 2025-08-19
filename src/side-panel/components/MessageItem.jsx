import React from 'react';
import { renderMarkdown } from '../../utils/markdownUtils';
import { positionCursorAtEnd } from '../../utils/cursorUtils';

/**
 * Componente para renderizar un mensaje individual del chat
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.message - Objeto del mensaje
 * @param {boolean} props.isEditing - Si el mensaje está en modo edición
 * @param {string} props.editingContent - Contenido que se está editando
 * @param {Function} props.onStartEdit - Callback para iniciar edición
 * @param {Function} props.onUpdateContent - Callback para actualizar contenido
 * @param {Function} props.onKeyDown - Callback para manejar teclas
 * @param {Function} props.onBlur - Callback para perder foco
 * @param {Function} props.onConfirm - Callback para confirmar edición
 * @param {Function} props.onCancel - Callback para cancelar edición
 * @param {React.RefObject} props.editRef - Referencia al elemento editable
 */
const MessageItem = ({
  message,
  isEditing,
  editingContent,
  onStartEdit,
  onUpdateContent,
  onKeyDown,
  onBlur,
  onConfirm,
  onCancel,
  editRef
}) => {
  const handleClick = () => {
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

  const handleKeyDown = (e) => {
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
                onInput={(e) => onUpdateContent(e.currentTarget.textContent)}
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
