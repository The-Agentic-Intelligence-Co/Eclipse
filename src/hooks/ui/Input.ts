import { useState } from 'react';
import type { 
  UseFooterStateReturn 
} from '../../types/hooks';

/**
 * Hook personalizado para manejar el estado del Footer
 * @returns {UseFooterStateReturn} Estados y funciones para el Footer
 */
export const useFooterState = (): UseFooterStateReturn => {
  const [selectedMode, setSelectedMode] = useState<string>('agent');
  const [content, setContent] = useState<string>('');
  const [isFocused, setIsFocused] = useState<boolean>(false);

  /**
   * Maneja el input del usuario
   * @param {React.FormEvent<HTMLDivElement>} e - Evento de input
   */
  const handleInput = (e: React.FormEvent<HTMLDivElement>): void => {
    const target = e.currentTarget;
    setContent(target.textContent || '');
  };

  /**
   * Maneja el foco del input
   * @param {boolean} focused - Si está enfocado
   */
  const handleFocus = (focused: boolean): void => {
    setIsFocused(focused);
  };

  /**
   * Limpia el contenido del input
   */
  const clearContent = (): void => {
    setContent('');
  };

  /**
   * Obtiene el contenido actual del input
   * @returns {string} Contenido del input
   */
  const getContent = (): string => {
    return content;
  };

  /**
   * Verifica si el input tiene contenido
   * @returns {boolean} True si tiene contenido
   */
  const hasContent = (): boolean => {
    return content.trim().length > 0;
  };

  /**
   * Obtiene el modo seleccionado
   * @returns {string} Modo seleccionado
   */
  const getSelectedMode = (): string => {
    return selectedMode;
  };

  /**
   * Cambia el modo seleccionado
   * @param {string} mode - Nuevo modo
   */
  const changeMode = (mode: string): void => {
    setSelectedMode(mode);
  };

  return {
    // Estado
    selectedMode,
    content,
    isFocused,
    
    // Acciones
    handleInput,
    handleFocus,
    clearContent,
    getContent,
    hasContent,
    getSelectedMode,
    changeMode
  };
};
