import { useState, useEffect } from 'react';
import { WELCOME_MESSAGES, WELCOME_MESSAGE_INTERVAL } from '../constants/welcomeMessages';
import type { 
  UseDropdownManagementReturn, 
  UseWelcomeMessagesReturn, 
  UseFooterStateReturn 
} from '../types/hooks';

/**
 * Hook personalizado para manejar la gestión de dropdowns
 * @returns {UseDropdownManagementReturn} Estados y funciones para gestión de dropdowns
 */
export const useDropdownManagement = (): UseDropdownManagementReturn => {
  const [isContextDropdownOpen, setIsContextDropdownOpen] = useState<boolean>(false);
  const [isModeDropdownOpen, setIsModeDropdownOpen] = useState<boolean>(false);
  const [showTabSelection, setShowTabSelection] = useState<boolean>(false);

  // Cerrar dropdowns al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      const target = event.target as Element;
      const contextDropdown = target.closest('.context-dropdown');
      const modeDropdown = target.closest('.custom-select');
      
      if (!contextDropdown && (isContextDropdownOpen || showTabSelection)) {
        setIsContextDropdownOpen(false);
        setShowTabSelection(false);
      }
      
      if (!modeDropdown && isModeDropdownOpen) {
        setIsModeDropdownOpen(false);
      }
    };

    if (isContextDropdownOpen || showTabSelection || isModeDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isContextDropdownOpen, showTabSelection, isModeDropdownOpen]);

  // Cerrar con Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setIsContextDropdownOpen(false);
        setShowTabSelection(false);
        setIsModeDropdownOpen(false);
      }
    };

    if (isContextDropdownOpen || showTabSelection || isModeDropdownOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => document.removeEventListener('keydown', handleEscape);
  }, [isContextDropdownOpen, showTabSelection, isModeDropdownOpen]);

  /**
   * Abre o cierra el dropdown de contexto
   */
  const toggleContextDropdown = (): void => {
    setIsContextDropdownOpen(prev => !prev);
  };

  /**
   * Abre o cierra el dropdown de modo
   */
  const toggleModeDropdown = (): void => {
    setIsModeDropdownOpen(prev => !prev);
  };

  /**
   * Muestra la selección de pestañas
   */
  const showTabSelectionMode = (): void => {
    setShowTabSelection(true);
  };

  /**
   * Oculta la selección de pestañas
   */
  const hideTabSelectionMode = (): void => {
    setShowTabSelection(false);
  };

  /**
   * Cierra todos los dropdowns
   */
  const closeAllDropdowns = (): void => {
    setIsContextDropdownOpen(false);
    setIsModeDropdownOpen(false);
    setShowTabSelection(false);
  };

  return {
    // Estado
    isContextDropdownOpen,
    isModeDropdownOpen,
    showTabSelection,
    
    // Acciones
    setIsContextDropdownOpen,
    setIsModeDropdownOpen,
    setShowTabSelection,
    toggleContextDropdown,
    toggleModeDropdown,
    showTabSelectionMode,
    hideTabSelectionMode,
    closeAllDropdowns
  };
};

/**
 * Hook personalizado para manejar los mensajes de bienvenida rotativos
 * @param {boolean} hasStartedChat - Si el chat ha comenzado
 * @returns {UseWelcomeMessagesReturn} Estado del mensaje de bienvenida actual
 */
export const useWelcomeMessages = (hasStartedChat: boolean): UseWelcomeMessagesReturn => {
  const [welcomeMessageIndex, setWelcomeMessageIndex] = useState<number>(0);

  // Rotar mensajes de bienvenida cada 3 segundos
  useEffect(() => {
    if (!hasStartedChat) {
      const interval = setInterval(() => {
        setWelcomeMessageIndex(prev => (prev + 1) % WELCOME_MESSAGES.length);
      }, WELCOME_MESSAGE_INTERVAL);

      return () => clearInterval(interval);
    }
  }, [hasStartedChat]);

  return {
    currentWelcomeMessage: WELCOME_MESSAGES[welcomeMessageIndex],
    hasWelcomeMessages: !hasStartedChat
  };
};

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
