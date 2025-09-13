import { useState } from 'react';
import type { 
  UseMessageEditingReturn
} from '../../types/hooks';

/**
 * Hook personalizado para manejar la edición de mensajes del usuario
 * @returns {UseMessageEditingReturn} Estados y funciones para edición de mensajes
 */
export const useMessageEditing = (): UseMessageEditingReturn => {
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<string>('');

  /**
   * Inicia la edición de un mensaje
   * @param {string} messageId - ID del mensaje a editar
   * @param {string} content - Contenido actual del mensaje
   */
  const startEdit = (messageId: string, content: string): string => {
    setEditingMessageId(messageId);
    setEditingContent(content);
    
    // Retornar el contenido para establecerlo directamente en el DOM
    return content;
  };

  /**
   * Cancela la edición actual
   */
  const cancelEdit = (): void => {
    setEditingMessageId(null);
    setEditingContent('');
  };

  /**
   * Actualiza el contenido que se está editando
   * @param {string} content - Nuevo contenido
   */
  const updateEditingContent = (content: string): void => {
    setEditingContent(content);
  };

  return {
    editingMessageId,
    editingContent,
    startEdit,
    cancelEdit,
    updateEditingContent
  };
};
