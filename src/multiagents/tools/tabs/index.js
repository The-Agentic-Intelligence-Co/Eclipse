/**
 * Índice de herramientas de pestañas
 */

// Exportar funciones de extracción
export { extractTabContent, extractMultipleTabsContent } from './extractor.js';

// Exportar definiciones de herramientas
export { 
  createExtractTabContentTool, 
  createExtractMultipleTabsContentTool,
  createOpenTabWithUrlTool,
  createGroupTabsTool,
  createListAllTabsTool
} from './definitions.js';

// Exportar ejecutores de herramientas
export { 
  executeExtractTabContent, 
  executeExtractMultipleTabsContent,
  executeOpenTabWithUrl,
  executeGroupTabs,
  executeListAllTabs
} from './executors.js';
