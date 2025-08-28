/**
 * Índice de herramientas de pestañas
 */

// Exportar funciones de extracción
export { extractTabContent, extractMultipleTabsContent } from './extractor.js';

// Exportar definiciones de herramientas
export { 
  createExtractTabContentTool, 
  createExtractMultipleTabsContentTool 
} from './definitions.js';

// Exportar ejecutores de herramientas
export { 
  executeExtractTabContent, 
  executeExtractMultipleTabsContent 
} from './executors.js';
