/**
 * Índice de tools disponibles para la IA
 */

export { extractTabContent, extractMultipleTabsContent } from './tabContentExtractor.js';
export { 
  getAvailableTools, 
  executeTool, 
  executeMultipleTools, 
  convertToolResultsToMessages 
} from './toolManager.js';

// Tools de video
export { 
  searchYt, 
  analyzeVideoWithAI, 
  extractTimestampFromAnalysis, 
  generateDirectTimestampUrl 
} from './video_search.js';

// Aquí se pueden agregar más tools en el futuro
// export { otraTool } from './otraTool.js';
