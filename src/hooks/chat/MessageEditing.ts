import { useState } from 'react';
import type { UseMessageEditingReturn } from '../../types/hooks';

// Handles editing user messages
export const useMessageEditing = (): UseMessageEditingReturn => {
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<string>('');

  // Start editing a message
  const startEdit = (messageId: string, content: string): string => {
    setEditingMessageId(messageId);
    setEditingContent(content);
    return content;
  };

  // Cancel current editing
  const cancelEdit = (): void => {
    setEditingMessageId(null);
    setEditingContent('');
  };

  // Update content while editing
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
