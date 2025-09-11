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
