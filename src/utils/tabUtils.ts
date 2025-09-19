// Browser tab management utilities

import type { Tab } from '../types/hooks';

// Checks if tab is the currently active tab
export const isCurrentActiveTab = (tab: Tab, currentActiveTab: Tab | null, showCurrentTabIndicator: boolean): boolean => {
  return !!(showCurrentTabIndicator && currentActiveTab && currentActiveTab.id === tab.id);
};

// Checks if tab is selected by user
export const isTabSelected = (tab: Tab, selectedTabs: Tab[]): boolean => {
  return selectedTabs.some(t => t.id === tab.id);
};
