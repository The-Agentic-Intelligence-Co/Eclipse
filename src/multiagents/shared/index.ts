/**
 * Archivo índice para exportar todas las utilidades compartidas
 */

// Tipos
export type {
  StreamingResult,
  StreamingCallback,
  GroqMessage
} from './types';

// Cliente de Groq
export {
  groq,
  createGroqCompletion
} from './groqClient';

// Utilidades de mensajes
export {
  mapChatHistoryToMessages,
  createAssistantMessageWithToolCalls,
  createToolMessages
} from './messageUtils';

// Utilidades de streaming
export {
  processStreaming,
  streamToolDescriptions,
  streamUserDescription
} from './streamingUtils';

// Utilidades de pestañas
export {
  getUnifiedTabs,
  addTabContext
} from './tabUtils';

// Utilidades de errores
export {
  handleAIError
} from './errorUtils';
