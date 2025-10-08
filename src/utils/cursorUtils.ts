// Cursor positioning utilities for editable elements

// Moves cursor to the end of an editable element
export const positionCursorAtEnd = (element: HTMLElement | null): void => {
  if (!element) return;
  
  const range = document.createRange();
  const selection = window.getSelection();
  
  if (!selection) return;
  
  // Select all element content
  range.selectNodeContents(element);
  
  // Collapse selection to the end
  range.collapse(false);
  
  // Apply the selection
  selection.removeAllRanges();
  selection.addRange(range);
};
