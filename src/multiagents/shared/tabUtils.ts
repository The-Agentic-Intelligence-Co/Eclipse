// Utilities for tab handling and browser context

import type { Tab } from "../tools/tabs/types";

// Unifies selected tabs with current active tab
export function getUnifiedTabs(
  selectedTabs: Tab[], 
  currentActiveTab: Tab | null, 
  showCurrentTabIndicator: boolean
): Tab[] {
  const allTabs = [...selectedTabs];
  if (currentActiveTab && showCurrentTabIndicator && !selectedTabs.some(tab => tab.id === currentActiveTab.id)) {
    allTabs.push(currentActiveTab);
  }
  console.log('allTabs in getUnifiedTabs', allTabs);
  return allTabs;
}

// Adds tab context to messages with real-time updated state
export async function addTabContext(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>, 
  selectedTabs: Tab[], 
  currentActiveTab: Tab | null, 
  showCurrentTabIndicator: boolean
): Promise<Array<{ role: 'user' | 'assistant'; content: string }>> {
  if (!selectedTabs?.length && !(currentActiveTab && showCurrentTabIndicator)) return messages;
  
  // Get current state of tabs in real-time
  const currentActiveTabInfo = await getCurrentActiveTab();
  
  const contextParts: string[] = [];
  if (selectedTabs?.length) {
    contextParts.push(`**Selected tabs:**\n${selectedTabs.map(tab => `- **${tab.title}** (${tab.url})`).join('\n')}`);
  }
  
  // Use current active tab instead of obsolete one
  if (currentActiveTabInfo && showCurrentTabIndicator) {
    contextParts.push(`**Current active tab:**\n- **${currentActiveTabInfo.title}** (${currentActiveTabInfo.url})`);
  }
  
  console.log('contextParts in addTabContext (updated)', contextParts);
  
  const enhancedMessages = [...messages];
  if (enhancedMessages.length > 0) {
    enhancedMessages[0] = {
      ...enhancedMessages[0],
      content: `${enhancedMessages[0].content}\n\n**Context from browser tabs:**\n${contextParts.join('\n\n')}`
    };
  }
  return enhancedMessages;
}

// Gets current active tab in real-time
async function getCurrentActiveTab(): Promise<Tab | null> {
  try {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (activeTab && activeTab.id && activeTab.url) {
      return {
        id: activeTab.id,
        title: activeTab.title || 'Untitled',
        url: activeTab.url
      };
    }
    return null;
  } catch (error) {
    console.warn('Error getting current active tab:', error);
    return null;
  }
}
