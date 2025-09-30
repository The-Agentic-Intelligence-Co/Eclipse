/**
 * Mensajes de bienvenida que se muestran en rotación
 * antes de que el usuario inicie una conversación
 */
export const WELCOME_MESSAGES: readonly string[] = [
  "Ask and make summaries from your tabs",
  "Your browser complex flows executed autonomously",
  "Search and analyze any YT video",
  "Like Perplexity Comet, but private, faster and cheaper",
] as const;

/**
 * Intervalo de rotación de mensajes en milisegundos
 */
export const WELCOME_MESSAGE_INTERVAL: number = 3000;
