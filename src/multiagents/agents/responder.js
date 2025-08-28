// This is the logic for the Ask Mode
import Groq from "groq-sdk";
import { GENERAL_SYSTEM_PROMPT } from "../prompts/systemPrompts";
import { CONFIG } from "../config.js";
import { 
  getAvailableTools, 
  executeMultipleTools, 
  convertToolResultsToMessages 
} from "../tools/index.js";

// ⚠️ ADVERTENCIA DE SEGURIDAD: Esta opción expone la API key en el navegador
// En producción, considera usar un backend proxy para mayor seguridad
const groq = new Groq({
  apiKey: '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',
  dangerouslyAllowBrowser: true
});

/**
 * Función principal para obtener respuesta de la IA
 * @param {string} userMessage - Mensaje del usuario
 * @param {Array} chatHistory - Historial completo de la conversación
 * @param {Function} onChunk - Callback para manejar chunks del streaming
 * @param {Array} selectedTabs - Pestañas seleccionadas para contexto
 * @returns {Promise<string>} Respuesta de la IA
 */
export async function getAIResponse(userMessage, chatHistory = [], onChunk, selectedTabs = [], currentActiveTab = null, showCurrentTabIndicator = true) {
  try {
    // Preparar mensajes y contexto
    const messages = chatHistory.map(msg => ({
      role: msg.type === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));
    
    const allAvailableTabs = getUnifiedTabs(selectedTabs, currentActiveTab, showCurrentTabIndicator);
    const enhancedMessages = addTabContext(messages, selectedTabs, currentActiveTab, showCurrentTabIndicator);
    const availableTools = getAvailableTools(allAvailableTabs);
    
    // Primera llamada a Groq
    const completion = await groq.chat.completions.create({
      model: CONFIG.MODEL,
      messages: [{ role: "system", content: GENERAL_SYSTEM_PROMPT }, ...enhancedMessages],
      tools: availableTools,
      tool_choice: "auto",
      stream: true,
      max_completion_tokens: CONFIG.MAX_COMPLETION_TOKENS,
      reasoning_effort: CONFIG.REASONING_EFFORT,
      temperature: CONFIG.TEMPERATURE,
    });

    // Procesar streaming y tool calls
    const { fullResponse, toolCalls, toolDescriptions } = await processStreaming(completion, onChunk);
    
    // Si hay tool calls, ejecutarlas y hacer segunda llamada
    if (toolCalls.length > 0) {
      return await handleToolCalls(toolCalls, enhancedMessages, allAvailableTabs, onChunk, toolDescriptions);
    }

    return fullResponse;
  } catch (error) {
    console.error('Error al obtener respuesta de la IA:', error);
    return "Lo siento, hubo un error al procesar tu consulta. Por favor, intenta de nuevo.";
  }
}

// Funciones auxiliares
function getUnifiedTabs(selectedTabs, currentActiveTab, showCurrentTabIndicator) {
  const allTabs = [...selectedTabs];
  if (currentActiveTab && showCurrentTabIndicator && !selectedTabs.some(tab => tab.id === currentActiveTab.id)) {
    allTabs.push(currentActiveTab);
  }
  return allTabs;
}

function addTabContext(messages, selectedTabs, currentActiveTab, showCurrentTabIndicator) {
  if (!selectedTabs?.length && !(currentActiveTab && showCurrentTabIndicator)) return messages;
  
  const contextParts = [];
  if (selectedTabs?.length) {
    contextParts.push(`**Selected tabs:**\n${selectedTabs.map(tab => `- **${tab.title}** (${tab.url})`).join('\n')}`);
  }
  if (currentActiveTab && showCurrentTabIndicator) {
    contextParts.push(`**Current active tab:**\n- **${currentActiveTab.title}** (${currentActiveTab.url})`);
  }
  
  const enhancedMessages = [...messages];
  if (enhancedMessages.length > 0) {
    enhancedMessages[0] = {
      ...enhancedMessages[0],
      content: `${enhancedMessages[0].content}\n\n**Context from browser tabs:**\n${contextParts.join('\n\n')}`
    };
  }
  return enhancedMessages;
}

async function processStreaming(completion, onChunk) {
  let fullResponse = '';
  let isFirstChunk = true;
  let toolCalls = [];
  
  for await (const chunk of completion) {
    const delta = chunk.choices[0]?.delta;
    
    if (delta?.content) {
      fullResponse += delta.content;
      onChunk?.(delta.content, fullResponse, isFirstChunk);
      isFirstChunk = false;
    }
    
    if (delta?.tool_calls) {
      for (const toolCall of delta.tool_calls) {
        if (toolCall.function) {
          let existingToolCall = toolCalls.find(tc => tc.id === toolCall.id);
          if (!existingToolCall) {
            existingToolCall = {
              id: toolCall.id,
              type: 'function',
              function: { name: toolCall.function.name || '', arguments: toolCall.function.arguments || '' }
            };
            toolCalls.push(existingToolCall);
          } else if (toolCall.function.arguments) {
            existingToolCall.function.arguments += toolCall.function.arguments;
          }
        }
      }
    }
  }
  
  // Extraer userDescription de tool calls
  const toolDescriptions = toolCalls.map(tc => {
    try {
      const args = JSON.parse(tc.function.arguments);
      return args.userDescription;
    } catch {
      return null;
    }
  }).filter(Boolean);
  
  return { fullResponse, toolCalls, toolDescriptions };
}

async function handleToolCalls(toolCalls, enhancedMessages, allAvailableTabs, onChunk, toolDescriptions) {
  try {
    // Streamear descripciones antes de ejecutar herramientas
    let toolDescriptionText = '';
    if (toolDescriptions.length > 0) {
      toolDescriptionText = `${toolDescriptions.join('\n\n')}\n\n`;
      onChunk?.(toolDescriptionText, toolDescriptionText, true);
    }
    
    const toolResults = await executeMultipleTools(toolCalls, allAvailableTabs);
    
    // Agregar mensaje del asistente con tool_calls
    enhancedMessages.push({
      role: 'assistant',
      content: '',
      tool_calls: toolCalls.map(tc => ({
        id: tc.id,
        type: 'function',
        function: { name: tc.function.name, arguments: tc.function.arguments }
      }))
    });
    
    // Agregar resultados de tools y hacer segunda llamada
    enhancedMessages.push(...convertToolResultsToMessages(toolResults));
    
    const finalCompletion = await groq.chat.completions.create({
      model: CONFIG.MODEL,
      messages: [{ role: "system", content: GENERAL_SYSTEM_PROMPT }, ...enhancedMessages],
      stream: true,
      max_completion_tokens: CONFIG.MAX_COMPLETION_TOKENS,
      reasoning_effort: CONFIG.REASONING_EFFORT,
      temperature: CONFIG.TEMPERATURE,
    });

    // Procesar respuesta final y mantener la descripción visible
    let finalResponse = toolDescriptionText; // Incluir descripción de herramienta
    let finalIsFirstChunk = true;
    
    for await (const chunk of finalCompletion) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        finalResponse += content;
        // Streamear manteniendo la descripción de la herramienta visible
        onChunk?.(content, finalResponse, finalIsFirstChunk);
        finalIsFirstChunk = false;
      }
    }
    
    return finalResponse;
  } catch (error) {
    console.error('Error al ejecutar tools o segunda llamada:', error);
    return `Lo siento, hubo un error al procesar tu consulta con las herramientas disponibles. Por favor, intenta de nuevo o reformula tu pregunta. Error: ${error.message}`;
  }
}

