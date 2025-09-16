import type { Plan, ToolCall, HumanRequest } from './plan';

export interface PlannerResponse {
  type: 'direct_response' | 'plan';
  content: string;
  plan?: Plan;
}

export type { Plan, PlanStep, ToolResult } from './plan';

export interface ExecutorResponse {
  type: 'tool_call' | 'human_request' | 'step_completed';
  toolCall?: ToolCall;
  humanRequest?: HumanRequest;
  reason?: string;
  content: string;
}

export interface ValidatorResponse {
  type: 'step_completed' | 'step_in_progress' | 'plan_completed';
  stepId?: string;
  feedback?: string;
  updatedPlan?: Plan;
  content: string;
}
