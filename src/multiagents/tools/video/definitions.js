/**
 * Definiciones de herramientas de video para la IA
 */

/**
 * Definición de la herramienta search_youtube
 */
export const SEARCH_YOUTUBE_TOOL = {
  type: "function",
  function: {
    name: "search_youtube",
    description: "Busca videos en YouTube basándose en una consulta de texto. Útil para encontrar contenido relacionado con el tema de conversación.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Término de búsqueda para encontrar videos en YouTube"
        },
        maxResults: {
          type: "number",
          description: "Número máximo de resultados a retornar (por defecto 5, máximo 10)"
        }
      },
      required: ["query"]
    }
  }
};

/**
 * Definición de la herramienta analyze_video_with_ai
 */
export const ANALYZE_VIDEO_TOOL = {
  type: "function",
  function: {
    name: "analyze_video_with_ai",
    description: "Analiza un video de YouTube usando IA para extraer información, resumir contenido, o encontrar momentos específicos.",
    parameters: {
      type: "object",
      properties: {
        videoId: {
          type: "string",
          description: "ID del video de YouTube a analizar (ej: 'dQw4w9WgXcQ')"
        },
        prompt: {
          type: "string",
          description: "Prompt personalizado para el análisis del video. Si no se proporciona, se usará un análisis general por defecto."
        }
      },
      required: ["videoId"]
    }
  }
};

/**
 * Definición de la herramienta search_and_analyze_video
 */
export const SEARCH_AND_ANALYZE_TOOL = {
  type: "function",
  function: {
    name: "search_and_analyze_video",
    description: "Busca videos en YouTube y automáticamente analiza el primer resultado con IA. Combina búsqueda y análisis en una sola operación.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Término de búsqueda para encontrar videos en YouTube"
        },
        analysisPrompt: {
          type: "string",
          description: "Prompt personalizado para el análisis del video. Si no se proporciona, se usará un análisis general por defecto."
        },
        maxSearchResults: {
          type: "number",
          description: "Número máximo de resultados de búsqueda a considerar (por defecto 5, máximo 10)"
        }
      },
      required: ["query"]
    }
  }
};
