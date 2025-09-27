import type { ToolResult } from '../tabs/types';
import { sendMessageWithInjection } from './utils';

/**
 * Executes the get_interactive_context tool using content script messaging
 */
export const executeGetInteractiveContext = async (toolCall: any): Promise<ToolResult> => {
  try {
    console.log('Executing get_interactive_context with parameters:', toolCall);
    
    // Get the active tab
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!activeTab.id) {
      throw new Error('No se pudo obtener la pestaña activa');
    }
    
    // Send message to content script with automatic injection
    const response = await sendMessageWithInjection(activeTab.id, {
      action: 'getInteractiveContext'
    });

    console.log('Interactive context retrieved:', response);
    
    return {
      tool_call_id: toolCall.id,
      functionName: toolCall.function.name,
      content: response.success ? JSON.stringify(response.context) : response.error || 'Error desconocido',
      success: response.success
    };
  } catch (error) {
    console.error('Error executing get_interactive_context:', error);
    
    return {
      tool_call_id: toolCall.id,
      functionName: toolCall.function.name,
      content: error instanceof Error ? error.message : 'Unknown error occurred',
      success: false
    };
  }
};

/**
 * Executes the get_page_context tool using content script messaging
 */
export const executeGetPageContext = async (toolCall: any): Promise<ToolResult> => {
  try {
    console.log('Executing get_page_context with parameters:', toolCall);
    
    const { tabId } = JSON.parse(toolCall.function.arguments);
    
    // Get the specific tab
    const tab = await chrome.tabs.get(tabId);
    if (!tab.id) {
      throw new Error(`Tab with ID ${tabId} not found`);
    }

    // Send message to content script for both content extraction and interactive context
    const response = await sendMessageWithInjection(tab.id, {
      action: 'getPageContext'
    }, 10000);

    console.log('Page content and context retrieved:', response);
    
    return {
      tool_call_id: toolCall.id,
      functionName: toolCall.function.name,
      content: response.success ? JSON.stringify(response.data) : response.error || 'Error desconocido',
      success: response.success
    };
  } catch (error) {
    console.error('Error executing get_page_context:', error);
    
    return {
      tool_call_id: toolCall.id,
      functionName: toolCall.function.name,
      content: error instanceof Error ? error.message : 'Unknown error occurred',
      success: false
    };
  }
};

/**
 * Executes the execute_dom_actions tool using content script messaging
 */
export const executeDomActions = async (toolCall: any): Promise<ToolResult> => {
  try {
    console.log('Executing execute_dom_actions with parameters:', toolCall);
    
    const { tabId, actions } = JSON.parse(toolCall.function.arguments);
    
    // Get the specific tab
    const tab = await chrome.tabs.get(tabId);
    if (!tab.id) {
      throw new Error(`Tab with ID ${tabId} not found`);
    }

    // Send message to content script to execute DOM actions
    const response = await sendMessageWithInjection(tab.id, {
      action: 'executeDomActions',
      actions: actions
    }, 15000); // Longer timeout for multiple actions

    console.log('DOM actions executed:', response);
    
    return {
      tool_call_id: toolCall.id,
      functionName: toolCall.function.name,
      content: response.success ? JSON.stringify(response.results) : response.error || 'Error executing DOM actions',
      success: response.success
    };
  } catch (error) {
    console.error('Error executing execute_dom_actions:', error);
    
    return {
      tool_call_id: toolCall.id,
      functionName: toolCall.function.name,
      content: error instanceof Error ? error.message : 'Unknown error occurred',
      success: false
    };
  }
};

/**
 * Executes the scroll_page tool using content script messaging
 */
export const executeScrollPage = async (toolCall: any): Promise<ToolResult> => {
  try {
    console.log('Executing scroll_page with parameters:', toolCall);
    
    // Get the active tab
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!activeTab.id) {
      throw new Error('No se pudo obtener la pestaña activa');
    }

    // Send message to content script
    const response = await sendMessageWithInjection(activeTab.id, {
      action: 'scrollPage'
    });

    console.log('Page scroll response:', response);
    
    return {
      tool_call_id: toolCall.id,
      functionName: toolCall.function.name,
      content: response.success ? response.message || 'Page scrolled successfully' : response.error || 'Error al hacer scroll',
      success: response.success
    };
  } catch (error) {
    console.error('Error executing scroll_page:', error);
    
    return {
      tool_call_id: toolCall.id,
      functionName: toolCall.function.name,
      content: error instanceof Error ? error.message : 'Unknown error occurred',
      success: false
    };
  }
};