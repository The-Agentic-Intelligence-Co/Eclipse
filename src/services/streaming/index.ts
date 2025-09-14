// Streaming services - Manage real-time streaming and UI callbacks
export type { StreamingCallbacks } from './callbackHandler';
export { 
  startStreaming, 
  stopStreaming, 
  startTyping, 
  stopTyping, 
  handleStreamingChunk 
} from './streamingManager';
