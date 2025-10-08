// Utilities for streaming and chunk processing

import type { ToolCall } from "../tools/tabs/types";
import type { StreamingResult, StreamingCallback } from "./types";

// Processes Groq streaming and extracts tool calls
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
  
  // Extract userDescription from tool calls
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

// Streams tool descriptions
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

// Simulates streaming of userDescription with fast and uniform delay
// Shared utility for planner and validator
export async function streamUserDescription(userDescription: string, onChunk: StreamingCallback): Promise<void> {
  const words = userDescription.split(' ');
  let currentText = '';
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const space = i < words.length - 1 ? ' ' : '';
    currentText += word + space;
    
    // Uniform and very fast delay for all words (5-15ms)
    const delay = Math.random() * 10 + 5;
    
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Call callback with current chunk
    onChunk(word + space, currentText, i === 0);
  }
}
