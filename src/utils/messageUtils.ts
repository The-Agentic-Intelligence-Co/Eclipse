/**
 * Utilidades para el manejo de mensajes del chat
 */

/**
 * Valida si un mensaje está vacío o solo contiene espacios
 * @param {string} content - Contenido del mensaje
 * @returns {boolean} True si el mensaje está vacío
 */
export const isMessageEmpty = (content: string): boolean => {
  return !content || content.trim() === '';
};

/**
 * Genera un ID único para un mensaje
 * @returns {string} ID único del mensaje
 */
export const generateMessageId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};
