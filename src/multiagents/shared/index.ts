// Export all shared utilities

// Types
export type {
  StreamingResult,
  StreamingCallback,
  GroqMessage
} from './types';

// Groq client
export {
  groq,
  createGroqCompletion
} from './groqClient';

// Message utilities
export {
  mapChatHistoryToMessages,
  createAssistantMessageWithToolCalls,
  createToolMessages
} from './messageUtils';

// Streaming utilities
export {
  processStreaming,
  streamToolDescriptions,
  streamUserDescription
} from './streamingUtils';

// Tab utilities
export {
  getUnifiedTabs,
  addTabContext
} from './tabUtils';

// Error utilities
export {
  handleAIError
} from './errorUtils';
