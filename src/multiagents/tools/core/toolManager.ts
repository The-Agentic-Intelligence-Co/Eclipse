// Tool manager for AI - refactored version
// Handles tool execution and result conversion

import { 
  createExtractTabContentTool, 
  createExtractMultipleTabsContentTool,
  OPEN_TAB_WITH_URL_TOOL,
  GROUP_TABS_TOOL,
  LIST_ALL_TABS_TOOL,
  SWITCH_TO_TAB_TOOL
} from '../tabs/definitions';

import {
  SEARCH_YOUTUBE_TOOL,
  ANALYZE_VIDEO_TOOL,
  SEARCH_AND_ANALYZE_TOOL
} from '../video/definitions';

import {
  executeExtractTabContent,
  executeExtractMultipleTabsContent,
  executeOpenTabWithUrl,
  executeGroupTabs,
  executeListAllTabs,
  executeSwitchToTab
} from '../tabs/executors';

import {
  executeSearchYoutube,
  executeAnalyzeVideoWithAI,
  executeSearchAndAnalyzeVideo
} from '../video/executors';

import type { Tab, ToolDefinition, ToolCall, ToolResult } from '../tabs/types';
import { GET_INTERACTIVE_CONTEXT_TOOL, SCROLL_PAGE_TOOL, GET_PAGE_CONTEXT_TOOL, EXECUTE_DOM_ACTIONS_TOOL } from '../dom/definitions';
import { executeGetInteractiveContext, executeScrollPage, executeGetPageContext, executeDomActions } from '../dom/executors';

// Gets available tools for AI based on selected tabs and mode
export function getAvailableTools(selectedTabs: Tab[] = [], mode: 'ask' | 'agent' = 'agent'): ToolDefinition[] {
  const tools: ToolDefinition[] = [];
  
  // Only include extraction tool if there are selected tabs
  if (selectedTabs && selectedTabs.length > 0) {
    // Add tool to extract content from a specific tab
    tools.push(createExtractTabContentTool(selectedTabs));
    
    // Add tool to extract content from multiple tabs if there are more than one
    if (selectedTabs.length > 1) {
      tools.push(createExtractMultipleTabsContentTool(selectedTabs));
    }
  }
  
  if (mode === 'ask') {
    tools.push(SEARCH_YOUTUBE_TOOL);
    tools.push(ANALYZE_VIDEO_TOOL);
    tools.push(SEARCH_AND_ANALYZE_TOOL);
  } else {
    tools.push(OPEN_TAB_WITH_URL_TOOL);
    tools.push(GROUP_TABS_TOOL);
    tools.push(LIST_ALL_TABS_TOOL);
    tools.push(SWITCH_TO_TAB_TOOL);
    tools.push(SEARCH_YOUTUBE_TOOL);
    tools.push(ANALYZE_VIDEO_TOOL);
    tools.push(SEARCH_AND_ANALYZE_TOOL);
    tools.push(GET_INTERACTIVE_CONTEXT_TOOL);
    tools.push(SCROLL_PAGE_TOOL);
    tools.push(GET_PAGE_CONTEXT_TOOL);
    tools.push(EXECUTE_DOM_ACTIONS_TOOL);
  }

  return tools;
}

// Executes a specific tool
export async function executeTool(
  toolCall: ToolCall, 
  selectedTabs: Tab[] = [], 
  mode: 'ask' | 'agent' = 'agent'
): Promise<ToolResult> {
  try {
    const toolName = toolCall.function.name;
    
    // Validate that tool is allowed in current mode
    if (mode === 'ask') {
      const askModeTools = [
        'extract_tab_content',
        'extract_multiple_tabs_content',
        'search_youtube',
        'analyze_video_with_ai',
        'search_and_analyze_video'
      ];
      
      if (!askModeTools.includes(toolName)) {
        return {
          tool_call_id: toolCall.id,
          functionName: toolName,
          content: `❌ Tool "${toolName}" is not available in 'Ask' mode. Only analysis and query tools are allowed.`,
          success: false
        };
      }
    }
    
    // Tool mapping to their executors
    const toolExecutors: Record<string, () => Promise<ToolResult>> = {
      'extract_tab_content': () => executeExtractTabContent(toolCall, selectedTabs),
      'extract_multiple_tabs_content': () => executeExtractMultipleTabsContent(toolCall, selectedTabs),
      'open_tab_with_url': () => executeOpenTabWithUrl(toolCall),
      'group_tabs': () => executeGroupTabs(toolCall),
      'list_all_tabs': () => executeListAllTabs(toolCall),
      'switch_to_tab': () => executeSwitchToTab(toolCall),
      'search_youtube': () => executeSearchYoutube(toolCall),
      'analyze_video_with_ai': () => executeAnalyzeVideoWithAI(toolCall),
      'search_and_analyze_video': () => executeSearchAndAnalyzeVideo(toolCall),
      'get_interactive_context': () => executeGetInteractiveContext(toolCall),
      'scroll_page': () => executeScrollPage(toolCall),
      'get_page_context': () => executeGetPageContext(toolCall),
      'execute_dom_actions': () => executeDomActions(toolCall)
    };
    
    const executor = toolExecutors[toolName];
    if (!executor) {
      return {
        tool_call_id: toolCall.id,
        functionName: toolName,
        content: `Error: Tool "${toolName}" not recognized.`,
        success: false
      };
    }
    
    return await executor();
    
  } catch (error) {
    console.error('Error executing tool:', error);
    console.error('Error in tool call:', toolCall);
    return {
      tool_call_id: toolCall.id,
      functionName: toolCall.function.name,
      content: `Error executing tool: ${error instanceof Error ? error.message : 'Unknown error'}`,
      success: false
    };
  }
}

// Executes multiple tools in parallel
export async function executeMultipleTools(
  toolCalls: ToolCall[], 
  selectedTabs: Tab[] = [], 
  mode: 'ask' | 'agent' = 'agent'
): Promise<ToolResult[]> {
  if (!toolCalls || toolCalls.length === 0) {
    return [];
  }
  
  // Deduplicate tool calls by id
  const uniqueToolCalls = toolCalls.filter((toolCall, index, self) => 
    index === self.findIndex(tc => tc.id === toolCall.id)
  );
  
  // Execute each tool in parallel
  const executionPromises = uniqueToolCalls.map(toolCall => 
    executeTool(toolCall, selectedTabs, mode)
  );
  
  const results = await Promise.all(executionPromises);
  
  // Simple log of executed tools
  const toolNames = uniqueToolCalls.map(tc => tc.function.name).join(', ');
  console.log(`🛠️ Tools executed: ${toolNames}`);
  
  return results;
}

// Converts tool results to Groq message format
export function convertToolResultsToMessages(toolResults: ToolResult[]): Array<{
  role: 'tool';
  tool_call_id: string;
  name: string;
  content: string;
}> {
  return toolResults.map(result => ({
    role: 'tool' as const,
    tool_call_id: result.tool_call_id,
    name: result.functionName,
    content: result.content
  }));
}
