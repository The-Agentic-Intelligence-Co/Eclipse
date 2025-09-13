import { useState, useEffect } from 'react';
import type { 
  UseDropdownManagementReturn
} from '../../types/hooks';

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
