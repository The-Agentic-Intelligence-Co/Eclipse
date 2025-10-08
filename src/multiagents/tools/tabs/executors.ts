// Tab tool executors

import { extractTabContent, extractMultipleTabsContent } from './extractor';
import type { Tab, ToolCall, ToolResult } from './types';

// Extract content from a specific tab
export async function executeExtractTabContent(toolCall: ToolCall, selectedTabs: Tab[]): Promise<ToolResult> {
  const args = JSON.parse(toolCall.function.arguments);
  const { tabId } = args;

  // Check if tab is in the selected list
  const tab = selectedTabs.find(t => t.id === tabId);
  if (!tab) {
    console.log('❌ Tab not found. Available IDs:', selectedTabs.map(t => t.id));
    return {
      tool_call_id: toolCall.id,
      functionName: toolCall.function.name,
      content: `Error: Tab with ID ${tabId} is not selected or does not exist. Available IDs: ${selectedTabs.map(t => t.id).join(', ')}`,
      success: false
    };
  }
  
  const content = await extractTabContent(tabId);
  console.log("Content extracted:", content);
  return {
    tool_call_id: toolCall.id,
    functionName: toolCall.function.name,
    content: `Content extracted from "${tab.title}" (${tab.url}):\n\n${content}`,
    success: true
  };
}

// Extract content from multiple tabs
export async function executeExtractMultipleTabsContent(toolCall: ToolCall, selectedTabs: Tab[]): Promise<ToolResult> {
  // const args = JSON.parse(toolCall.function.arguments);
  // const { reason } = args; // Not used currently
  
  const extractedContent = await extractMultipleTabsContent(selectedTabs);
  const formattedContent = extractedContent.map(item => 
    `**${item.title}** (${item.url}):\n${item.content}\n`
  ).join('\n---\n');
  
  console.log("Content extracted:", formattedContent);
  return {
    tool_call_id: toolCall.id,
    functionName: toolCall.function.name,
    content: `Content extracted from ${selectedTabs.length} tabs:\n\n${formattedContent}`,
    success: true
  };
}

// Open a new tab with the given URL
export async function executeOpenTabWithUrl(toolCall: ToolCall): Promise<ToolResult & { newTab?: chrome.tabs.Tab }> {
  const args = JSON.parse(toolCall.function.arguments);
  const { url } = args;
  
  try {
    // Check and fix the URL format
    let normalizedUrl = url;
    if (!url || url.trim() === '') {
      normalizedUrl = 'https://google.com';
    } else if (!url.startsWith('http://') && !url.startsWith('https://')) {
      // Add https if no protocol
      normalizedUrl = `https://${url}`;
    }
    
    // Open new tab
    const newTab = await chrome.tabs.create({ url: normalizedUrl });
    
    // Wait until page loads completely
    await waitForPageLoad(newTab.id!);
    
    console.log("New tab created and loaded:", newTab);
    return {
      tool_call_id: toolCall.id,
      functionName: toolCall.function.name,
      content: `✅ New tab opened successfully with URL: ${normalizedUrl}\n\n**Tab details:**\n- ID: ${newTab.id}\n- Title: ${newTab.title || 'Loading...'}\n- URL: ${newTab.url || normalizedUrl}\n\n**Status:** Page fully loaded and ready for DOM read`,
      success: true,
      newTab: newTab
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error opening new tab:', error);
    return {
      tool_call_id: toolCall.id,
      functionName: toolCall.function.name,
      content: `❌ Error opening new tab: ${errorMessage}`,
      success: false
    };
  }
}

// Group browser tabs together
export async function executeGroupTabs(toolCall: ToolCall): Promise<ToolResult & { groupId?: number }> {
  const args = JSON.parse(toolCall.function.arguments);
  const { groupTitle, tabIds } = args;
  
  try {
    // Get all open tabs
    const allTabs = await chrome.tabs.query({});
    
    // Check if tabs exist
    const tabsToGroup = allTabs.filter(tab => tabIds.includes(tab.id!));
    
    if (tabsToGroup.length === 0) {
      return {
        tool_call_id: toolCall.id,
        functionName: toolCall.function.name,
        content: `❌ No valid tabs found to group. Requested IDs: ${tabIds.join(', ')}. Available IDs: ${allTabs.map(t => t.id).join(', ')}`,
        success: false
      };
    }
    
    if (tabsToGroup.length !== tabIds.length) {
      const missingIds = tabIds.filter((id: number) => !tabsToGroup.find(t => t.id === id));
      console.log('⚠️ Some tabs not found:', {
        requested: tabIds,
        found: tabsToGroup.map(t => t.id),
        missing: missingIds
      });
      
      return {
        tool_call_id: toolCall.id,
        functionName: toolCall.function.name,
        content: `⚠️ Some tabs not found. Missing IDs: ${missingIds.join(', ')}. Continuing with available tabs.`,
        success: false
      };
    }
    
    // Create tab group
    const groupId = await chrome.tabs.group({
      tabIds: tabsToGroup.map(t => t.id!)
    });
    
    // Set group name and color
    await chrome.tabGroups.update(groupId, {
      title: groupTitle,
      color: 'blue' // Default blue color
    });
    
    console.log("Tab group created:", groupId);
    return {
      tool_call_id: toolCall.id,
      functionName: toolCall.function.name,
      content: `✅ Tab group created successfully!\n\n**Group details:**\n- Title: "${groupTitle}"\n- Group ID: ${groupId}\n- Tabs grouped: ${tabsToGroup.length}\n- Tabs: ${tabsToGroup.map(t => `"${t.title}" (ID: ${t.id})`).join(', ')}`,
      success: true,
      groupId: groupId
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error grouping tabs:', error);
    return {
      tool_call_id: toolCall.id,
      functionName: toolCall.function.name,
      content: `❌ Error grouping tabs: ${errorMessage}`,
      success: false
    };
  }
}

// Wait until page loads completely
async function waitForPageLoad(tabId: number): Promise<void> {
  try {
    // Wait for page to load
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Page load timeout'));
      }, 30000); // 30 second timeout
      
      const checkPageLoad = async () => {
        try {
          const tab = await chrome.tabs.get(tabId);
          
          // Check if page loaded
          if (tab.status === 'complete') {
            clearTimeout(timeout);
            
            // Wait for DOM to be ready
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Check if DOM is ready
            const domReady = await chrome.scripting.executeScript({
              target: { tabId },
              func: () => {
                return new Promise<boolean>((resolve) => {
                  if (document.readyState === 'complete') {
                    resolve(true);
                  } else {
                    const handleLoad = () => {
                      document.removeEventListener('load', handleLoad);
                      resolve(true);
                    };
                    document.addEventListener('load', handleLoad);
                  }
                });
              }
            });
            
            if (domReady[0]?.result) {
              resolve();
            } else {
              reject(new Error('DOM not ready'));
            }
          } else {
            // Try again in 500ms
            setTimeout(checkPageLoad, 500);
          }
        } catch (error) {
          clearTimeout(timeout);
          reject(error);
        }
      };
      
      checkPageLoad();
    });
    
    console.log(`✅ Tab ${tabId} fully loaded and ready`);
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`❌ Error waiting for tab ${tabId} to load:`, error);
    throw new Error(`Error waiting for page load: ${errorMessage}`);
  }
}

