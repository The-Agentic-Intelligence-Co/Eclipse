/**
 * Tipos e interfaces compartidos para los agentes de IA
 */

import type { ToolCall } from "../tools/tabs/types";

// Tipos para el streaming
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
