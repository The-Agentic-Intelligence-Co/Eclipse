/**
 * Definiciones de herramientas de pestañas para la IA
 */

/**
 * Crea la definición de la herramienta extract_tab_content
 */
export function createExtractTabContentTool(selectedTabs) {
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

/**
 * Crea la definición de la herramienta extract_multiple_tabs_content
 */
export function createExtractMultipleTabsContentTool(selectedTabs) {
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

/**
 * Crea la definición de la herramienta open_tab_with_url
 */
export function createOpenTabWithUrlTool() {
  return {
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
}

/**
 * Crea la definición de la herramienta group_tabs
 */
export function createGroupTabsTool() {
  return {
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
            items: {
              type: "number"
            },
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
}

/**
 * Crea la definición de la herramienta list_all_tabs
 */
export function createListAllTabsTool() {
  return {
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
}
