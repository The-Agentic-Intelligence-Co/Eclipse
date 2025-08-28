/**
 * Ejecutores de herramientas de pestañas
 */

import { extractTabContent, extractMultipleTabsContent } from './extractor.js';

/**
 * Ejecuta la herramienta extract_tab_content
 */
export async function executeExtractTabContent(toolCall, selectedTabs) {
  const args = JSON.parse(toolCall.function.arguments);
  const { tabId, reason } = args;
  
  // Verificar que la pestaña esté en las seleccionadas
  const tab = selectedTabs.find(t => t.id === tabId);
  if (!tab) {
    console.log('❌ Pestaña no encontrada. IDs disponibles:', selectedTabs.map(t => t.id));
    return {
      tool_call_id: toolCall.id,
      functionName: toolCall.function.name,
      content: `Error: La pestaña con ID ${tabId} no está seleccionada o no existe. IDs disponibles: ${selectedTabs.map(t => t.id).join(', ')}`,
      success: false
    };
  }
  
  const content = await extractTabContent(tabId);
  console.log("Contenido extraído:", content);
  return {
    tool_call_id: toolCall.id,
    functionName: toolCall.function.name,
    content: `Contenido extraído de "${tab.title}" (${tab.url}):\n\n${content}`,
    success: true
  };
}

/**
 * Ejecuta la herramienta extract_multiple_tabs_content
 */
export async function executeExtractMultipleTabsContent(toolCall, selectedTabs) {
  const args = JSON.parse(toolCall.function.arguments);
  const { reason } = args;
  
  const extractedContent = await extractMultipleTabsContent(selectedTabs);
  const formattedContent = extractedContent.map(item => 
    `**${item.title}** (${item.url}):\n${item.content}\n`
  ).join('\n---\n');
  
  console.log("Contenido extraído:", formattedContent);
  return {
    tool_call_id: toolCall.id,
    functionName: toolCall.function.name,
    content: `Contenido extraído de ${selectedTabs.length} pestañas:\n\n${formattedContent}`,
    success: true
  };
}
