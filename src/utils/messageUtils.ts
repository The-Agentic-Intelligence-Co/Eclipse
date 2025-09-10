/**
 * Utilidades para el manejo de mensajes del chat
 */

/**
 * Calcula el número de filas necesarias para un textarea basándose en el contenido
 * @param {string} content - Contenido del mensaje
 * @returns {number} Número de filas recomendadas
 */
export const calculateTextareaRows = (content: string): number => {
  if (!content) return 1;
  const lines = content.split('\n');
  return Math.max(1, lines.length);
};

/**
 * Valida si un mensaje está vacío o solo contiene espacios
 * @param {string} content - Contenido del mensaje
 * @returns {boolean} True si el mensaje está vacío
 */
export const isMessageEmpty = (content: string): boolean => {
  return !content || content.trim() === '';
};

/**
 * Formatea un mensaje para mostrar en la interfaz
 * @param {string} content - Contenido del mensaje
 * @param {number} maxLength - Longitud máxima antes de truncar
 * @returns {string} Mensaje formateado
 */
export const formatMessageContent = (content: string, maxLength: number = 100): string => {
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
export const generateMessageId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

/**
 * Determina si un mensaje es del usuario
 * @param {Object} message - Objeto del mensaje
 * @returns {boolean} True si es mensaje del usuario
 */
export const isUserMessage = (message: any): boolean => {
  return message && message.type === 'user';
};

/**
 * Determina si un mensaje es de la IA
 * @param {Object} message - Objeto del mensaje
 * @returns {boolean} True si es mensaje de la IA
 */
export const isAIMessage = (message: any): boolean => {
  return message && message.type === 'ai';
};
