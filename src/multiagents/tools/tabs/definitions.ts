// Tab tool definitions for AI

import type { Tab, ToolDefinition } from './types';

// Creates the extract_tab_content tool definition
export function createExtractTabContentTool(selectedTabs: Tab[]): ToolDefinition {
  const availableTabsInfo = selectedTabs.map(tab => 
    `ID ${tab.id}: "${tab.title}" (${tab.url})`
  ).join('\n');
  
  return {
    type: "function",
    function: {
      name: "extract_tab_content",
      description: `Extracts text content from a specific browser tab. Available tabs:\n${availableTabsInfo}`,
      parameters: {
        type: "object",
        properties: {
          tabId: {
            type: "number",
            description: `ID of the tab from which to extract content. Available IDs: ${selectedTabs.map(t => t.id).join(', ')}`
          },
          reason: {
            type: "string",
            description: "Reason why content extraction is needed"
          },
          userDescription: {
            type: "string",
            description: "Clear description in first person of what tool is being used and for what specific purpose (e.g., 'I am extracting content from this tab to analyze the information')"
          }
        },
        required: ["tabId", "reason", "userDescription"]
      }
    }
  };
}

// Creates the extract_multiple_tabs_content tool definition
export function createExtractMultipleTabsContentTool(selectedTabs: Tab[]): ToolDefinition {
  const availableTabsInfo = selectedTabs.map(tab => 
    `ID ${tab.id}: "${tab.title}" (${tab.url})`
  ).join('\n');
  
  return {
    type: "function",
    function: {
      name: "extract_multiple_tabs_content",
      description: `Extracts text content from multiple selected tabs. Available tabs:\n${availableTabsInfo}`,
      parameters: {
        type: "object",
        properties: {
          reason: {
            type: "string",
            description: "Reason why content extraction from multiple tabs is needed"
          },
          userDescription: {
            type: "string",
            description: "Clear description in first person of what tool is being used and for what specific purpose (e.g., 'I am extracting content from multiple tabs to compare information')"
          }
        },
        required: ["reason", "userDescription"]
      }
    }
  };
}

// Definition for open_tab_with_url tool
export const OPEN_TAB_WITH_URL_TOOL: ToolDefinition = {
  type: "function",
  function: {
    name: "open_tab_with_url",
    description: "Opens a new browser tab with a specific URL. Useful for navigating to websites, search results, or specific pages.",
    parameters: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "URL to open in the new tab. Must be a valid URL starting with http://, https://, or a valid protocol. Defaults to 'https://google.com' if not specified."
        },
        reason: {
          type: "string",
          description: "Reason why opening this URL is needed"
        },
        userDescription: {
          type: "string",
          description: "Clear description in first person of what tool is being used and for what specific purpose (e.g., 'I am opening a new tab to search for additional information')"
        }
      },
      required: ["reason", "userDescription"]
    }
  }
};

// Definition for group_tabs tool
export const GROUP_TABS_TOOL: ToolDefinition = {
  type: "function",
  function: {
    name: "group_tabs",
    description: "Groups browser tabs into a tab group for better organization. Can group any open tabs in the browser.",
    parameters: {
      type: "object",
      properties: {
        groupTitle: {
          type: "string",
          description: "Title for the new tab group. Should be descriptive and concise."
        },
        tabIds: {
          type: "array",
          description: "Array of tab IDs to group together. The tool will fetch all available tabs from the browser."
        },
        reason: {
          type: "string",
          description: "Reason why grouping these tabs is needed"
        },
        userDescription: {
          type: "string",
          description: "Clear description in first person of what tool is being used and for what specific purpose (e.g., 'I am grouping these tabs together to organize related research')"
        }
      },
      required: ["groupTitle", "tabIds", "reason", "userDescription"]
    }
  }
};

// Definition for list_all_tabs tool
export const LIST_ALL_TABS_TOOL: ToolDefinition = {
  type: "function",
  function: {
    name: "list_all_tabs",
    description: "Lists all open browser tabs to help with tab management and grouping decisions.",
    parameters: {
      type: "object",
      properties: {
        reason: {
          type: "string",
          description: "Reason why listing all tabs is needed"
        },
        userDescription: {
          type: "string",
          description: "Clear description in first person of what tool is being used and for what specific purpose (e.g., 'I am listing all open tabs to see what can be organized')"
        }
      },
      required: ["reason", "userDescription"]
    }
  }
};

// Definition for switch_to_tab tool
export const SWITCH_TO_TAB_TOOL: ToolDefinition = {
  type: "function",
  function: {
    name: "switch_to_tab",
    description: "Switches the active browser tab to a specific tab by its ID. Useful for navigating between different tabs during multi-tab workflows.",
    parameters: {
      type: "object",
      properties: {
        tabId: {
          type: "number",
          description: "ID of the tab to switch to. Use list_all_tabs to see available tab IDs."
        },
        reason: {
          type: "string",
          description: "Reason why switching to this tab is needed"
        },
        userDescription: {
          type: "string",
          description: "Clear description in first person of what tool is being used and for what specific purpose (e.g., 'I am switching to this tab to continue working on the current task')"
        }
      },
      required: ["tabId", "reason", "userDescription"]
    }
  }
};