import type { Tab } from '../types/hooks';

/**
 * Carga todas las pestañas disponibles del navegador
 * @returns {Promise<Tab[]>} Array de pestañas
 */
export const loadTabs = async (): Promise<Tab[]> => {
  try {
    if (chrome && chrome.tabs) {
      const tabsData = await chrome.tabs.query({});
      return tabsData as Tab[];
    }
    return [];
  } catch (error) {
    console.log('No se pudieron cargar las pestañas:', error);
    return [];
  }
};

/**
 * Valida si se puede agregar más pestañas sin exceder el límite
 * @param {Tab[]} selectedTabs - Pestañas ya seleccionadas
 * @param {boolean} showCurrentTab - Si está mostrando el indicador de pestaña actual
 * @param {number} maxLimit - Límite máximo de selecciones
 * @returns {boolean} True si se puede agregar más pestañas
 */
export const validateTabSelection = (selectedTabs: Tab[], showCurrentTab: boolean, maxLimit: number = 5): boolean => {
  const totalSelected = selectedTabs.length + (showCurrentTab ? 1 : 0);
  return totalSelected < maxLimit;
};

/**
 * Verifica si se puede mostrar el indicador de pestaña actual
 * @param {Tab[]} selectedTabs - Pestañas ya seleccionadas
 * @param {boolean} showCurrentTab - Estado actual del indicador
 * @param {number} maxLimit - Límite máximo de selecciones
 * @returns {boolean} True si se puede mostrar
 */
export const canShowCurrentTab = (selectedTabs: Tab[], showCurrentTab: boolean, maxLimit: number = 5): boolean => {
  const totalSelected = selectedTabs.length + (showCurrentTab ? 0 : 1);
  return totalSelected <= maxLimit;
};

/**
 * Maneja la selección de una pestaña para contexto
 * @param {Tab} tab - Pestaña a seleccionar
 * @param {Tab[]} selectedTabs - Pestañas ya seleccionadas
 * @param {Tab | null} currentActiveTab - Pestaña activa actual
 * @param {boolean} showCurrentTabIndicator - Si mostrar indicador de pestaña actual
 * @param {Function} addTab - Función para agregar pestaña
 * @param {Function} removeTab - Función para remover pestaña
 * @param {Function} removeCurrentTab - Función para remover indicador de pestaña actual
 * @returns {Object} Resultado de la operación
 */
export const handleTabSelection = (
  tab: Tab, 
  selectedTabs: Tab[], 
  currentActiveTab: Tab | null, 
  showCurrentTabIndicator: boolean,
  addTab: (tab: Tab) => boolean,
  removeTab: (tabId: number) => void,
  removeCurrentTab: () => void
): { success: boolean; action: string } => {
  // Si es la pestaña activa y está activada, desactivar el current tab context
  if (showCurrentTabIndicator && currentActiveTab && currentActiveTab.id === tab.id) {
    removeCurrentTab();
    // Después de desactivar, permitir seleccionar la pestaña manualmente
    if (!addTab(tab)) {
      return { success: false, action: 'add_failed' };
    }
    return { success: true, action: 'current_tab_removed_and_added' };
  }
  
  const isAlreadySelected = selectedTabs.find(t => t.id === tab.id);
  
  if (isAlreadySelected) {
    removeTab(tab.id);
    return { success: true, action: 'removed' };
  } else {
    if (!addTab(tab)) {
      return { success: false, action: 'add_failed' };
    }
    return { success: true, action: 'added' };
  }
};

/**
 * Maneja la opción de contexto seleccionada
 * @param {Object} option - Opción seleccionada
 * @param {Tab | null} currentActiveTab - Pestaña activa actual
 * @param {Tab[]} selectedTabs - Pestañas seleccionadas
 * @param {Function} toggleCurrentTab - Función para toggle del indicador de pestaña actual
 * @param {Function} removeTab - Función para remover pestaña
 * @returns {Object} Resultado de la operación
 */
export const handleContextOption = (
  option: { value: string }, 
  currentActiveTab: Tab | null, 
  selectedTabs: Tab[], 
  toggleCurrentTab: () => boolean, 
  removeTab: (tabId: number) => void
): { success: boolean; action: string } => {
  if (option.value === 'current-tab') {
    if (toggleCurrentTab()) {
      // Si se activó el current tab, remover la pestaña activa de selectedTabs si ya está ahí
      if (currentActiveTab) {
        const isAlreadySelected = selectedTabs.find(t => t.id === currentActiveTab.id);
        if (isAlreadySelected) {
          removeTab(currentActiveTab.id);
        }
      }
      return { success: true, action: 'current_tab_activated' };
    } else {
      return { success: false, action: 'toggle_failed' };
    }
  }
  
  return { success: true, action: 'no_action_needed' };
};
