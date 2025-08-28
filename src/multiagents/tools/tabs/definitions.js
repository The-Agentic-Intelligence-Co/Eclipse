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
      description: `Extrae el contenido de texto de una pestaña específica del navegador. Pestañas disponibles:\n${availableTabsInfo}`,
      parameters: {
        type: "object",
        properties: {
          tabId: {
            type: "number",
            description: `ID de la pestaña de la cual extraer contenido. IDs disponibles: ${selectedTabs.map(t => t.id).join(', ')}`
          },
          reason: {
            type: "string",
            description: "Razón por la cual se necesita extraer el contenido"
          }
        },
        required: ["tabId", "reason"]
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
      description: `Extrae el contenido de texto de múltiples pestañas seleccionadas. Pestañas disponibles:\n${availableTabsInfo}`,
      parameters: {
        type: "object",
        properties: {
          reason: {
            type: "string",
            description: "Razón por la cual se necesita extraer el contenido de múltiples pestañas"
          }
        },
        required: ["reason"]
      }
    }
  };
}
