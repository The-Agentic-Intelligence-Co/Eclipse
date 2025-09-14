import type { StreamingCallbacks } from './callbackHandler';

// Manage streaming state and operations
export const startStreaming = (callbacks: StreamingCallbacks): void => {
  if (callbacks.startStreaming) callbacks.startStreaming();
};

export const stopStreaming = (callbacks: StreamingCallbacks): void => {
  if (callbacks.stopStreaming) callbacks.stopStreaming();
};

export const startTyping = (callbacks: StreamingCallbacks): void => {
  if (callbacks.startTyping) callbacks.startTyping();
};

export const stopTyping = (callbacks: StreamingCallbacks): void => {
  if (callbacks.stopTyping) callbacks.stopTyping();
};

export const handleStreamingChunk = (
  callbacks: StreamingCallbacks,
  chunk: string,
  fullResponse: string,
  isFirstChunk: boolean,
  stopTyping?: () => void
): void => {
  if (callbacks.handleStreamingChunk) {
    callbacks.handleStreamingChunk(chunk, fullResponse, isFirstChunk, stopTyping);
  }
};
