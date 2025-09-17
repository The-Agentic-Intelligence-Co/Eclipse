/**
 * Definiciones de herramientas de video para la IA
 */

import type { ToolDefinition } from '../tabs/types';

/**
 * Definición de la herramienta search_youtube
 */
export const SEARCH_YOUTUBE_TOOL: ToolDefinition = {
  type: "function",
  function: {
    name: "search_youtube",
    description: "Searches for videos on YouTube based on a text query. Useful for finding content related to the conversation topic.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search term to find videos on YouTube. Use critical keywords to find the most relevant videos. Do not include words like timestamp, time, etc."
        },
        maxResults: {
          type: "number",
          description: "Maximum number of results to return (default 5, maximum 10)"
        },
        reason: {
          type: "string",
          description: "Reason why searching for videos is needed"
        },
        userDescription: {
          type: "string",
          description: "Clear description in first person of what tool is being used and for what specific purpose (e.g., 'I am searching YouTube for videos related to this topic')"
        }
      },
      required: ["query", "userDescription"]
    }
  }
};

/**
 * Definición de la herramienta analyze_video_with_ai
 */
export const ANALYZE_VIDEO_TOOL: ToolDefinition = {
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
        reason: {
          type: "string",
          description: "Reason why analyzing this video is needed"
        },
        userDescription: {
          type: "string",
          description: "Clear description in first person of what tool is being used and for what specific purpose (e.g., 'I am analyzing this YouTube video to extract key information')"
        }
      },
      required: ["videoId", "userDescription"]
    }
  }
};

/**
 * Definición de la herramienta search_and_analyze_video
 */
export const SEARCH_AND_ANALYZE_TOOL: ToolDefinition = {
  type: "function",
  function: {
    name: "search_and_analyze_video",
    description: "Searches for videos on YouTube and automatically analyzes the first result with AI. Combines search and analysis in a single operation.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search term to find videos on YouTube. Use critical keywords to find the most relevant videos. Do not include words like timestamp, time, etc."
        },
        analysisPrompt: {
          type: "string",
          description: "Custom prompt for video analysis. If not provided, a general default analysis will be used."
        },
        maxSearchResults: {
          type: "string",
          description: "Maximum number of search results to consider (default 5, maximum 10)"
        },
        reason: {
          type: "string",
          description: "Reason why searching and analyzing videos is needed"
        },
        userDescription: {
          type: "string",
          description: "Clear description in first person of what tool is being used and for what specific purpose (e.g., 'I am searching for videos and analyzing the first result to provide insights')"
        }
      },
      required: ["query", "userDescription"]
    }
  }
};
