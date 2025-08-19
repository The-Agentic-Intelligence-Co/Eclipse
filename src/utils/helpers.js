/**
 * Trunca texto a una longitud máxima y agrega "..." si es necesario
 * @param {string} text - Texto a truncar
 * @param {number} maxLength - Longitud máxima permitida
 * @returns {string} Texto truncado o el texto original
 */
export const truncateText = (text, maxLength) => {
  if (!text || typeof text !== 'string') return '';
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

/**
 * Formatea el título de una pestaña para el dropdown principal
 * @param {string} title - Título de la pestaña
 * @param {number} maxLength - Longitud máxima (por defecto 25)
 * @returns {string} Título formateado
 */
export const formatTabTitle = (title, maxLength = 25) => {
  return truncateText(title, maxLength);
};

/**
 * Formatea el título de una pestaña para el indicador corto
 * @param {string} title - Título de la pestaña
 * @param {number} maxLength - Longitud máxima (por defecto 15)
 * @returns {string} Título formateado
 */
export const formatTabTitleShort = (title, maxLength = 15) => {
  return truncateText(title, maxLength);
};

/**
 * Verifica si se debe mostrar el placeholder del input
 * @param {string} content - Contenido del input
 * @param {boolean} isFocused - Si el input está enfocado
 * @returns {boolean} True si se debe mostrar el placeholder
 */
export const shouldShowPlaceholder = (content, isFocused) => {
  return !content && !isFocused;
};

/**
 * Obtiene el favicon por defecto para pestañas sin icono
 * @returns {string} URL del favicon por defecto
 */
export const getDefaultFavicon = () => {
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiByeD0iMiIgZmlsbD0iIzY2NjY2NiIvPgo8L3N2Zz4K';
};

/**
 * Maneja el error de carga de favicon
 * @param {Event} event - Evento de error
 */
export const handleFaviconError = (event) => {
  event.target.style.display = 'none';
};

/**
 * Verifica si una pestaña es la pestaña activa actual
 * @param {Object} tab - Pestaña a verificar
 * @param {Object} currentActiveTab - Pestaña activa actual
 * @param {boolean} showCurrentTabIndicator - Si mostrar indicador de pestaña actual
 * @returns {boolean} True si es la pestaña activa
 */
export const isCurrentActiveTab = (tab, currentActiveTab, showCurrentTabIndicator) => {
  return showCurrentTabIndicator && currentActiveTab && currentActiveTab.id === tab.id;
};

/**
 * Verifica si una pestaña está seleccionada
 * @param {Object} tab - Pestaña a verificar
 * @param {Array} selectedTabs - Pestañas seleccionadas
 * @returns {boolean} True si está seleccionada
 */
export const isTabSelected = (tab, selectedTabs) => {
  return selectedTabs.find(t => t.id === tab.id);
};
