// This is the logic for the Ask Mode
import { GENERAL_SYSTEM_PROMPT } from "../prompts/systemPrompts";
import { 
  getAvailableTools, 
  executeMultipleTools
} from "../tools/index";
import type { Tab, ToolCall, ToolResult } from "../tools/tabs/types";
import type { ChatMessage } from "../../types/hooks";
import {
  mapChatHistoryToMessages,
  getUnifiedTabs,
  addTabContext,
  processStreaming,
  createGroqCompletion,
  createAssistantMessageWithToolCalls,
  createToolMessages,
  streamToolDescriptions,
  handleAIError,
  type StreamingCallback,
  type GroqMessage
} from "../shared";

/**
 * Función principal para obtener respuesta de la IA
 * @param {string} userMessage - Mensaje del usuario
 * @param {Array} chatHistory - Historial completo de la conversación
 * @param {Function} onChunk - Callback para manejar chunks del streaming
 * @param {Array} selectedTabs - Pestañas seleccionadas para contexto
 * @param {Object} currentActiveTab - Pestaña activa actual
 * @param {boolean} showCurrentTabIndicator - Si mostrar la pestaña activa en el contexto
 * @param {string} mode - Modo de operación ('ask' o 'agent')
 * @returns {Promise<string>} Respuesta de la IA
 */
export async function getAIResponse(
  _userMessage: string, 
  chatHistory: ChatMessage[] = [], 
  onChunk?: StreamingCallback, 
  selectedTabs: Tab[] = [], 
  currentActiveTab: Tab | null = null, 
  showCurrentTabIndicator: boolean = true, 
  mode: 'ask' | 'agent' = 'agent'
): Promise<string> {
  try {
    // Preparar mensajes y contexto usando utilidades compartidas
    const messages = mapChatHistoryToMessages(chatHistory);
    const allAvailableTabs = getUnifiedTabs(selectedTabs, currentActiveTab, showCurrentTabIndicator);
    const enhancedMessages = addTabContext(messages, selectedTabs, currentActiveTab, showCurrentTabIndicator);
    const availableTools = getAvailableTools(allAvailableTabs, mode);
    
    // Primera llamada a Groq usando utilidad compartida
    const completion = await createGroqCompletion(
      [{ role: "system", content: GENERAL_SYSTEM_PROMPT }, ...enhancedMessages], 
      availableTools
    );

    // Procesar streaming y tool calls usando utilidad compartida
    const { fullResponse, toolCalls, toolDescriptions } = await processStreaming(completion, onChunk);
    
    // Si hay tool calls, ejecutarlas y hacer segunda llamada
    if (toolCalls.length > 0) {
      console.log('toolCalls in responder', toolCalls);
      return await handleToolCalls(toolCalls, enhancedMessages, allAvailableTabs, onChunk, toolDescriptions, mode);
    }

    return fullResponse;
  } catch (error) {
    return handleAIError(error, 'Ask Mode');
  }
}

// Funciones auxiliares específicas del responder

async function handleToolCalls(
  toolCalls: ToolCall[], 
  enhancedMessages: Array<{ role: 'user' | 'assistant'; content: string }>, 
  allAvailableTabs: Tab[], 
  onChunk: StreamingCallback | undefined, 
  toolDescriptions: string[], 
  mode: 'ask' | 'agent'
): Promise<string> {
  try {
    // Streamear descripciones usando utilidad compartida
    streamToolDescriptions(toolDescriptions, onChunk);
    
    const toolResults: ToolResult[] = await executeMultipleTools(toolCalls, allAvailableTabs, mode);
    
    // Agregar mensaje del asistente usando utilidad compartida
    const assistantMessage = createAssistantMessageWithToolCalls('', toolCalls);
    enhancedMessages.push(assistantMessage as any);
    
    // Agregar resultados de tools usando utilidad compartida
    const toolMessages = createToolMessages(toolResults);
    enhancedMessages.push(...toolMessages as any);
    
    // Segunda llamada a Groq usando utilidad compartida
    const finalCompletion = await createGroqCompletion(
      [{ role: "system", content: GENERAL_SYSTEM_PROMPT }, ...enhancedMessages as GroqMessage[]], 
      []
    );

    // Procesar respuesta final sin incluir la descripción de la herramienta
    let finalResponse = '';
    let finalIsFirstChunk = true;
    
    for await (const chunk of finalCompletion as any) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        finalResponse += content;
        // Streamear solo la respuesta final
        onChunk?.(content, finalResponse, finalIsFirstChunk);
        finalIsFirstChunk = false;
      }
    }
    
    return finalResponse;
  } catch (error) {
    return handleAIError(error, 'ejecución de herramientas');
  }
}
