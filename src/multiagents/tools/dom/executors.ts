import type { ToolResult } from '../tabs/types';

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

    // Check if content script is loaded
    console.log('Sending message to tab:', activeTab.id, 'URL:', activeTab.url);
    
    // Send message to content script with timeout
    const response = await Promise.race([
      chrome.tabs.sendMessage(activeTab.id, {
        action: 'getInteractiveContext'
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Content script timeout')), 5000)
      )
    ]) as any;

    if (!response) {
      throw new Error('No se recibió respuesta del content script');
    }

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
    const response = await chrome.tabs.sendMessage(activeTab.id, {
      action: 'scrollPage'
    });

    if (!response) {
      throw new Error('No se recibió respuesta del content script');
    }

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