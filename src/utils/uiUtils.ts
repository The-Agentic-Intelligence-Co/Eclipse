// User interface and visual elements utilities

// Checks if input placeholder should be shown
export const shouldShowPlaceholder = (content: string, isFocused: boolean): boolean => {
  return !content && !isFocused;
};

// Returns default favicon for tabs without icon
export const getDefaultFavicon = (): string => {
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiByeD0iMiIgZmlsbD0iIzY2NjY2NiIvPgo8L3N2Zz4K';
};

// Hides favicon when it fails to load
export const handleFaviconError = (event: Event): void => {
  const target = event.target as HTMLImageElement;
  if (target) {
    target.style.display = 'none';
  }
};
