import { useState, useEffect } from 'react';
import type { UseDropdownManagementReturn } from '../../types/hooks';

// Manages dropdown states and interactions for the UI
export const useDropdownManagement = (): UseDropdownManagementReturn => {
  const [isContextDropdownOpen, setIsContextDropdownOpen] = useState<boolean>(false);
  const [isModeDropdownOpen, setIsModeDropdownOpen] = useState<boolean>(false);
  const [showTabSelection, setShowTabSelection] = useState<boolean>(false);

  // Close dropdowns when user clicks outside
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

  // Close dropdowns when user presses Escape key
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

  // Toggle context dropdown visibility
  const toggleContextDropdown = (): void => {
    setIsContextDropdownOpen(prev => !prev);
  };

  // Toggle mode dropdown visibility
  const toggleModeDropdown = (): void => {
    setIsModeDropdownOpen(prev => !prev);
  };

  // Show tab selection interface
  const showTabSelectionMode = (): void => {
    setShowTabSelection(true);
  };

  // Hide tab selection interface
  const hideTabSelectionMode = (): void => {
    setShowTabSelection(false);
  };

  // Close all open dropdowns at once
  const closeAllDropdowns = (): void => {
    setIsContextDropdownOpen(false);
    setIsModeDropdownOpen(false);
    setShowTabSelection(false);
  };

  return {
    isContextDropdownOpen,
    isModeDropdownOpen,
    showTabSelection,
    toggleContextDropdown,
    toggleModeDropdown,
    showTabSelectionMode,
    hideTabSelectionMode,
    closeAllDropdowns
  };
};
