/**
 * Definiciones de herramientas de DOM para la IA
 */

/**
 * Crea la definición de la herramienta extract_dom_content
 */
export function createExtractDomContentTool() {
  return {
    type: "function",
    function: {
      name: "extract_dom_content",
      description: "Extracts the DOM content from the body of the current active tab, removing only the 'style' attribute while preserving all other attributes like class, id, data-*, aria-*, etc. This tool is useful for analyzing the structure and content of web pages without inline styling.",
      parameters: {
        type: "object",
        properties: {
          reason: {
            type: "string",
            description: "Reason why DOM extraction is needed"
          },
          userDescription: {
            type: "string",
            description: "Clear description in first person of what tool is being used and for what specific purpose (e.g., 'I am extracting the DOM content to analyze the page structure')"
          }
        },
        required: ["reason", "userDescription"]
      }
    }
  };
}
