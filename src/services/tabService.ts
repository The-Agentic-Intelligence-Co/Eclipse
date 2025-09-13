import type { Tab } from '../types/hooks';

// Load all available browser tabs
export const loadTabs = async (): Promise<Tab[]> => {
  try {
    return chrome?.tabs ? (await chrome.tabs.query({}) as Tab[]) : [];
  } catch (error) {
    console.log('No se pudieron cargar las pestañas:', error);
    return [];
  }
};

// Check if more tabs can be added without exceeding the limit
export const validateTabSelection = (selectedTabs: Tab[], showCurrentTab: boolean, maxLimit: number = 5): boolean => {
  return selectedTabs.length + (showCurrentTab ? 1 : 0) < maxLimit;
};

// Check if current tab indicator can be shown
export const canShowCurrentTab = (selectedTabs: Tab[], showCurrentTab: boolean, maxLimit: number = 5): boolean => {
  return selectedTabs.length + (showCurrentTab ? 0 : 1) <= maxLimit;
};

// Handle tab selection for context
export const handleTabSelection = (
  tab: Tab, 
  selectedTabs: Tab[], 
  currentActiveTab: Tab | null, 
  showCurrentTabIndicator: boolean,
  addTab: (tab: Tab) => boolean,
  removeTab: (tabId: number) => void,
  removeCurrentTab: () => void
): { success: boolean; action: string } => {
  // Handle current tab indicator removal and manual selection
  if (showCurrentTabIndicator && currentActiveTab?.id === tab.id) {
    removeCurrentTab();
    return addTab(tab) 
      ? { success: true, action: 'current_tab_removed_and_added' }
      : { success: false, action: 'add_failed' };
  }
  
  const isAlreadySelected = selectedTabs.some(t => t.id === tab.id);
  
  if (isAlreadySelected) {
    removeTab(tab.id);
    return { success: true, action: 'removed' };
  }
  
  return addTab(tab) 
    ? { success: true, action: 'added' }
    : { success: false, action: 'add_failed' };
};

// Handle context option selection
export const handleContextOption = (
  option: { value: string }, 
  currentActiveTab: Tab | null, 
  selectedTabs: Tab[], 
  toggleCurrentTab: () => boolean, 
  removeTab: (tabId: number) => void
): { success: boolean; action: string } => {
  if (option.value !== 'current-tab') {
    return { success: true, action: 'no_action_needed' };
  }

  if (!toggleCurrentTab()) {
    return { success: false, action: 'toggle_failed' };
  }

  // Remove current tab from selected tabs if it's already there
  if (currentActiveTab && selectedTabs.some(t => t.id === currentActiveTab.id)) {
    removeTab(currentActiveTab.id);
  }

  return { success: true, action: 'current_tab_activated' };
};
