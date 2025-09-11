/**
 * Utilidades compartidas para los agentes de IA
 * Contiene funciones comunes entre navigator.ts y responder.ts
 */

import Groq from "groq-sdk";
import { CONFIG } from "../config";
import type { Tab, ToolCall, ToolResult } from "../tools/tabs/types";
import type { ChatMessage } from "../../types/hooks";

// Tipos compartidos
export interface StreamingResult {
  fullResponse: string;
  toolCalls: ToolCall[];
  toolDescriptions: string[];
}

export interface StreamingCallback {
  (chunk: string, fullResponse: string, isFirstChunk: boolean): void;
}

export interface GroqMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  tool_calls?: Array<{
    id: string;
    type: 'function';
    function: { name: string; arguments: string };
  }>;
  tool_call_id?: string;
}

// Instancia compartida de Groq
// ⚠️ ADVERTENCIA DE SEGURIDAD: Esta opción expone la API key en el navegador
// En producción, considera usar un backend proxy para mayor seguridad
export const groq = new Groq({
  apiKey: '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',
  dangerouslyAllowBrowser: true
});

/**
 * Convierte el historial de chat a formato de mensajes para Groq
 */
export function mapChatHistoryToMessages(chatHistory: ChatMessage[]): Array<{ role: 'user' | 'assistant'; content: string }> {
  return chatHistory.map(msg => ({
    role: msg.type === 'user' ? 'user' : 'assistant',
    content: msg.content
  }));
}

/**
 * Unifica las pestañas seleccionadas con la pestaña activa actual
 */
export function getUnifiedTabs(
  selectedTabs: Tab[], 
  currentActiveTab: Tab | null, 
  showCurrentTabIndicator: boolean
): Tab[] {
  const allTabs = [...selectedTabs];
  if (currentActiveTab && showCurrentTabIndicator && !selectedTabs.some(tab => tab.id === currentActiveTab.id)) {
    allTabs.push(currentActiveTab);
  }
  return allTabs;
}

/**
 * Añade contexto de pestañas a los mensajes
 */
export function addTabContext(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>, 
  selectedTabs: Tab[], 
  currentActiveTab: Tab | null, 
  showCurrentTabIndicator: boolean
): Array<{ role: 'user' | 'assistant'; content: string }> {
  if (!selectedTabs?.length && !(currentActiveTab && showCurrentTabIndicator)) return messages;
  
  const contextParts: string[] = [];
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

/**
 * Procesa el streaming de Groq y extrae tool calls
 */
export async function processStreaming(
  completion: any, 
  onChunk?: StreamingCallback
): Promise<StreamingResult> {
  let fullResponse = '';
  let isFirstChunk = true;
  let toolCalls: ToolCall[] = [];
  
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
  }).filter((desc): desc is string => Boolean(desc));
  
  return { fullResponse, toolCalls, toolDescriptions };
}

/**
 * Crea una llamada a Groq con configuración estándar
 */
export async function createGroqCompletion(
  messages: GroqMessage[],
  tools: any[],
  systemPrompt: string
): Promise<any> {
  return await groq.chat.completions.create({
    model: CONFIG.MODEL,
    messages: [{ role: "system", content: systemPrompt }, ...messages],
    tools: tools,
    tool_choice: "auto" as any,
    stream: true,
    max_tokens: CONFIG.MAX_COMPLETION_TOKENS,
    temperature: CONFIG.TEMPERATURE,
  } as any);
}

/**
 * Convierte tool calls a formato de mensaje de asistente
 */
export function createAssistantMessageWithToolCalls(
  content: string,
  toolCalls: ToolCall[]
): GroqMessage {
  return {
    role: 'assistant',
    content: content,
    tool_calls: toolCalls.map(tc => ({
      id: tc.id,
      type: 'function' as const,
      function: { name: tc.function.name, arguments: tc.function.arguments }
    }))
  };
}

/**
 * Convierte resultados de herramientas a formato de mensaje
 */
export function createToolMessages(toolResults: ToolResult[]): GroqMessage[] {
  return toolResults.map(result => ({
    role: "tool" as const,
    content: result.content,
    tool_call_id: result.tool_call_id
  }));
}

/**
 * Streamea descripciones de herramientas
 */
export function streamToolDescriptions(
  toolDescriptions: string[],
  onChunk?: StreamingCallback
): string {
  if (toolDescriptions.length > 0) {
    const toolDescriptionText = `${toolDescriptions.join('\n\n')}\n\n`;
    onChunk?.(toolDescriptionText, toolDescriptionText, true);
    return toolDescriptionText;
  }
  return '';
}

/**
 * Maneja errores de manera consistente
 */
export function handleAIError(error: unknown, context: string): string {
  console.error(`Error en ${context}:`, error);
  const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
  return `Lo siento, hubo un error al procesar tu consulta en ${context}. Por favor, intenta de nuevo. Error: ${errorMessage}`;
}
