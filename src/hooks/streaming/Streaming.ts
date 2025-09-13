import { useState } from 'react';
import { renderMarkdown } from '../../utils/markdownUtils';
import type { 
  UseStreamingReturn
} from '../../types/hooks';

/**
 * Hook personalizado para manejar el streaming de respuestas de IA
 * @returns {UseStreamingReturn} Estados y funciones para streaming
 */
export const useStreaming = (): UseStreamingReturn => {
  const [streamingMessage, setStreamingMessage] = useState<string>('');
  const [streamingHtml, setStreamingHtml] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState<boolean>(false);

  /**
   * Activa el modo streaming
   */
  const startStreaming = (): void => {
    setIsStreaming(true);
    setStreamingMessage('');
    setStreamingHtml('');
  };

  /**
   * Desactiva el modo streaming
   */
  const stopStreaming = (): void => {
    setIsStreaming(false);
    setStreamingMessage('');
    setStreamingHtml('');
  };

  /**
   * Maneja chunks del streaming
   * @param {string} chunk - Chunk individual del stream
   * @param {string} fullResponse - Respuesta completa hasta el momento
   * @param {boolean} isFirstChunk - Si es el primer chunk
   * @param {Function} onFirstChunk - Callback para el primer chunk
   */
  const handleStreamingChunk = (
    _chunk: string, 
    fullResponse: string, 
    isFirstChunk: boolean, 
    onFirstChunk?: () => void
  ): void => {
    // Contenido normal de streaming
    setStreamingMessage(fullResponse);
    
    // Procesar markdown en tiempo real
    try {
      const htmlContent = renderMarkdown(fullResponse);
      setStreamingHtml(htmlContent);
    } catch (error) {
      console.error('Error procesando markdown:', error);
      setStreamingHtml(fullResponse); // Fallback a texto plano
    }
    
    // Ejecutar callback del primer chunk si existe
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
