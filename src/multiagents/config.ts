// Centralized configuration for AI engine and debugging

export interface AIConfig {
  MODEL: string;
  MAX_COMPLETION_TOKENS: number;
  TEMPERATURE: number;
  REASONING_EFFORT: "low" | "medium" | "high";
  DEBUG: boolean;
}

export const CONFIG: AIConfig = {
  MODEL: "openai/gpt-oss-120b",
  MAX_COMPLETION_TOKENS: 8192,
  TEMPERATURE: 1,
  REASONING_EFFORT: "medium",
  // Enable detailed logs in development
  DEBUG: typeof import.meta !== 'undefined' ? (import.meta as any).env?.MODE !== 'production' : true,
} as const;
