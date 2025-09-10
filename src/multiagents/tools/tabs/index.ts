/**
 * Índice de herramientas de pestañas
 */

// Exportar funciones de extracción
export { extractTabContent, extractMultipleTabsContent } from './extractor';

// Exportar definiciones de herramientas
export { 
  createExtractTabContentTool, 
  createExtractMultipleTabsContentTool,
  createOpenTabWithUrlTool,
  createGroupTabsTool,
  createListAllTabsTool
} from './definitions';

// Exportar ejecutores de herramientas
export { 
  executeExtractTabContent, 
  executeExtractMultipleTabsContent,
  executeOpenTabWithUrl,
  executeGroupTabs,
  executeListAllTabs
} from './executors';

// Exportar tipos
export type { Tab, ToolCall, ToolDefinition, ToolResult, ExtractedContent } from './types';
