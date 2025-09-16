/**
 * Cliente de Groq y configuración compartida
 */

import Groq from "groq-sdk";
import { CONFIG } from "../config";
import type { GroqMessage } from "./types";

// Instancia compartida de Groq
// ⚠️ ADVERTENCIA DE SEGURIDAD: Esta opción expone la API key en el navegador
// En producción, considera usar un backend proxy para mayor seguridad
export const groq = new Groq({
  apiKey: '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',
  dangerouslyAllowBrowser: true
});

/**
 * Crea una llamada a Groq con configuración estándar
 */
export async function createGroqCompletion(
  messages: GroqMessage[],
  tools: any[]
): Promise<any> {
  try {
    const baseConfig = {
      model: CONFIG.MODEL,
      messages: messages, // Los mensajes ya incluyen el system prompt
      tools: tools,
      tool_choice: "auto" as any,
      stream: true,
      max_tokens: CONFIG.MAX_COMPLETION_TOKENS,
      temperature: CONFIG.TEMPERATURE,
    };

    // Log de configuración para debugging
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
    console.error('❌ Error en createGroqCompletion:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      model: CONFIG.MODEL,
      messagesCount: messages.length,
      toolsCount: tools.length
    });
    throw error;
  }
}
