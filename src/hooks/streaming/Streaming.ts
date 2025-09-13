import { useState } from 'react';
import { renderMarkdown } from '../../utils/markdownUtils';
import type { UseStreamingReturn } from '../../types/hooks';

// Manages real-time AI response streaming
export const useStreaming = (): UseStreamingReturn => {
  const [streamingMessage, setStreamingMessage] = useState<string>('');
  const [streamingHtml, setStreamingHtml] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState<boolean>(false);

  // Start streaming mode
  const startStreaming = (): void => {
    setIsStreaming(true);
    setStreamingMessage('');
    setStreamingHtml('');
  };

  // Stop streaming mode
  const stopStreaming = (): void => {
    setIsStreaming(false);
    setStreamingMessage('');
    setStreamingHtml('');
  };

  // Handle streaming chunks from AI
  const handleStreamingChunk = (
    _chunk: string, 
    fullResponse: string, 
    isFirstChunk: boolean, 
    onFirstChunk?: () => void
  ): void => {
    setStreamingMessage(fullResponse);
    
    // Process markdown in real-time
    try {
      const htmlContent = renderMarkdown(fullResponse);
      setStreamingHtml(htmlContent);
    } catch (error) {
      console.error('Error processing markdown:', error);
      setStreamingHtml(fullResponse); // Fallback to plain text
    }
    
    // Run callback for first chunk if provided
    if (isFirstChunk && onFirstChunk) {
      onFirstChunk();
    }
  };

  return {
    streamingMessage,
    streamingHtml,
    isStreaming,
    startStreaming,
    stopStreaming,
    handleStreamingChunk,
  };
};
