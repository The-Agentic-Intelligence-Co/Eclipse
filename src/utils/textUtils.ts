/**
 * Utilidades para formateo y manipulación de texto
 */

/**
 * Trunca texto a una longitud máxima y agrega "..." si es necesario
 * @param {string} text - Texto a truncar
 * @param {number} maxLength - Longitud máxima permitida
 * @returns {string} Texto truncado o el texto original
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (!text || typeof text !== 'string') return '';
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

/**
 * Formatea el título de una pestaña para el dropdown principal
 * @param {string} title - Título de la pestaña
 * @param {number} maxLength - Longitud máxima (por defecto 25)
 * @returns {string} Título formateado
 */
export const formatTabTitle = (title: string, maxLength: number = 25): string => {
  return truncateText(title, maxLength);
};

/**
 * Formatea el título de una pestaña para el indicador corto
 * @param {string} title - Título de la pestaña
 * @param {number} maxLength - Longitud máxima (por defecto 15)
 * @returns {string} Título formateado
 */
export const formatTabTitleShort = (title: string, maxLength: number = 15): string => {
  return truncateText(title, maxLength);
};
