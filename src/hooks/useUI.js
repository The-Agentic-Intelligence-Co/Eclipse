import { useState, useEffect } from 'react';
import { WELCOME_MESSAGES, WELCOME_MESSAGE_INTERVAL } from '../constants/welcomeMessages';

/**
 * Hook personalizado para manejar la gestión de dropdowns
 * @returns {Object} Estados y funciones para gestión de dropdowns
 */
export const useDropdownManagement = () => {
  const [isContextDropdownOpen, setIsContextDropdownOpen] = useState(false);
  const [isModeDropdownOpen, setIsModeDropdownOpen] = useState(false);
  const [showTabSelection, setShowTabSelection] = useState(false);

  // Cerrar dropdowns al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      const contextDropdown = event.target.closest('.context-dropdown');
      const modeDropdown = event.target.closest('.custom-select');
      
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
    const handleEscape = (event) => {
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
  const toggleContextDropdown = () => {
    setIsContextDropdownOpen(prev => !prev);
  };

  /**
   * Abre o cierra el dropdown de modo
   */
  const toggleModeDropdown = () => {
    setIsModeDropdownOpen(prev => !prev);
  };

  /**
   * Muestra la selección de pestañas
   */
  const showTabSelectionMode = () => {
    setShowTabSelection(true);
  };

  /**
   * Oculta la selección de pestañas
   */
  const hideTabSelectionMode = () => {
    setShowTabSelection(false);
  };

  /**
   * Cierra todos los dropdowns
   */
  const closeAllDropdowns = () => {
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
 * @returns {Object} Estado del mensaje de bienvenida actual
 */
export const useWelcomeMessages = (hasStartedChat) => {
  const [welcomeMessageIndex, setWelcomeMessageIndex] = useState(0);

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
 * @returns {Object} Estados y funciones para el Footer
 */
export const useFooterState = () => {
  const [selectedMode, setSelectedMode] = useState('agent');
  const [content, setContent] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  /**
   * Maneja el input del usuario
   * @param {Event} e - Evento de input
   */
  const handleInput = (e) => {
    setContent(e.currentTarget.textContent);
  };

  /**
   * Maneja el foco del input
   * @param {boolean} focused - Si está enfocado
   */
  const handleFocus = (focused) => {
    setIsFocused(focused);
  };

  /**
   * Limpia el contenido del input
   */
  const clearContent = () => {
    setContent('');
  };

  /**
   * Obtiene el contenido actual del input
   * @returns {string} Contenido del input
   */
  const getContent = () => {
    return content;
  };

  /**
   * Verifica si el input tiene contenido
   * @returns {boolean} True si tiene contenido
   */
  const hasContent = () => {
    return content.trim().length > 0;
  };

  /**
   * Obtiene el modo seleccionado
   * @returns {string} Modo seleccionado
   */
  const getSelectedMode = () => {
    return selectedMode;
  };

  /**
   * Cambia el modo seleccionado
   * @param {string} mode - Nuevo modo
   */
  const changeMode = (mode) => {
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
