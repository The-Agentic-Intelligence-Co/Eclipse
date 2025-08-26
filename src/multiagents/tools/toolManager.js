/**
 * Gestor de herramientas para la IA
 * Maneja la ejecución de tools y conversión de resultados
 */

import { extractTabContent, extractMultipleTabsContent } from './tabContentExtractor.js';
import { searchYt, analyzeVideoWithAI, extractTimestampFromAnalysis, generateDirectTimestampUrl } from './video_search.js';

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
  
  // Agregar tools de video (siempre disponibles)
  tools.push({
    type: "function",
    function: {
      name: "search_youtube",
      description: "Busca videos en YouTube basándose en una consulta de texto. Útil para encontrar contenido relacionado con el tema de conversación.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Término de búsqueda para encontrar videos en YouTube"
          },
          maxResults: {
            type: "number",
            description: "Número máximo de resultados a retornar (por defecto 5, máximo 10)"
          }
        },
        required: ["query"]
      }
    }
  });
  
  tools.push({
    type: "function",
    function: {
      name: "analyze_video_with_ai",
      description: "Analiza un video de YouTube usando IA para extraer información, resumir contenido, o encontrar momentos específicos.",
      parameters: {
        type: "object",
        properties: {
          videoId: {
            type: "string",
            description: "ID del video de YouTube a analizar (ej: 'dQw4w9WgXcQ')"
          },
          prompt: {
            type: "string",
            description: "Prompt personalizado para el análisis del video. Si no se proporciona, se usará un análisis general por defecto."
          }
        },
        required: ["videoId"]
      }
    }
  });

  // Nueva herramienta integrada: busca y analiza el primer resultado
  tools.push({
    type: "function",
    function: {
      name: "search_and_analyze_video",
      description: "Busca videos en YouTube y automáticamente analiza el primer resultado con IA. Combina búsqueda y análisis en una sola operación.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Término de búsqueda para encontrar videos en YouTube"
          },
          analysisPrompt: {
            type: "string",
            description: "Prompt personalizado para el análisis del video. Si no se proporciona, se usará un análisis general por defecto."
          },
          maxSearchResults: {
            type: "number",
            description: "Número máximo de resultados de búsqueda a considerar (por defecto 5, máximo 10)"
          }
        },
        required: ["query"]
      }
    }
  });
  
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
      
    } else if (toolCall.function.name === 'search_youtube') {
      const args = JSON.parse(toolCall.function.arguments);
      const { query, maxResults = 5 } = args;
      
      const videos = await searchYt(query, maxResults);
      
      if (videos.length === 0) {
        return {
          tool_call_id: toolCall.id,
          functionName: toolCall.function.name,
          content: `No se encontraron videos para la búsqueda: "${query}"`,
          success: true
        };
      }
      
      const formattedResults = videos.map((video, index) => 
        `**${index + 1}. ${video.title}**\n` +
        `📺 ID: ${video.video_id}\n` +
        `👤 Canal: ${video.channelTitle}\n` +
        `📅 Publicado: ${new Date(video.publishedAt).toLocaleDateString()}\n` +
        `🏷️ Hashtags: ${video.hashtags.length > 0 ? video.hashtags.join(', ') : 'Ninguno'}\n` +
        `🔗 URL: https://www.youtube.com/watch?v=${video.video_id}\n`
      ).join('\n---\n');
      
      return {
        tool_call_id: toolCall.id,
        functionName: toolCall.function.name,
        content: `**Resultados de búsqueda para "${query}":**\n\n${formattedResults}`,
        success: true
      };
      
    } else if (toolCall.function.name === 'analyze_video_with_ai') {
      const args = JSON.parse(toolCall.function.arguments);
      const { videoId, prompt } = args;
      
      const analysis = await analyzeVideoWithAI(videoId, prompt);
      
      // Intentar extraer timestamp si existe
      const timestamp = extractTimestampFromAnalysis(analysis);
      let timestampInfo = '';
      if (timestamp) {
        const directUrl = generateDirectTimestampUrl(videoId, timestamp);
        timestampInfo = `\n\n⏰ **Timestamp detectado:** ${Math.floor(timestamp / 60)}:${(timestamp % 60).toString().padStart(2, '0')}\n🔗 **Enlace directo:** ${directUrl}`;
      }
      
      return {
        tool_call_id: toolCall.id,
        functionName: toolCall.function.name,
        content: `**Análisis del video ${videoId}:**\n\n${analysis}${timestampInfo}`,
        success: true
      };
      
    } else if (toolCall.function.name === 'search_and_analyze_video') {
      const args = JSON.parse(toolCall.function.arguments);
      const { query, analysisPrompt, maxSearchResults = 5 } = args;
      
      // Paso 1: Buscar videos en YouTube
      const videos = await searchYt(query, maxSearchResults);
      
      if (videos.length === 0) {
        return {
          tool_call_id: toolCall.id,
          functionName: toolCall.function.name,
          content: `No se encontraron videos para la búsqueda: "${query}"`,
          success: true
        };
      }
      
      // Paso 2: Tomar el primer resultado y analizarlo
      const firstVideo = videos[0];
      console.log(`🔍 Analizando el primer resultado: "${firstVideo.title}" (ID: ${firstVideo.video_id})`);
      
      const analysis = await analyzeVideoWithAI(firstVideo.video_id, analysisPrompt);
      
      // Intentar extraer timestamp si existe
      const timestamp = extractTimestampFromAnalysis(analysis);
      let timestampInfo = '';
      if (timestamp) {
        const directUrl = generateDirectTimestampUrl(firstVideo.video_id, timestamp);
        timestampInfo = `\n\n⏰ **Timestamp detectado:** ${Math.floor(timestamp / 60)}:${(timestamp % 60).toString().padStart(2, '0')}\n🔗 **Enlace directo:** ${directUrl}`;
      }
      
      // Formatear información del video analizado
      const videoInfo = `**🎬 Video Analizado:**\n` +
        `📺 **Título:** ${firstVideo.title}\n` +
        `👤 **Canal:** ${firstVideo.channelTitle}\n` +
        `📅 **Publicado:** ${new Date(firstVideo.publishedAt).toLocaleDateString()}\n` +
        `🏷️ **Hashtags:** ${firstVideo.hashtags.length > 0 ? firstVideo.hashtags.join(', ') : 'Ninguno'}\n` +
        `🔗 **URL:** https://www.youtube.com/watch?v=${firstVideo.video_id}\n\n`;
      
      // Mostrar también los otros resultados encontrados
      const otherResults = videos.slice(1).map((video, index) => 
        `**${index + 2}. ${video.title}**\n` +
        `👤 Canal: ${video.channelTitle}\n` +
        `🔗 URL: https://www.youtube.com/watch?v=${video.video_id}\n`
      ).join('\n');
      
      const otherResultsSection = otherResults.length > 0 ? 
        `\n---\n**🔍 Otros resultados encontrados:**\n\n${otherResults}` : '';
      
      return {
        tool_call_id: toolCall.id,
        functionName: toolCall.function.name,
        content: `**Búsqueda y Análisis para "${query}":**\n\n${videoInfo}**📊 Análisis con IA:**\n\n${analysis}${timestampInfo}${otherResultsSection}`,
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
