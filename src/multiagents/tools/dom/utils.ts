// Utility functions for DOM tools

// Ensures content script is loaded in the target tab
// If not loaded, injects it dynamically
export async function ensureContentScriptLoaded(tabId: number): Promise<void> {
  try {
    // Try to ping the content script
    await chrome.tabs.sendMessage(tabId, { action: 'ping' });
    console.log('Content script already loaded');
  } catch (error) {
    console.log('Content script not loaded, injecting dynamically...');
    
    // Inject content script
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['src/content/domContentScript.js']
    });
    
    // Wait for script to initialize
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Verify it's loaded
    try {
      await chrome.tabs.sendMessage(tabId, { action: 'ping' });
      console.log('Content script injected successfully');
    } catch (verifyError) {
      throw new Error('Failed to inject content script');
    }
  }
}

// Sends message to content script with automatic injection fallback
export async function sendMessageWithInjection(
  tabId: number, 
  message: any, 
  timeoutMs: number = 10000
): Promise<any> {
  // Ensure content script is loaded
  await ensureContentScriptLoaded(tabId);
  
  // Send message with timeout
  const response = await Promise.race([
    chrome.tabs.sendMessage(tabId, message),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Content script timeout')), timeoutMs)
    )
  ]) as any;

  if (!response) {
    throw new Error('No response from content script');
  }
  
  return response;
}
