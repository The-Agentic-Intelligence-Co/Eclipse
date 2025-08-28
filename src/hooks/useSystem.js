import { useState, useEffect } from 'react';
import { loadTabs, validateTabSelection, canShowCurrentTab } from '../services/tabService';
import { TAB_LIMITS } from '../constants';
import { renderMarkdown } from '../utils/markdownUtils';

/**
 * Hook personalizado para manejar la gestión de pestañas
 * @param {number} maxLimit - Límite máximo de pestañas seleccionables
 * @returns {Object} Estados y funciones para gestión de pestañas
 */
export const useTabManagement = (maxLimit = TAB_LIMITS.MAX_SELECTIONS) => {
  const [tabs, setTabs] = useState([]);
  const [selectedTabs, setSelectedTabs] = useState([]);
  const [showCurrentTabIndicator, setShowCurrentTabIndicator] = useState(true); // Cambiado a true por defecto
  const [currentActiveTab, setCurrentActiveTab] = useState(null); // Nueva: pestaña activa actual

  // Cargar pestañas al inicializar
  useEffect(() => {
    const initializeTabs = async () => {
      const tabsData = await loadTabs();
      setTabs(tabsData);
      
      // Obtener la pestaña activa actual
      if (chrome && chrome.tabs) {
        try {
          const activeTab = await chrome.tabs.query({ active: true, currentWindow: true });
          if (activeTab.length > 0) {
            setCurrentActiveTab(activeTab[0]);
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
    const handleTabActivated = async (activeInfo) => {
      try {
        const activeTab = await chrome.tabs.get(activeInfo.tabId);
        setCurrentActiveTab(activeTab);
      } catch (error) {
        console.log('Error al obtener nueva pestaña activa:', error);
      }
    };

    // Listener para actualizaciones de pestañas
    const handleTabUpdated = (tabId, changeInfo, tab) => {
      // Actualizar la lista de pestañas
      setTabs(prevTabs => {
        const updatedTabs = prevTabs.map(t => t.id === tabId ? tab : t);
        return updatedTabs;
      });
      
      // Si es la pestaña activa, actualizarla también
      if (changeInfo.status === 'complete' || changeInfo.title || changeInfo.url) {
        setCurrentActiveTab(prevActiveTab => {
          if (prevActiveTab && prevActiveTab.id === tabId) {
            return tab;
          }
          return prevActiveTab;
        });
      }
    };

    // Listener para cierre de pestañas
    const handleTabRemoved = (tabId) => {
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
    const handleTabCreated = (tab) => {
      setTabs(prevTabs => {
        // Verificar que la pestaña no esté ya en la lista
        const tabExists = prevTabs.find(t => t.id === tab.id);
        if (!tabExists) {
          return [...prevTabs, tab];
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
   * @param {Object} tab - Pestaña a agregar
   * @returns {boolean} True si se agregó exitosamente
   */
  const addTab = (tab) => {
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
  const removeTab = (tabId) => {
    setSelectedTabs(prev => prev.filter(t => t.id !== tabId));
  };

  /**
   * Toggle del indicador de pestaña actual
   * @returns {boolean} True si se cambió exitosamente
   */
  const toggleCurrentTab = () => {
    if (canShowCurrentTab(selectedTabs, showCurrentTabIndicator, maxLimit)) {
      setShowCurrentTabIndicator(prev => !prev);
      return true;
    }
    return false;
  };

  /**
   * Remueve el indicador de pestaña actual
   */
  const removeCurrentTab = () => {
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

/**
 * Hook personalizado para manejar el streaming de respuestas de IA
 * @returns {Object} Estados y funciones para streaming
 */
export const useStreaming = () => {
  const [streamingMessage, setStreamingMessage] = useState('');
  const [streamingHtml, setStreamingHtml] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  /**
   * Activa el modo streaming
   */
  const startStreaming = () => {
    setIsStreaming(true);
    setStreamingMessage('');
    setStreamingHtml('');
  };

  /**
   * Desactiva el modo streaming
   */
  const stopStreaming = () => {
    setIsStreaming(false);
    setStreamingMessage('');
    setStreamingHtml('');
  };

  /**
   * Maneja chunks del streaming
   * @param {string} chunk - Chunk individual del stream
   * @param {string} fullResponse - Respuesta completa hasta el momento
   * @param {boolean} isFirstChunk - Si es el primer chunk
   * @param {Function} onFirstChunk - Callback para el primer chunk
   */
  const handleStreamingChunk = (chunk, fullResponse, isFirstChunk, onFirstChunk) => {
    // Contenido normal de streaming
    setStreamingMessage(fullResponse);
    
    // Procesar markdown en tiempo real
    try {
      const htmlContent = renderMarkdown(fullResponse);
      setStreamingHtml(htmlContent);
    } catch (error) {
      console.error('Error procesando markdown:', error);
      setStreamingHtml(fullResponse); // Fallback a texto plano
    }
    
    // Ejecutar callback del primer chunk si existe
    if (isFirstChunk && onFirstChunk) {
      onFirstChunk();
    }
  };

  return {
    streamingMessage,
    streamingHtml,
    isStreaming,
    startStreaming,
    stopStreaming,
    handleStreamingChunk,
  };
};

/**
 * Hook personalizado para manejar la lógica de indicadores de pestañas
 * @param {Array} selectedTabs - Pestañas seleccionadas
 * @param {Object} currentActiveTab - Pestaña activa actual
 * @param {boolean} showCurrentTabIndicator - Si mostrar el indicador de pestaña actual
 * @param {Function} addTab - Función para agregar pestaña
 * @param {Function} removeTab - Función para remover pestaña
 * @param {Function} removeCurrentTab - Función para remover indicador de pestaña actual
 * @returns {Object} Estados y funciones para indicadores de pestañas
 */
export const useTabIndicators = (
  selectedTabs, 
  currentActiveTab, 
  showCurrentTabIndicator,
  addTab,
  removeTab,
  removeCurrentTab
) => {
  const [hoveredIndicator, setHoveredIndicator] = useState(null);

  /**
   * Maneja la selección de una pestaña
   * @param {Object} tab - Pestaña a seleccionar
   * @returns {boolean} True si la operación fue exitosa
   */
  const handleTabSelection = (tab) => {
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
  const handleContextOption = (option, closeAllDropdowns) => {
    if (option.value === 'current-tab') {
      // La lógica de toggle se maneja en el componente padre
      return true;
    }
    return false;
  };

  /**
   * Verifica si una pestaña debe mostrar checkmark
   * @param {Object} tab - Pestaña a verificar
   * @returns {boolean} True si debe mostrar checkmark
   */
  const shouldShowCheckmark = (tab) => {
    const isSelected = selectedTabs.find(t => t.id === tab.id);
    const isCurrentActiveTab = showCurrentTabIndicator && currentActiveTab && currentActiveTab.id === tab.id;
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
