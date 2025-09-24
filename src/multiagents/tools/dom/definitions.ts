// DOM automation tool definitions

import type { ToolDefinition } from '../tabs/types';

/**
 * Definition for get_interactive_context tool
 */
export const GET_INTERACTIVE_CONTEXT_TOOL: ToolDefinition = {
  type: "function",
  function: {
    name: "get_interactive_context",
    description: "Extracts the current page's visible interactive elements to understand what actions are possible.",
    parameters: {
      type: "object",
      properties: {
        reason: {
          type: "string",
          description: "Reason why analyzing the interactive context is needed"
        },
        userDescription: {
          type: "string",
          description: "Clear description in first person of what tool is being used and for what specific purpose (e.g., 'I am analyzing the page structure to understand what actions I can perform')"
        }
      },
      required: ["reason", "userDescription"]
    }
  }
};

/**
 * Definition for scroll_page tool
 */
export const SCROLL_PAGE_TOOL: ToolDefinition = {
  type: "function",
  function: {
    name: "scroll_page",
    description: "Scrolls the current page down to navigate through content.",
    parameters: {
      type: "object",
      properties: {
        reason: {
          type: "string",
          description: "Reason why scrolling is needed"
        },
        userDescription: {
          type: "string",
          description: "Clear description in first person of what tool is being used and for what specific purpose (e.g., 'I am scrolling down to find more content')"
        }
      },
      required: ["direction", "reason", "userDescription"]
    }
  }
};

/**
 * Definition for extract_page_content_and_context tool
 */
export const EXTRACT_PAGE_CONTENT_AND_CONTEXT_TOOL: ToolDefinition = {
  type: "function",
  function: {
    name: "extract_page_content_and_context",
    description: "Extracts both the text content and interactive elements from a specific browser tab. Provides comprehensive page analysis including readable text and clickable elements.",
    parameters: {
      type: "object",
      properties: {
        tabId: {
          type: "number",
          description: "ID of the tab from which to extract content and interactive elements"
        },
        reason: {
          type: "string",
          description: "Reason why extracting both content and interactive context is needed"
        },
        userDescription: {
          type: "string",
          description: "Clear description in first person of what tool is being used and for what specific purpose (e.g., 'I am analyzing both the text content and interactive elements to understand what actions I can perform')"
        }
      },
      required: ["tabId", "reason", "userDescription"]
    }
  }
};

