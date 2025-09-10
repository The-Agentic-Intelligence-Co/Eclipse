/**
 * Utilidades para manejar el posicionamiento del cursor en elementos editables
 */

/**
 * Posiciona el cursor al final del contenido de un elemento editable
 * @param {HTMLElement} element - Elemento editable (contentEditable)
 */
export const positionCursorAtEnd = (element: HTMLElement | null): void => {
  if (!element) return;
  
  const range = document.createRange();
  const selection = window.getSelection();
  
  if (!selection) return;
  
  // Seleccionar todo el contenido del elemento
  range.selectNodeContents(element);
  
  // Colapsar la selección al final
  range.collapse(false);
  
  // Aplicar la selección
  selection.removeAllRanges();
  selection.addRange(range);
};

/**
 * Posiciona el cursor al inicio del contenido de un elemento editable
 * @param {HTMLElement} element - Elemento editable (contentEditable)
 */
export const positionCursorAtStart = (element: HTMLElement | null): void => {
  if (!element) return;
  
  const range = document.createRange();
  const selection = window.getSelection();
  
  if (!selection) return;
  
  // Seleccionar todo el contenido del elemento
  range.selectNodeContents(element);
  
  // Colapsar la selección al inicio
  range.collapse(true);
  
  // Aplicar la selección
  selection.removeAllRanges();
  selection.addRange(range);
};

/**
 * Posiciona el cursor en una posición específica del texto
 * @param {HTMLElement} element - Elemento editable (contentEditable)
 * @param {number} position - Posición del cursor (0 = inicio, -1 = final)
 */
export const positionCursorAt = (element: HTMLElement | null, position: number): void => {
  if (!element) return;
  
  if (position === -1) {
    positionCursorAtEnd(element);
    return;
  }
  
  if (position === 0) {
    positionCursorAtStart(element);
    return;
  }
  
  const range = document.createRange();
  const selection = window.getSelection();
  
  if (!selection) return;
  
  // Crear un nodo de texto temporal para posicionar el cursor
  const textNode = element.firstChild || element;
  const maxPosition = textNode.textContent ? textNode.textContent.length : 0;
  const safePosition = Math.min(position, maxPosition);
  
  range.setStart(textNode, safePosition);
  range.collapse(true);
  
  selection.removeAllRanges();
  selection.addRange(range);
};
