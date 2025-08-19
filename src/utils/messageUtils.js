/**
 * Utilidades para el manejo de mensajes del chat
 */

/**
 * Calcula el número de filas necesarias para un textarea basándose en el contenido
 * @param {string} content - Contenido del mensaje
 * @returns {number} Número de filas recomendadas
 */
export const calculateTextareaRows = (content) => {
  if (!content) return 1;
  const lines = content.split('\n');
  return Math.max(1, lines.length);
};

/**
 * Valida si un mensaje está vacío o solo contiene espacios
 * @param {string} content - Contenido del mensaje
 * @returns {boolean} True si el mensaje está vacío
 */
export const isMessageEmpty = (content) => {
  return !content || content.trim() === '';
};

/**
 * Formatea un mensaje para mostrar en la interfaz
 * @param {string} content - Contenido del mensaje
 * @param {number} maxLength - Longitud máxima antes de truncar
 * @returns {string} Mensaje formateado
 */
export const formatMessageContent = (content, maxLength = 100) => {
  if (!content) return '';
  
  if (content.length <= maxLength) {
    return content;
  }
  
  return content.substring(0, maxLength) + '...';
};

/**
 * Genera un ID único para un mensaje
 * @returns {string} ID único del mensaje
 */
export const generateMessageId = () => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

/**
 * Determina si un mensaje es del usuario
 * @param {Object} message - Objeto del mensaje
 * @returns {boolean} True si es mensaje del usuario
 */
export const isUserMessage = (message) => {
  return message && message.type === 'user';
};

/**
 * Determina si un mensaje es de la IA
 * @param {Object} message - Objeto del mensaje
 * @returns {boolean} True si es mensaje de la IA
 */
export const isAIMessage = (message) => {
  return message && message.type === 'ai';
};
