import type { Tab } from '../../types/hooks';

// Handle tab selection and deselection for context
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
