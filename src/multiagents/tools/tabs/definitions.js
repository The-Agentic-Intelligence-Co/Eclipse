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
