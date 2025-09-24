/**
 * Gestor de herramientas para la IA - Versión refactorizada
 * Maneja la ejecución de tools y conversión de resultados
 */

import { 
  createExtractTabContentTool, 
  createExtractMultipleTabsContentTool,
  OPEN_TAB_WITH_URL_TOOL,
  GROUP_TABS_TOOL,
  LIST_ALL_TABS_TOOL,
  SWITCH_TO_TAB_TOOL
} from '../tabs/definitions';

import {
  SEARCH_YOUTUBE_TOOL,
  ANALYZE_VIDEO_TOOL,
  SEARCH_AND_ANALYZE_TOOL
} from '../video/definitions';

import {
  executeExtractTabContent,
  executeExtractMultipleTabsContent,
  executeOpenTabWithUrl,
  executeGroupTabs,
  executeListAllTabs,
  executeSwitchToTab
} from '../tabs/executors';

import {
  executeSearchYoutube,
  executeAnalyzeVideoWithAI,
  executeSearchAndAnalyzeVideo
} from '../video/executors';

import type { Tab, ToolDefinition, ToolCall, ToolResult } from '../tabs/types';
import { GET_INTERACTIVE_CONTEXT_TOOL, SCROLL_PAGE_TOOL, EXTRACT_PAGE_CONTENT_AND_CONTEXT_TOOL } from '../dom/definitions';
import { executeGetInteractiveContext, executeScrollPage, executeExtractPageContentAndContext } from '../dom/executors';

/**
 * Obtiene las herramientas disponibles para la IA basándose en las pestañas seleccionadas y el modo
 * @param {Tab[]} selectedTabs - Pestañas seleccionadas para contexto
 * @param {string} mode - Modo de operación ('ask' o 'agent')
 * @returns {ToolDefinition[]} Array de herramientas disponibles
 */
export function getAvailableTools(selectedTabs: Tab[] = [], mode: 'ask' | 'agent' = 'agent'): ToolDefinition[] {
  const tools: ToolDefinition[] = [];
  
  // Solo incluir la tool de extracción si hay pestañas seleccionadas
  if (selectedTabs && selectedTabs.length > 0) {
    // Agregar tool para extraer contenido de una pestaña específica
    tools.push(createExtractTabContentTool(selectedTabs));
    
    // Agregar tool para extraer contenido de múltiples pestañas si hay más de una
    if (selectedTabs.length > 1) {
      tools.push(createExtractMultipleTabsContentTool(selectedTabs));
    }
  }
  
  if (mode === 'ask') {
    tools.push(SEARCH_YOUTUBE_TOOL);
    tools.push(ANALYZE_VIDEO_TOOL);
    tools.push(SEARCH_AND_ANALYZE_TOOL);
  } else {
    tools.push(OPEN_TAB_WITH_URL_TOOL);
    tools.push(GROUP_TABS_TOOL);
    tools.push(LIST_ALL_TABS_TOOL);
    tools.push(SWITCH_TO_TAB_TOOL);
    tools.push(SEARCH_YOUTUBE_TOOL);
    tools.push(ANALYZE_VIDEO_TOOL);
    tools.push(SEARCH_AND_ANALYZE_TOOL);
    tools.push(GET_INTERACTIVE_CONTEXT_TOOL);
    tools.push(SCROLL_PAGE_TOOL);
    tools.push(EXTRACT_PAGE_CONTENT_AND_CONTEXT_TOOL);
  }

  return tools;
}

/**
 * Ejecuta una herramienta específica
 * @param {ToolCall} toolCall - Llamada a la herramienta desde la IA
 * @param {Tab[]} selectedTabs - Pestañas seleccionadas para contexto
 * @param {string} mode - Modo de operación ('ask' o 'agent')
 * @returns {Promise<ToolResult>} Resultado de la ejecución de la herramienta
 */
