// DOM automation tool types

export interface InteractiveContextResult {
  success: boolean;
  context?: any;
  error?: string;
}

export interface ScrollPageResult {
  success: boolean;
  message: string;
  error?: string;
}

export interface DomToolCall {
  toolName: string;
  parameters: {
    reason: string;
    userDescription: string;
  };
}
