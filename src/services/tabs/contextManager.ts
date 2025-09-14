import type { Tab } from '../../types/hooks';

// Handle context option selection for tabs
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
