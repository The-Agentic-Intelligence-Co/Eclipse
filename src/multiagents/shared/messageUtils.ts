// Utilities for message handling and format conversion

import type { ChatMessage } from "../../types/hooks";
import type { ToolCall, ToolResult } from "../tools/tabs/types";
import type { GroqMessage } from "./types";

// Converts chat history to Groq message format
export function mapChatHistoryToMessages(chatHistory: ChatMessage[]): Array<{ role: 'user' | 'assistant'; content: string }> {
  return chatHistory.map(msg => ({
    role: msg.type === 'user' ? 'user' : 'assistant',
    content: msg.content
  }));
}

// Converts tool calls to assistant message format
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

// Converts tool results to message format
export function createToolMessages(toolResults: ToolResult[]): GroqMessage[] {
  return toolResults.map(result => ({
    role: "tool" as const,
    content: result.content,
    tool_call_id: result.tool_call_id
  }));
}
