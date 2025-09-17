import { useState } from 'react';
import type { UseFooterStateReturn } from '../../types/hooks';

// Manages input state and interactions for the footer
export const useFooterState = (): UseFooterStateReturn => {
  const [selectedMode, setSelectedMode] = useState<string>('agent');
  const [content, setContent] = useState<string>('');
  const [isFocused, setIsFocused] = useState<boolean>(false);

  // Handle user input changes
  const handleInput = (e: React.FormEvent<HTMLDivElement>): void => {
    const target = e.currentTarget;
    setContent(target.textContent || '');
  };

  // Handle input focus state
  const handleFocus = (focused: boolean): void => {
    setIsFocused(focused);
  };

  // Clear input content
  const clearContent = (): void => {
    setContent('');
  };

  // Check if input has content
  const hasContent = (): boolean => {
    return content.trim().length > 0;
  };

  // Change the selected mode
  const changeMode = (mode: string): void => {
    setSelectedMode(mode);
  };

  return {
    selectedMode,
    content,
    isFocused,
    handleInput,
    handleFocus,
    clearContent,
    hasContent,
    changeMode
  };
};
