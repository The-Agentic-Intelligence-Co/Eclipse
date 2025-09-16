export interface Plan {
  id: string;
  status: 'draft' | 'executing' | 'completed' | 'error' | 'paused';
  title: string;
  description: string;
  steps: PlanStep[];
  toolCallHistory: ToolCallHistory[];  // Historial global de todas las herramientas
  createdAt: Date;
  updatedAt: Date;
}

export interface PlanStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'done' | 'error' | 'waiting_human';
  order: number;
}

export interface ToolCallHistory {
  id: string;
  toolCall: ToolCall;
  reason: string;
  result: ToolResult;
  timestamp: Date;
  stepId: string;
}

export interface ToolCall {
  id: string;
  function: {
    name: string;
    arguments: string;
  };
}

export interface ToolResult {
  tool_call_id: string;
  functionName: string;
  content: string;
  success: boolean;
}

export interface HumanRequest {
  message: string;
  type: 'information' | 'confirmation' | 'action';
  required: boolean;
  context?: string;
}
