import { useState, useEffect } from 'react';
import { loadTabs, validateTabSelection, canShowCurrentTab } from '../../services/tabs';
import { TAB_LIMITS } from '../../constants';
import type { Tab, UseTabManagementReturn } from '../../types/hooks';

// Manages browser tabs and their selection
export const useTabManagement = (maxLimit: number = TAB_LIMITS.MAX_SELECTIONS): UseTabManagementReturn => {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [selectedTabs, setSelectedTabs] = useState<Tab[]>([]);
  const [showCurrentTabIndicator, setShowCurrentTabIndicator] = useState<boolean>(true);
  const [currentActiveTab, setCurrentActiveTab] = useState<Tab | null>(null);

  // Load tabs on initialization
  useEffect(() => {
    const initializeTabs = async (): Promise<void> => {
      const tabsData = await loadTabs();
      setTabs(tabsData);
      
      // Get current active tab
      if (chrome && chrome.tabs) {
        try {
          const activeTab = await chrome.tabs.query({ active: true, currentWindow: true });
          if (activeTab.length > 0) {
            setCurrentActiveTab(activeTab[0] as Tab);
          }
        } catch (error) {
          console.log('Error getting active tab:', error);
        }
      }
    };
    initializeTabs();
  }, []);

  // Listen for real-time tab changes
  useEffect(() => {
    if (!chrome || !chrome.tabs) return;

    // Handle active tab changes
    const handleTabActivated = async (activeInfo: chrome.tabs.TabActiveInfo): Promise<void> => {
      try {
        const activeTab = await chrome.tabs.get(activeInfo.tabId);
        setCurrentActiveTab(activeTab as Tab);
      } catch (error) {
        console.log('Error getting new active tab:', error);
      }
    };

    // Handle tab updates
    const handleTabUpdated = (tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab): void => {
      // Update tabs list
      setTabs(prevTabs => {
        const updatedTabs = prevTabs.map(t => t.id === tabId ? (tab as Tab) : t);
        return updatedTabs;
      });
      
      // Update active tab if it's the current one
      if (changeInfo.status === 'complete' || changeInfo.title || changeInfo.url) {
        setCurrentActiveTab(prevActiveTab => {
          if (prevActiveTab && prevActiveTab.id === tabId) {
            return tab as Tab;
          }
          return prevActiveTab;
        });
      }
    };

    // Handle tab removal
    const handleTabRemoved = (tabId: number): void => {
      setTabs(prevTabs => {
        const filteredTabs = prevTabs.filter(t => t.id !== tabId);
        return filteredTabs;
      });
      
      // Clear active tab if it was closed
      if (currentActiveTab && currentActiveTab.id === tabId) {
        setCurrentActiveTab(null);
      }
      
      // Remove from selected tabs if it was there
      setSelectedTabs(prev => prev.filter(t => t.id !== tabId));
    };

    // Handle new tabs
    const handleTabCreated = (tab: chrome.tabs.Tab): void => {
      setTabs(prevTabs => {
        // Check if tab already exists in list
        const tabExists = prevTabs.find(t => t.id === tab.id);
        if (!tabExists) {
          return [...prevTabs, tab as Tab];
        }
        return prevTabs;
      });
    };

    // Add listeners
    chrome.tabs.onActivated.addListener(handleTabActivated);
    chrome.tabs.onUpdated.addListener(handleTabUpdated);
    chrome.tabs.onRemoved.addListener(handleTabRemoved);
    chrome.tabs.onCreated.addListener(handleTabCreated);

    // Cleanup: remove listeners
    return () => {
      chrome.tabs.onActivated.removeListener(handleTabActivated);
      chrome.tabs.onUpdated.removeListener(handleTabUpdated);
      chrome.tabs.onRemoved.removeListener(handleTabRemoved);
      chrome.tabs.onCreated.removeListener(handleTabCreated);
    };
  }, [currentActiveTab]);

  // Add tab to selection
  const addTab = (tab: Tab): boolean => {
    if (validateTabSelection(selectedTabs, showCurrentTabIndicator, maxLimit)) {
      setSelectedTabs(prev => [...prev, tab]);
      return true;
    }
    return false;
  };

  // Remove tab from selection
  const removeTab = (tabId: number): void => {
    setSelectedTabs(prev => prev.filter(t => t.id !== tabId));
  };

  // Toggle current tab indicator
  const toggleCurrentTab = (): boolean => {
    if (canShowCurrentTab(selectedTabs, showCurrentTabIndicator, maxLimit)) {
      setShowCurrentTabIndicator(prev => !prev);
      return true;
    }
    return false;
  };

  // Remove current tab indicator
  const removeCurrentTab = (): void => {
    setShowCurrentTabIndicator(false);
  };

  // Calculate total selected options
  const totalSelected = selectedTabs.length + (showCurrentTabIndicator ? 1 : 0);

  return {
    // State
    tabs,
    selectedTabs,
    showCurrentTabIndicator,
    currentActiveTab,
    
    // Actions
    addTab,
    removeTab,
    toggleCurrentTab,
    removeCurrentTab,
    
    // Computed values
    totalSelected,
    maxLimit
  };
};
