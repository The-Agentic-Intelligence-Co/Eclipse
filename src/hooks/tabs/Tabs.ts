import { useState, useEffect } from 'react';
import { loadTabs, validateTabSelection, canShowCurrentTab } from '../../services/tabService';
import { TAB_LIMITS } from '../../constants';
import type { 
  Tab, 
  UseTabManagementReturn
} from '../../types/hooks';

/**
 * Hook personalizado para manejar la gestión de pestañas
 * @param {number} maxLimit - Límite máximo de pestañas seleccionables
 * @returns {UseTabManagementReturn} Estados y funciones para gestión de pestañas
 */
export const useTabManagement = (maxLimit: number = TAB_LIMITS.MAX_SELECTIONS): UseTabManagementReturn => {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [selectedTabs, setSelectedTabs] = useState<Tab[]>([]);
  const [showCurrentTabIndicator, setShowCurrentTabIndicator] = useState<boolean>(true); // Cambiado a true por defecto
  const [currentActiveTab, setCurrentActiveTab] = useState<Tab | null>(null); // Nueva: pestaña activa actual

  // Cargar pestañas al inicializar
  useEffect(() => {
    const initializeTabs = async (): Promise<void> => {
      const tabsData = await loadTabs();
      setTabs(tabsData);
      
      // Obtener la pestaña activa actual
      if (chrome && chrome.tabs) {
        try {
          const activeTab = await chrome.tabs.query({ active: true, currentWindow: true });
          if (activeTab.length > 0) {
            setCurrentActiveTab(activeTab[0] as Tab);
          }
        } catch (error) {
          console.log('Error al obtener pestaña activa:', error);
        }
      }
    };
    initializeTabs();
  }, []);

  // Listeners para cambios de pestaña en tiempo real
  useEffect(() => {
    if (!chrome || !chrome.tabs) return;

    // Listener para cambios de pestaña activa
    const handleTabActivated = async (activeInfo: chrome.tabs.TabActiveInfo): Promise<void> => {
      try {
        const activeTab = await chrome.tabs.get(activeInfo.tabId);
        setCurrentActiveTab(activeTab as Tab);
      } catch (error) {
        console.log('Error al obtener nueva pestaña activa:', error);
      }
    };

    // Listener para actualizaciones de pestañas
    const handleTabUpdated = (tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab): void => {
      // Actualizar la lista de pestañas
      setTabs(prevTabs => {
        const updatedTabs = prevTabs.map(t => t.id === tabId ? (tab as Tab) : t);
        return updatedTabs;
      });
      
      // Si es la pestaña activa, actualizarla también
      if (changeInfo.status === 'complete' || changeInfo.title || changeInfo.url) {
        setCurrentActiveTab(prevActiveTab => {
          if (prevActiveTab && prevActiveTab.id === tabId) {
            return tab as Tab;
          }
          return prevActiveTab;
        });
      }
    };

    // Listener para cierre de pestañas
    const handleTabRemoved = (tabId: number): void => {
      setTabs(prevTabs => {
        const filteredTabs = prevTabs.filter(t => t.id !== tabId);
        return filteredTabs;
      });
      
      // Si se cerró la pestaña activa, limpiar el estado
      if (currentActiveTab && currentActiveTab.id === tabId) {
        setCurrentActiveTab(null);
      }
      
      // Remover de pestañas seleccionadas si estaba ahí
      setSelectedTabs(prev => prev.filter(t => t.id !== tabId));
    };

    // Listener para nuevas pestañas
    const handleTabCreated = (tab: chrome.tabs.Tab): void => {
      setTabs(prevTabs => {
        // Verificar que la pestaña no esté ya en la lista
        const tabExists = prevTabs.find(t => t.id === tab.id);
        if (!tabExists) {
          return [...prevTabs, tab as Tab];
        }
        return prevTabs;
      });
    };

    // Agregar listeners
    chrome.tabs.onActivated.addListener(handleTabActivated);
    chrome.tabs.onUpdated.addListener(handleTabUpdated);
    chrome.tabs.onRemoved.addListener(handleTabRemoved);
    chrome.tabs.onCreated.addListener(handleTabCreated);

    // Cleanup: remover listeners
    return () => {
      chrome.tabs.onActivated.removeListener(handleTabActivated);
      chrome.tabs.onUpdated.removeListener(handleTabUpdated);
      chrome.tabs.onRemoved.removeListener(handleTabRemoved);
      chrome.tabs.onCreated.removeListener(handleTabCreated);
    };
  }, [currentActiveTab]); // Agregar currentActiveTab como dependencia para que se actualice correctamente

  /**
   * Agrega una pestaña a la selección
   * @param {Tab} tab - Pestaña a agregar
   * @returns {boolean} True si se agregó exitosamente
   */
  const addTab = (tab: Tab): boolean => {
    if (validateTabSelection(selectedTabs, showCurrentTabIndicator, maxLimit)) {
      setSelectedTabs(prev => [...prev, tab]);
      return true;
    }
    return false;
  };

  /**
   * Remueve una pestaña de la selección
   * @param {number} tabId - ID de la pestaña a remover
   */
  const removeTab = (tabId: number): void => {
    setSelectedTabs(prev => prev.filter(t => t.id !== tabId));
  };

  /**
   * Toggle del indicador de pestaña actual
   * @returns {boolean} True si se cambió exitosamente
   */
  const toggleCurrentTab = (): boolean => {
    if (canShowCurrentTab(selectedTabs, showCurrentTabIndicator, maxLimit)) {
      setShowCurrentTabIndicator(prev => !prev);
      return true;
    }
    return false;
  };

  /**
   * Remueve el indicador de pestaña actual
   */
  const removeCurrentTab = (): void => {
    setShowCurrentTabIndicator(false);
  };

  /**
   * Calcula el total de opciones seleccionadas
   */
  const totalSelected = selectedTabs.length + (showCurrentTabIndicator ? 1 : 0);

  return {
    // Estado
    tabs,
    selectedTabs,
    showCurrentTabIndicator,
    currentActiveTab, // Nuevo estado
    
    // Acciones
    addTab,
    removeTab,
    toggleCurrentTab,
    removeCurrentTab,
    
    // Valores calculados
    totalSelected,
    maxLimit
  };
};
