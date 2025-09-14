import type { Tab } from '../../types/hooks';

// Check if more tabs can be added without exceeding the limit
export const validateTabSelection = (selectedTabs: Tab[], showCurrentTab: boolean, maxLimit: number = 5): boolean => {
  return selectedTabs.length + (showCurrentTab ? 1 : 0) < maxLimit;
};

// Check if current tab indicator can be shown
export const canShowCurrentTab = (selectedTabs: Tab[], showCurrentTab: boolean, maxLimit: number = 5): boolean => {
  return selectedTabs.length + (showCurrentTab ? 0 : 1) <= maxLimit;
};
