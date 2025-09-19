// DOM automation tool definitions

import type { ToolDefinition } from '../tabs/types';

/**
 * Definition for get_interactive_context tool
 */
export const GET_INTERACTIVE_CONTEXT_TOOL: ToolDefinition = {
  type: "function",
  function: {
    name: "get_interactive_context",
    description: "Analyzes the current page's interactive elements and DOM structure to understand what actions are possible. Useful for understanding page layout, forms, buttons, and other interactive components.",
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
