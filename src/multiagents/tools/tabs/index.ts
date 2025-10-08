// Tab tools index

// Export extraction functions
export { extractTabContent, extractMultipleTabsContent } from './extractor';

// Export tool definitions
export { 
  createExtractTabContentTool, 
  createExtractMultipleTabsContentTool,
  OPEN_TAB_WITH_URL_TOOL,
  GROUP_TABS_TOOL,
  LIST_ALL_TABS_TOOL,
  SWITCH_TO_TAB_TOOL
} from './definitions';

// Export tool executors
export { 
  executeExtractTabContent, 
  executeExtractMultipleTabsContent,
  executeOpenTabWithUrl,
  executeGroupTabs,
  executeListAllTabs,
  executeSwitchToTab
} from './executors';

// Export types
export type { Tab, ToolCall, ToolDefinition, ToolResult, ExtractedContent } from './types';
