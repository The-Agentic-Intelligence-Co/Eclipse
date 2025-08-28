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
    description: "Searches for videos on YouTube based on a text query. Useful for finding content related to the conversation topic.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search term to find videos on YouTube"
        },
        maxResults: {
          type: "number",
          description: "Maximum number of results to return (default 5, maximum 10)"
        },
        userDescription: {
          type: "string",
          description: "Clear description for the user of what tool is being used and for what specific purpose"
        }
      },
      required: ["query", "userDescription"]
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
    description: "Analyzes a YouTube video using AI to extract information, summarize content, or find specific moments.",
    parameters: {
      type: "object",
      properties: {
        videoId: {
          type: "string",
          description: "YouTube video ID to analyze (e.g., 'dQw4w9WgXcQ')"
        },
        prompt: {
          type: "string",
          description: "Custom prompt for video analysis. If not provided, a general default analysis will be used."
        },
        userDescription: {
          type: "string",
          description: "Clear description for the user of what tool is being used and for what specific purpose"
        }
      },
      required: ["videoId", "userDescription"]
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
    description: "Searches for videos on YouTube and automatically analyzes the first result with AI. Combines search and analysis in a single operation.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search term to find videos on YouTube"
        },
        analysisPrompt: {
          type: "string",
          description: "Custom prompt for video analysis. If not provided, a general default analysis will be used."
        },
        maxSearchResults: {
          type: "string",
          description: "Maximum number of search results to consider (default 5, maximum 10)"
        },
        userDescription: {
          type: "string",
          description: "Clear description for the user of what tool is being used and for what specific purpose"
        }
      },
      required: ["query", "userDescription"]
    }
  }
};
