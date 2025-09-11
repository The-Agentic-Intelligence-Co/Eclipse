/**
 * Utilidades para manejo de streaming y procesamiento de chunks
 */

import type { ToolCall } from "../tools/tabs/types";
import type { StreamingResult, StreamingCallback } from "./types";

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
