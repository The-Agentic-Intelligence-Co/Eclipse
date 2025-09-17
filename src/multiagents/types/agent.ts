import type { Plan, ToolCall } from './plan';

export interface PlannerResponse {
  type: 'direct_response' | 'plan';
  content: string;
  plan?: Plan;
}

export type { Plan, PlanStep, ToolResult } from './plan';

export interface ExecutorResponse {
  type: 'tool_call' | 'no_tool_call' | 'step_completed';
  toolCall?: ToolCall;
  reason?: string;
  content: string;
}

export interface ValidatorResponse {
  type: 'step_completed' | 'step_in_progress' | 'plan_completed';
  stepId?: string;
  feedback?: string;
  updatedPlan?: Plan;
  userResponse: string;
}
