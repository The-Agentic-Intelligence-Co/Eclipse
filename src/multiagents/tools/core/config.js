/**
 * Configuración centralizada para todas las herramientas
 */

// Configuración de YouTube API
export const YOUTUBE_CONFIG = {
  API_KEY: "AIzaSyC3ekSF0lZN91aNLK8c0QlWzgqfo8H2kiM",
  API_URL: "https://www.googleapis.com/youtube/v3",
  DEFAULT_MAX_RESULTS: 5,
  MAX_RESULTS: 10
};

// Configuración de Google AI
export const GOOGLE_AI_CONFIG = {
  API_KEY: "AIzaSyAjhElUElRbIOQHh1hp7IokzOIwOKYSOZk",
  MODEL: "gemini-2.5-pro"
};

// Configuración de caché para extracción de contenido
export const CACHE_CONFIG = {
  DEFAULT_TTL_MS: 30_000, // 30 segundos
  MAX_CONTENT_LENGTH: 5000
};

// Configuración de selectores para extracción de contenido
export const CONTENT_SELECTORS = [
  'main',
  'article',
  '.content',
  '.main-content',
  '#content',
  '#main',
  '.post-content',
  '.entry-content'
];
