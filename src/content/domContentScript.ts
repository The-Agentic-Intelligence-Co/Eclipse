import { getInteractiveContext, scrollToNewContent, executeActions } from '@agentic-intelligence/dom-engine';

// Escuchar mensajes del background script
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'ping') {
    sendResponse({ success: true, loaded: true });
    return true;
  }
  
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
  
  if (request.action === 'getPageContext') {
    try {
      // Extract text content and clean it
      const rawTextContent = document.body.innerText || document.body.textContent || '';
      const textContent = rawTextContent
        .replace(/[\n\t]+/g, ' ')  // Replace newlines and tabs with single space
        .replace(/\s+/g, ' ')      // Replace multiple spaces with single space
        .trim();                   // Remove leading/trailing whitespace
      
      // Get interactive context using DOM engine
      const interactiveContext = getInteractiveContext({ 
        injectTrackers: true, 
        context: { document, window } 
      });
      
      // Combine both results
      const combinedData = {
        url: window.location.href,
        title: document.title,
        textContent: textContent.trim(),
        interactiveElements: interactiveContext,
        timestamp: new Date().toISOString(),
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      };
      
      sendResponse({ 
        success: true, 
        data: combinedData
      });
    } catch (error) {
      sendResponse({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    return true;
  }
  
  if (request.action === 'executeDomActions') {
    const { actions } = request;
    
    // Usar la función executeActions de la librería dom-engine
    const result = executeActions(actions);
    
    sendResponse(result);
    return true;
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