export async function executeTool(
  toolCall: ToolCall, 
  selectedTabs: Tab[] = [], 
  mode: 'ask' | 'agent' = 'agent'
): Promise<ToolResult> {
  try {
    const toolName = toolCall.function.name;
    
    // Validar que la herramienta esté permitida en el modo actual
    if (mode === 'ask') {
      const askModeTools = [
        'extract_tab_content',
        'extract_multiple_tabs_content',
        'search_youtube',
        'analyze_video_with_ai',
        'search_and_analyze_video'
      ];
      
      if (!askModeTools.includes(toolName)) {
        return {
          tool_call_id: toolCall.id,
          functionName: toolName,
          content: `❌ La herramienta "${toolName}" no está disponible en modo 'Ask'. Solo se permiten herramientas de análisis y consulta.`,
          success: false
        };
      }
    }
    
    // Mapeo de herramientas a sus ejecutores
    const toolExecutors: Record<string, () => Promise<ToolResult>> = {
      'extract_tab_content': () => executeExtractTabContent(toolCall, selectedTabs),
      'extract_multiple_tabs_content': () => executeExtractMultipleTabsContent(toolCall, selectedTabs),
      'open_tab_with_url': () => executeOpenTabWithUrl(toolCall),
      'group_tabs': () => executeGroupTabs(toolCall),
      'list_all_tabs': () => executeListAllTabs(toolCall),
      'switch_to_tab': () => executeSwitchToTab(toolCall),
      'search_youtube': () => executeSearchYoutube(toolCall),
      'analyze_video_with_ai': () => executeAnalyzeVideoWithAI(toolCall),
      'search_and_analyze_video': () => executeSearchAndAnalyzeVideo(toolCall),
      'get_interactive_context': () => executeGetInteractiveContext(toolCall),
      'scroll_page': () => executeScrollPage(toolCall),
      'extract_page_content_and_context': () => executeExtractPageContentAndContext(toolCall)
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
    console.error('Error en tool call:', toolCall);
    return {
      tool_call_id: toolCall.id,
      functionName: toolCall.function.name,
      content: `Error ejecutando la herramienta: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      success: false
    };
  }
}

/**
 * Ejecuta múltiples herramientas en paralelo
 * @param {ToolCall[]} toolCalls - Array de llamadas a herramientas
 * @param {Tab[]} selectedTabs - Pestañas seleccionadas para contexto
 * @param {string} mode - Modo de operación ('ask' o 'agent')
 * @returns {Promise<ToolResult[]>} Array de resultados de las herramientas
 */
export async function executeMultipleTools(
  toolCalls: ToolCall[], 
  selectedTabs: Tab[] = [], 
  mode: 'ask' | 'agent' = 'agent'
): Promise<ToolResult[]> {
  if (!toolCalls || toolCalls.length === 0) {
    return [];
  }
  
  // Deduplicar tool calls por id
  const uniqueToolCalls = toolCalls.filter((toolCall, index, self) => 
    index === self.findIndex(tc => tc.id === toolCall.id)
  );
  
  // Ejecutar cada tool en paralelo
  const executionPromises = uniqueToolCalls.map(toolCall => 
    executeTool(toolCall, selectedTabs, mode)
  );
  
  const results = await Promise.all(executionPromises);
  
  // Log simple de las tools ejecutadas
  const toolNames = uniqueToolCalls.map(tc => tc.function.name).join(', ');
  console.log(`🛠️ Tools ejecutadas: ${toolNames}`);
  
  return results;
}

/**
 * Convierte los resultados de las tools al formato de mensajes para Groq
 * @param {ToolResult[]} toolResults - Resultados de las herramientas ejecutadas
 * @returns {Array} Array de mensajes en formato para Groq
 */
export function convertToolResultsToMessages(toolResults: ToolResult[]): Array<{
  role: 'tool';
  tool_call_id: string;
  name: string;
  content: string;
}> {
  return toolResults.map(result => ({
    role: 'tool' as const,
    tool_call_id: result.tool_call_id,
    name: result.functionName,
    content: result.content
  }));
}
