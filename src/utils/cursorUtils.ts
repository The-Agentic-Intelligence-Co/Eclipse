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
