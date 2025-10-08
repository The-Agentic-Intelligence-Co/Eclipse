// Groq client and shared configuration

import Groq from "groq-sdk";
import { CONFIG } from "../config";
import type { GroqMessage } from "./types";

// Shared Groq instance
// Warning: This exposes the API key in the browser
export const groq = new Groq({
  apiKey: (import.meta as any).env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true
});

// Creates a Groq call with standard configuration
export async function createGroqCompletion(
  messages: GroqMessage[],
  tools: any[]
): Promise<any> {
  try {
    const baseConfig = {
      model: CONFIG.MODEL,
      messages: messages, // Messages already include the system prompt
      tools: tools,
      tool_choice: "auto" as any,
      stream: true,
      max_tokens: CONFIG.MAX_COMPLETION_TOKENS,
      temperature: CONFIG.TEMPERATURE,
    };

    // Configuration log for debugging
    if (CONFIG.DEBUG) {
      console.log('🔧 Groq Completion Config:', {
        model: baseConfig.model,
        messagesCount: messages.length,
        toolsCount: tools.length,
        maxTokens: baseConfig.max_tokens,
        temperature: baseConfig.temperature
      });
    }

    return await groq.chat.completions.create(baseConfig as any);
  } catch (error) {
    console.error('❌ Error in createGroqCompletion:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      model: CONFIG.MODEL,
      messagesCount: messages.length,
      toolsCount: tools.length
    });
    throw error;
  }
}
