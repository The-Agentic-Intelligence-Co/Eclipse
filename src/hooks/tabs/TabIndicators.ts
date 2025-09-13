import { useState } from 'react';
import type { Tab, UseTabIndicatorsReturn } from '../../types/hooks';

// Handles tab indicators and visual selection logic
export const useTabIndicators = (
  selectedTabs: Tab[], 
  currentActiveTab: Tab | null, 
  showCurrentTabIndicator: boolean,
  addTab: (tab: Tab) => boolean,
  removeTab: (tabId: number) => void,
  removeCurrentTab: () => void
): UseTabIndicatorsReturn => {
  const [hoveredIndicator, setHoveredIndicator] = useState<string | null>(null);

  // Handle tab selection logic
  const handleTabSelection = (tab: Tab): boolean => {
    // If it's the active tab and indicator is on, turn off indicator
    if (showCurrentTabIndicator && currentActiveTab && currentActiveTab.id === tab.id) {
      removeCurrentTab();
      // After turning off, allow manual selection
      if (!addTab(tab)) {
        return false;
      }
      return true;
    }
    
    const isAlreadySelected = selectedTabs.find(t => t.id === tab.id);
    
    if (isAlreadySelected) {
      removeTab(tab.id);
      return true;
    } else {
      if (!addTab(tab)) {
        return false;
      }
      return true;
    }
  };

  // Handle context option selection
  const handleContextOption = (option: { value: string }, _closeAllDropdowns: () => void): boolean => {
    if (option.value === 'current-tab') {
      // Toggle logic is handled in parent component
      return true;
    }
    return false;
  };

  // Check if tab should show checkmark
  const shouldShowCheckmark = (tab: Tab): boolean => {
    const isSelected = !!selectedTabs.find(t => t.id === tab.id);
    const isCurrentActiveTab = showCurrentTabIndicator && currentActiveTab?.id === tab.id;
    return isSelected || isCurrentActiveTab;
  };

  return {
    // State
    hoveredIndicator,
    
    // Actions
    setHoveredIndicator,
    handleTabSelection,
    handleContextOption,
    shouldShowCheckmark
  };
};
