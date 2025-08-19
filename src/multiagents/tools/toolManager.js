/**
 * Gestor de herramientas para la IA
 * Maneja la ejecución de tools y conversión de resultados
 */

import { extractTabContent, extractMultipleTabsContent } from './tabContentExtractor.js';

/**
 * Obtiene las herramientas disponibles para la IA basándose en las pestañas seleccionadas
 * @param {Array} selectedTabs - Pestañas seleccionadas para contexto
 * @returns {Array} Array de herramientas disponibles
 */
export function getAvailableTools(selectedTabs = []) {
  const tools = [];
  
  // Solo incluir la tool de extracción si hay pestañas seleccionadas
  if (selectedTabs && selectedTabs.length > 0) {
    // Crear descripción detallada con las pestañas disponibles
    const availableTabsInfo = selectedTabs.map(tab => 
      `ID ${tab.id}: "${tab.title}" (${tab.url})`
    ).join('\n');
    
    // Agregar tool para extraer contenido de una pestaña específica
    tools.push({
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
    });
    
    // Agregar tool para extraer contenido de múltiples pestañas
    if (selectedTabs.length > 1) {
      tools.push({
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
      });
    }
  }
  
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
    if (toolCall.function.name === 'extract_tab_content') {
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
      return {
        tool_call_id: toolCall.id,
        functionName: toolCall.function.name,
        content: `Contenido extraído de "${tab.title}" (${tab.url}):\n\n${content}`,
        success: true
      };
      
    } else if (toolCall.function.name === 'extract_multiple_tabs_content') {
      const args = JSON.parse(toolCall.function.arguments);
      const { reason } = args;
      
      const extractedContent = await extractMultipleTabsContent(selectedTabs);
      const formattedContent = extractedContent.map(item => 
        `**${item.title}** (${item.url}):\n${item.content}\n`
      ).join('\n---\n');
      
      return {
        tool_call_id: toolCall.id,
        functionName: toolCall.function.name,
        content: `Contenido extraído de ${selectedTabs.length} pestañas:\n\n${formattedContent}`,
        success: true
      };
      
    } else {
      return {
        tool_call_id: toolCall.id,
        functionName: toolCall.function.name,
        content: `Error: Herramienta "${toolCall.function.name}" no reconocida.`,
        success: false
      };
    }
    
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
  
  const results = [];
  
  // Deduplicar tool calls por id y sanear argumentos
  const uniqueToolCalls = toolCalls.filter((toolCall, index, self) => 
    index === self.findIndex(tc => tc.id === toolCall.id)
  );
  
  // Ejecutar cada tool en paralelo
  const executionPromises = uniqueToolCalls.map(async (toolCall) => {
    const result = await executeTool(toolCall, selectedTabs);
    results.push(result);
  });
  
  await Promise.all(executionPromises);
  
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
