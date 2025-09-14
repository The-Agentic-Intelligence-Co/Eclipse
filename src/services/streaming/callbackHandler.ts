// Define streaming callbacks interface for UI interactions
export interface StreamingCallbacks {
  startTyping?: () => void;
  stopTyping?: () => void;
  startStreaming?: () => void;
  stopStreaming?: () => void;
  handleStreamingChunk?: (chunk: string, fullResponse: string, isFirstChunk: boolean, stopTyping?: () => void) => void;
}