// List all open browser tabs
export async function executeListAllTabs(toolCall: ToolCall): Promise<ToolResult & { totalTabs?: number }> {
  // const args = JSON.parse(toolCall.function.arguments);
  // const { reason } = args; // Not used currently
  
  try {
    // Get all open tabs
    const allTabs = await chrome.tabs.query({});
    
    // Format tab info
    const tabsInfo = allTabs.map(tab => {
      const status = tab.status === 'complete' ? '✅' : '⏳';
      const active = tab.active ? '🔥' : '';
      const pinned = tab.pinned ? '📌' : '';
      
      return `${status} ${active}${pinned} **ID ${tab.id}**: "${tab.title}" (${tab.url})`;
    }).join('\n');
    
    console.log("All tabs list:", allTabs);
    return {
      tool_call_id: toolCall.id,
      functionName: toolCall.function.name,
      content: `📋 **All open tabs** (${allTabs.length} total):\n\n${tabsInfo}\n\n**Legend:**\n- ✅ Tab fully loaded\n- ⏳ Tab loading\n- 🔥 Currently active tab\n- 📌 Pinned tab`,
      success: true,
      totalTabs: allTabs.length
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error listing tabs:', error);
    return {
      tool_call_id: toolCall.id,
      functionName: toolCall.function.name,
      content: `❌ Error listing tabs: ${errorMessage}`,
      success: false
    };
  }
}

// Switch to a specific tab
export async function executeSwitchToTab(toolCall: ToolCall): Promise<ToolResult & { switchedTab?: chrome.tabs.Tab }> {
  const args = JSON.parse(toolCall.function.arguments);
  const { tabId } = args;
  
  try {
    // Check if tab exists
    const tab = await chrome.tabs.get(tabId);
    
    if (!tab) {
      return {
        tool_call_id: toolCall.id,
        functionName: toolCall.function.name,
        content: `❌ Error: Tab with ID ${tabId} does not exist. Use list_all_tabs to see available tabs.`,
        success: false
      };
    }
    
    // Make tab active
    await chrome.tabs.update(tabId, { active: true });
    
    // Focus the window
    await chrome.windows.update(tab.windowId, { focused: true });
    
    console.log("Tab switch successful:", tab);
    return {
      tool_call_id: toolCall.id,
      functionName: toolCall.function.name,
      content: `✅ **Tab switch successful!**\n\n**Active tab:**\n- ID: ${tab.id}\n- Title: "${tab.title}"\n- URL: ${tab.url}\n- Status: ${tab.status === 'complete' ? '✅ Fully loaded' : '⏳ Loading'}\n\n**Status:** Now working on this tab.`,
      success: true,
      switchedTab: tab
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error switching tabs:', error);
    return {
      tool_call_id: toolCall.id,
      functionName: toolCall.function.name,
      content: `❌ Error switching tabs: ${errorMessage}\n\n**Suggestion:** Use list_all_tabs to see available tabs and their IDs.`,
      success: false
    };
  }
}