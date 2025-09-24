
import { getInteractiveContext, scrollToNewContent } from '@agentic-intelligence/dom-engine';
import type { InteractiveContextResult, ScrollPageResult, DomToolCall } from './types';

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

/**
 * Executes the scroll_page tool
 */
export const executeScrollPage = async (toolCall: DomToolCall): Promise<ScrollPageResult> => {
  try {
    console.log('Executing scroll_page with parameters:', toolCall.parameters);
    
    // Execute the DOM engine function to scroll down
    await scrollToNewContent();
    
    console.log('Page scrolled successfully');
    
    return {
      success: true,
      message: 'Page scrolled down successfully to reveal new content'
    };
  } catch (error) {
    console.error('Error executing scroll_page:', error);
    
    return {
      success: false,
      message: 'Failed to scroll page',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};
