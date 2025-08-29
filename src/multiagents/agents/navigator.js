// This is the logic for the Agent Mode
import Groq from "groq-sdk";
import { AGENT_MODE_SYSTEM_PROMPT } from "../prompts/agentMode";
import { CONFIG } from "../config.js";
import { 
  getAvailableTools, 
  executeTool
} from "../tools/index.js";

// ⚠️ ADVERTENCIA DE SEGURIDAD: Esta opción expone la API key en el navegador
// En producción, considera usar un backend proxy para mayor seguridad
const groq = new Groq({
  apiKey: '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',
  dangerouslyAllowBrowser: true
});

/**
 * Función principal para el modo agente que ejecuta un loop hasta que Groq retorne status "Done"
 */
export async function getNavigatorResponse(userMessage, chatHistory = [], selectedTabs = [], currentActiveTab = null, showCurrentTabIndicator = true, onChunk) {
  try {
    // Preparar mensajes y contexto
    const messages = chatHistory.map(msg => ({
      role: msg.type === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));
    
    const allAvailableTabs = getUnifiedTabs(selectedTabs, currentActiveTab, showCurrentTabIndicator);
    const enhancedMessages = addTabContext(messages, selectedTabs, currentActiveTab, showCurrentTabIndicator);
    const availableTools = getAvailableTools(allAvailableTabs, 'agent');
    
    let currentMessages = [{ role: "system", content: AGENT_MODE_SYSTEM_PROMPT }, ...enhancedMessages];
    
    // Loop principal hasta que Groq retorne status "Done"
    while (true) {
      console.log('🔄 **Loop principal - Enviando a Groq:**');
      console.log('📋 Historial de mensajes:', JSON.stringify(currentMessages, null, 2));
      
      const completion = await groq.chat.completions.create({
        model: CONFIG.MODEL,
        messages: currentMessages,
        tools: availableTools,
        tool_choice: "auto",
        stream: true,
        max_completion_tokens: CONFIG.MAX_COMPLETION_TOKENS,
        reasoning_effort: CONFIG.REASONING_EFFORT,
        temperature: CONFIG.TEMPERATURE,
      });
      
      // Procesar streaming y tool calls
      const { fullResponse, toolCalls, toolDescriptions } = await processStreaming(completion, onChunk);
      
      // Si no hay tool calls, retornar la respuesta
      if (!toolCalls || toolCalls.length === 0) {
        console.log('🔄 No hay tool calls, retornando respuesta completa:', fullResponse);
        return fullResponse;
      }
      
      // Streamear descripciones antes de ejecutar herramientas
      if (toolDescriptions.length > 0) {
        const toolDescriptionText = `${toolDescriptions.join('\n\n')}\n\n`;
        onChunk?.(toolDescriptionText, toolDescriptionText, true);
      }
      
      // Ejecutar las herramientas
      const toolResults = [];
      for (const toolCall of toolCalls) {
        const result = await executeTool(toolCall, allAvailableTabs, 'agent');
        toolResults.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: result.content
        });
      }
      
      // Agregar la respuesta de la IA y los resultados de las herramientas
      currentMessages.push({
        role: 'assistant',
        content: fullResponse,
        tool_calls: toolCalls.map(tc => ({
          id: tc.id,
          type: 'function',
          function: { name: tc.function.name, arguments: tc.function.arguments }
        }))
      });
      currentMessages.push(...toolResults);
      
    
    }
  } catch (error) {
    console.error('Error en navigator:', error);
    return "Lo siento, hubo un error al procesar tu consulta en modo agente. Por favor, intenta de nuevo.";
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
        console.log('toolCall', toolCall);
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