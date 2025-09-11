// This is the logic for the Agent Mode
import { AGENT_MODE_SYSTEM_PROMPT } from "../prompts/agentMode";
import { 
  getAvailableTools, 
  executeTool
} from "../tools/index";
import type { Tab, ToolResult } from "../tools/tabs/types";
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
 * Función principal para el modo agente que ejecuta un loop hasta que Groq retorne status "Done"
 */
export async function getNavigatorResponse(
  _userMessage: string, 
  chatHistory: ChatMessage[] = [], 
  selectedTabs: Tab[] = [], 
  currentActiveTab: Tab | null = null, 
  showCurrentTabIndicator: boolean = true, 
  onChunk?: StreamingCallback
): Promise<string> {
  try {
    // Preparar mensajes y contexto usando utilidades compartidas
    const messages = mapChatHistoryToMessages(chatHistory);
    const allAvailableTabs = getUnifiedTabs(selectedTabs, currentActiveTab, showCurrentTabIndicator);
    const enhancedMessages = addTabContext(messages, selectedTabs, currentActiveTab, showCurrentTabIndicator);
    const availableTools = getAvailableTools(allAvailableTabs, 'agent');
    
    let currentMessages: GroqMessage[] = [{ role: "system", content: AGENT_MODE_SYSTEM_PROMPT }, ...enhancedMessages];
    
    // Loop principal hasta que Groq retorne status "Done"
    while (true) {
      //console.log('🔄 **Loop principal - Enviando a Groq:**');
      //console.log('📋 Historial de mensajes:', JSON.stringify(currentMessages, null, 2));
      
      // Llamada a Groq usando utilidad compartida
      const completion = await createGroqCompletion(currentMessages, availableTools, AGENT_MODE_SYSTEM_PROMPT);
      
      // Procesar streaming y tool calls usando utilidad compartida
      const { fullResponse, toolCalls, toolDescriptions } = await processStreaming(completion, onChunk);
      
      // Si no hay tool calls, retornar la respuesta
      if (!toolCalls || toolCalls.length === 0) {
        //console.log('🔄 No hay tool calls, retornando respuesta completa:', fullResponse);
        return fullResponse;
      }
      
      // Streamear descripciones usando utilidad compartida
      streamToolDescriptions(toolDescriptions, onChunk);
      
      // Ejecutar las herramientas
      const toolResults: ToolResult[] = [];
      
      for (const toolCall of toolCalls) {
        const result: ToolResult = await executeTool(toolCall, allAvailableTabs, 'agent');
        toolResults.push(result);
      }
      
      // Agregar la respuesta de la IA usando utilidad compartida
      const assistantMessage = createAssistantMessageWithToolCalls(fullResponse, toolCalls);
      currentMessages.push(assistantMessage);
      
      // Agregar resultados de herramientas usando utilidad compartida
      const toolMessages = createToolMessages(toolResults);
      currentMessages.push(...toolMessages);
    }
  } catch (error) {
    return handleAIError(error, 'Agent Mode');
  }
}
