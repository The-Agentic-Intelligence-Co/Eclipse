/**
 * Índice de herramientas de pestañas
 */

// Exportar funciones de extracción
export { extractTabContent, extractMultipleTabsContent } from './extractor';

// Exportar definiciones de herramientas
export { 
  createExtractTabContentTool, 
  createExtractMultipleTabsContentTool,
  OPEN_TAB_WITH_URL_TOOL,
  GROUP_TABS_TOOL,
  LIST_ALL_TABS_TOOL,
  SWITCH_TO_TAB_TOOL
} from './definitions';

// Exportar ejecutores de herramientas
export { 
  executeExtractTabContent, 
  executeExtractMultipleTabsContent,
  executeOpenTabWithUrl,
  executeGroupTabs,
  executeListAllTabs,
  executeSwitchToTab
} from './executors';

// Exportar tipos
export type { Tab, ToolCall, ToolDefinition, ToolResult, ExtractedContent } from './types';
