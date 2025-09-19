// Text formatting and manipulation utilities

// Cuts text to max length and adds "..." if needed
export const truncateText = (text: string, maxLength: number): string => {
  if (!text || typeof text !== 'string') return '';
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

// Formats tab title for main dropdown (default 25 chars)
export const formatTabTitle = (title: string, maxLength: number = 25): string => {
  return truncateText(title, maxLength);
};

// Formats tab title for short indicator (default 15 chars)
export const formatTabTitleShort = (title: string, maxLength: number = 15): string => {
  return truncateText(title, maxLength);
};
