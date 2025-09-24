import { getInteractiveContext, scrollToNewContent } from '@agentic-intelligence/dom-engine';

// Escuchar mensajes del background script
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'getInteractiveContext') {
    try {
      // Usar la librería con el contexto de la página actual
      const context = getInteractiveContext({ 
        injectTrackers: true, 
        context: { document, window } 
      });
      
      sendResponse({ 
        success: true, 
        context,
        url: window.location.href,
        title: document.title
      });
    } catch (error) {
      sendResponse({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    return true; // Mantener el canal abierto para respuesta asíncrona
  }
  
  if (request.action === 'scrollPage') {
    try {
      scrollToNewContent();
      sendResponse({ 
        success: true, 
        message: 'Page scrolled successfully'
      });
    } catch (error) {
      sendResponse({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    return true;
  }
});

console.log('DOM Content Script loaded and ready');
