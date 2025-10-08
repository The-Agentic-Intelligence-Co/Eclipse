// Centralized configuration for all tools

// YouTube API configuration
export const YOUTUBE_CONFIG = {
  API_KEY: (import.meta as any).env.VITE_YOUTUBE_API_KEY,
  API_URL: "https://www.googleapis.com/youtube/v3",
  DEFAULT_MAX_RESULTS: 5,
  MAX_RESULTS: 10
} as const;

// Google AI configuration
export const GOOGLE_AI_CONFIG = {
  API_KEY: (import.meta as any).env.VITE_GOOGLE_AI_API_KEY,
  MODEL: "gemini-2.5-pro"
} as const;

// Cache configuration for content extraction
export const CACHE_CONFIG = {
  DEFAULT_TTL_MS: 30_000, // 30 seconds
  MAX_CONTENT_LENGTH: 5000
} as const;

// Content selectors for extraction
export const CONTENT_SELECTORS = [
  'main',
  'article',
  '.content',
  '.main-content',
  '#content',
  '#main',
  '.post-content',
  '.entry-content'
] as const;
