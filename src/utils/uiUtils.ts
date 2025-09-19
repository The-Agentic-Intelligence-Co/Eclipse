/**
 * Utilidades para interfaz de usuario y elementos visuales
 */

/**
 * Verifica si se debe mostrar el placeholder del input
 * @param {string} content - Contenido del input
 * @param {boolean} isFocused - Si el input está enfocado
 * @returns {boolean} True si se debe mostrar el placeholder
 */
export const shouldShowPlaceholder = (content: string, isFocused: boolean): boolean => {
  return !content && !isFocused;
};

/**
 * Obtiene el favicon por defecto para pestañas sin icono
 * @returns {string} URL del favicon por defecto
 */
export const getDefaultFavicon = (): string => {
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiByeD0iMiIgZmlsbD0iIzY2NjY2NiIvPgo8L3N2Zz4K';
};

/**
 * Maneja el error de carga de favicon
 * @param {Event} event - Evento de error
 */
export const handleFaviconError = (event: Event): void => {
  const target = event.target as HTMLImageElement;
  if (target) {
    target.style.display = 'none';
  }
};
