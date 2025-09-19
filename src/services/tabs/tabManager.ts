import type { Tab } from '../../types/hooks';

// Handle what happens when user clicks context menu options
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

// Handle adding or removing tabs when user clicks on them
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
