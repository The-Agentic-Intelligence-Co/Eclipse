import { useState } from 'react';
import type { 
  Tab, 
  UseTabIndicatorsReturn 
} from '../../types/hooks';

/**
 * Hook personalizado para manejar la lógica de indicadores de pestañas
 * @param {Tab[]} selectedTabs - Pestañas seleccionadas
 * @param {Tab | null} currentActiveTab - Pestaña activa actual
 * @param {boolean} showCurrentTabIndicator - Si mostrar el indicador de pestaña actual
 * @param {Function} addTab - Función para agregar pestaña
 * @param {Function} removeTab - Función para remover pestaña
 * @param {Function} removeCurrentTab - Función para remover indicador de pestaña actual
 * @returns {UseTabIndicatorsReturn} Estados y funciones para indicadores de pestañas
 */
export const useTabIndicators = (
  selectedTabs: Tab[], 
  currentActiveTab: Tab | null, 
  showCurrentTabIndicator: boolean,
  addTab: (tab: Tab) => boolean,
  removeTab: (tabId: number) => void,
  removeCurrentTab: () => void
): UseTabIndicatorsReturn => {
  const [hoveredIndicator, setHoveredIndicator] = useState<string | null>(null);

  /**
   * Maneja la selección de una pestaña
   * @param {Tab} tab - Pestaña a seleccionar
   * @returns {boolean} True si la operación fue exitosa
   */
  const handleTabSelection = (tab: Tab): boolean => {
    // Si es la pestaña activa y está activada, desactivar el current tab context
    if (showCurrentTabIndicator && currentActiveTab && currentActiveTab.id === tab.id) {
      removeCurrentTab();
      // Después de desactivar, permitir seleccionar la pestaña manualmente
      if (!addTab(tab)) {
        return false;
      }
      return true;
    }
    
    const isAlreadySelected = selectedTabs.find(t => t.id === tab.id);
    
    if (isAlreadySelected) {
      removeTab(tab.id);
      return true;
    } else {
      if (!addTab(tab)) {
        return false;
      }
      return true;
    }
  };

  /**
   * Maneja la opción de contexto seleccionada
   * @param {Object} option - Opción seleccionada
   * @param {Function} closeAllDropdowns - Función para cerrar dropdowns
   * @returns {boolean} True si la operación fue exitosa
   */
  const handleContextOption = (option: { value: string }, _closeAllDropdowns: () => void): boolean => {
    if (option.value === 'current-tab') {
      // La lógica de toggle se maneja en el componente padre
      return true;
    }
    return false;
  };

  /**
   * Verifica si una pestaña debe mostrar checkmark
   * @param {Tab} tab - Pestaña a verificar
   * @returns {boolean} True si debe mostrar checkmark
   */
  const shouldShowCheckmark = (tab: Tab): boolean => {
    const isSelected = !!selectedTabs.find(t => t.id === tab.id);
    const isCurrentActiveTab = showCurrentTabIndicator && currentActiveTab?.id === tab.id;
    return isSelected || isCurrentActiveTab;
  };

  return {
    // Estado
    hoveredIndicator,
    
    // Acciones
    setHoveredIndicator,
    handleTabSelection,
    handleContextOption,
    shouldShowCheckmark
  };
};
