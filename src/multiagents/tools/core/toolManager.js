/**
 * Gestor de herramientas para la IA - Versión refactorizada
 * Maneja la ejecución de tools y conversión de resultados
 */

import { 
  createExtractTabContentTool, 
  createExtractMultipleTabsContentTool
} from '../tabs/definitions.js';

import {
  SEARCH_YOUTUBE_TOOL,
  ANALYZE_VIDEO_TOOL,
  SEARCH_AND_ANALYZE_TOOL
} from '../video/definitions.js';

import {
  executeExtractTabContent,
  executeExtractMultipleTabsContent
} from '../tabs/executors.js';

import {
  executeSearchYoutube,
  executeAnalyzeVideoWithAI,
  executeSearchAndAnalyzeVideo
} from '../video/executors.js';

/**
 * Obtiene las herramientas disponibles para la IA basándose en las pestañas seleccionadas
 * @param {Array} selectedTabs - Pestañas seleccionadas para contexto
 * @returns {Array} Array de herramientas disponibles
 */
export function getAvailableTools(selectedTabs = []) {
  const tools = [];
  
  // Solo incluir la tool de extracción si hay pestañas seleccionadas
  if (selectedTabs && selectedTabs.length > 0) {
    // Agregar tool para extraer contenido de una pestaña específica
    tools.push(createExtractTabContentTool(selectedTabs));
    
    // Agregar tool para extraer contenido de múltiples pestañas si hay más de una
    if (selectedTabs.length > 1) {
      tools.push(createExtractMultipleTabsContentTool(selectedTabs));
    }
  }
  
  // Agregar tools de video (siempre disponibles)
  tools.push(SEARCH_YOUTUBE_TOOL);
  tools.push(ANALYZE_VIDEO_TOOL);
  tools.push(SEARCH_AND_ANALYZE_TOOL);
  
  return tools;
}

/**
 * Ejecuta una herramienta específica
 * @param {Object} toolCall - Llamada a la herramienta desde la IA
 * @param {Array} selectedTabs - Pestañas seleccionadas para contexto
 * @returns {Promise<Object>} Resultado de la ejecución de la herramienta
 */
export async function executeTool(toolCall, selectedTabs = []) {
  try {
    const toolName = toolCall.function.name;
    
    // Mapeo de herramientas a sus ejecutores
    const toolExecutors = {
      'extract_tab_content': () => executeExtractTabContent(toolCall, selectedTabs),
      'extract_multiple_tabs_content': () => executeExtractMultipleTabsContent(toolCall, selectedTabs),
      'search_youtube': () => executeSearchYoutube(toolCall),
      'analyze_video_with_ai': () => executeAnalyzeVideoWithAI(toolCall),
      'search_and_analyze_video': () => executeSearchAndAnalyzeVideo(toolCall)
    };
    
    const executor = toolExecutors[toolName];
    if (!executor) {
      return {
        tool_call_id: toolCall.id,
        functionName: toolName,
        content: `Error: Herramienta "${toolName}" no reconocida.`,
        success: false
      };
    }
    
    return await executor();
    
  } catch (error) {
    console.error('Error ejecutando tool:', error);
    return {
      tool_call_id: toolCall.id,
      functionName: toolCall.function.name,
      content: `Error ejecutando la herramienta: ${error.message}`,
      success: false
    };
  }
}

/**
 * Ejecuta múltiples herramientas en paralelo
 * @param {Array} toolCalls - Array de llamadas a herramientas
 * @param {Array} selectedTabs - Pestañas seleccionadas para contexto
 * @returns {Promise<Array>} Array de resultados de las herramientas
 */
export async function executeMultipleTools(toolCalls, selectedTabs = []) {
  if (!toolCalls || toolCalls.length === 0) {
    return [];
  }
  
  // Deduplicar tool calls por id
  const uniqueToolCalls = toolCalls.filter((toolCall, index, self) => 
    index === self.findIndex(tc => tc.id === toolCall.id)
  );
  
  // Ejecutar cada tool en paralelo
  const executionPromises = uniqueToolCalls.map(toolCall => 
    executeTool(toolCall, selectedTabs)
  );
  
  const results = await Promise.all(executionPromises);
  
  // Log simple de las tools ejecutadas
  const toolNames = uniqueToolCalls.map(tc => tc.function.name).join(', ');
  console.log(`🛠️ Tools ejecutadas: ${toolNames}`);
  
  return results;
}

/**
 * Convierte los resultados de las tools al formato de mensajes para Groq
 * @param {Array} toolResults - Resultados de las herramientas ejecutadas
 * @returns {Array} Array de mensajes en formato para Groq
 */
export function convertToolResultsToMessages(toolResults) {
  return toolResults.map(result => ({
    role: 'tool',
    tool_call_id: result.tool_call_id,
    name: result.functionName,
    content: result.content
  }));
}
