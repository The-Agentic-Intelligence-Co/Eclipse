import type { Tab } from '../../types/hooks';

// Get all open browser tabs
export const loadTabs = async (): Promise<Tab[]> => {
  try {
    return chrome?.tabs ? (await chrome.tabs.query({}) as Tab[]) : [];
  } catch (error) {
    console.log('No se pudieron cargar las pestañas:', error);
    return [];
  }
};

// Check if we can add more tabs (max 5)
export const validateTabSelection = (selectedTabs: Tab[], showCurrentTab: boolean, maxLimit: number = 5): boolean => {
  return selectedTabs.length + (showCurrentTab ? 1 : 0) < maxLimit;
};

// Check if we can show the current tab indicator
export const canShowCurrentTab = (selectedTabs: Tab[], showCurrentTab: boolean, maxLimit: number = 5): boolean => {
  return selectedTabs.length + (showCurrentTab ? 0 : 1) <= maxLimit;
};
