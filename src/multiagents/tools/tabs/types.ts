/**
 * Tipos para herramientas de pestañas
 */

export interface Tab {
  id: number;
  title: string;
  url: string;
}

export interface ToolCall {
  id: string;
  function: {
    name: string;
    arguments: string;
  };
}

export interface ToolDefinition {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: {
      type: "object";
      properties: Record<string, {
        type: string;
        description: string;
        items?: any;
        enum?: string[];
        required?: string[];
        additionalProperties?: boolean;
      }>;
      required: string[];
    };
  };
}

export interface ToolResult {
  tool_call_id: string;
  functionName: string;
  content: string;
  success: boolean;
}

export interface ExtractedContent {
  title: string;
  url: string;
  content: string;
}
