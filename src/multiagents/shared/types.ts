// Shared types and interfaces for AI agents

import type { ToolCall } from "../tools/tabs/types";

// Types for streaming
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
