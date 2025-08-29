/**
 * Ejecutores de herramientas de DOM
 */

import { extractDomContent } from './extractor.js';

/**
 * Ejecuta la herramienta extract_dom_content
 */
export async function executeExtractDomContent(toolCall) {
  const args = JSON.parse(toolCall.function.arguments);
  const { reason } = args;
  
  try {
    const domContent = await extractDomContent();
    
    console.log("Contenido del DOM extraído exitosamente");
    return {
      tool_call_id: toolCall.id,
      functionName: toolCall.function.name,
      content: `✅ Contenido del DOM extraído exitosamente de la pestaña activa.\n\n**Razón:** ${reason}\n\n**Contenido del DOM (body):**\n\`\`\`html\n${domContent}\n\`\`\`\n\nEl contenido del DOM ha sido limpiado solo del atributo 'style', preservando la estructura y todos los demás atributos como class, id, data-*, aria-*, etc.`,
      success: true
    };
    
  } catch (error) {
    console.error('Error al ejecutar extract_dom_content:', error);
    return {
      tool_call_id: toolCall.id,
      functionName: toolCall.function.name,
      content: `❌ Error al extraer contenido del DOM: ${error.message}`,
      success: false
    };
  }
}
