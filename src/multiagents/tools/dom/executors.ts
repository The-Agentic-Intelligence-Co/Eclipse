
import { getInteractiveContext } from '@agentic-intelligence/dom-engine';
import type { InteractiveContextResult, DomToolCall } from './types';

/**
 * Executes the get_interactive_context tool
 */
export const executeGetInteractiveContext = async (toolCall: DomToolCall): Promise<InteractiveContextResult> => {
  try {
    console.log('Executing get_interactive_context with parameters:', toolCall.parameters);
    
    // Execute the DOM engine function
    const context = await getInteractiveContext({ withTracking: true });
    
    console.log('Interactive context retrieved:', context);
    
    return {
      success: true,
      context: context
    };
  } catch (error) {
    console.error('Error executing get_interactive_context:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};
