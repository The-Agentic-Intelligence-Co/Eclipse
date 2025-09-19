// Cursor positioning utilities for editable elements

// Moves cursor to the end of an editable element
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
