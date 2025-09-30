/**
 * Utility functions for glow animation management
 */

let currentActiveTabId: number | null = null;

/**
 * Ensures glow animation content script is loaded in the target tab
 * If not loaded, injects it dynamically
 */
export async function ensureGlowScriptLoaded(tabId: number): Promise<void> {
  try {
    // Try to ping the glow content script
    await chrome.tabs.sendMessage(tabId, { 
      source: 'GlowAnimationService',
      action: 'ping' 
    });
    console.log('[Glow] Script already loaded');
  } catch (error) {
    console.log('[Glow] Script not loaded, injecting dynamically...');
    
    // Inject glow content script
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['glow-animation.js']
    });
    
    // Wait for script to initialize
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Verify it's loaded
    try {
      await chrome.tabs.sendMessage(tabId, { 
        source: 'GlowAnimationService',
        action: 'ping' 
      });
      console.log('[Glow] Script injected successfully');
    } catch (verifyError) {
      throw new Error('Failed to inject glow script');
    }
  }
}

/**
 * Starts glow animation in the specified tab and tracks it as active
 */
export async function startGlowAnimation(tabId: number): Promise<void> {
  try {
    // Stop animation in previous active tab if different
    if (currentActiveTabId && currentActiveTabId !== tabId) {
      await stopGlowAnimation(currentActiveTabId);
    }
    
    await ensureGlowScriptLoaded(tabId);
    
    await chrome.tabs.sendMessage(tabId, {
      source: 'GlowAnimationService',
      action: 'startGlow'
    });
    
    // Notify background script that glow is active
    await chrome.runtime.sendMessage({
      action: 'setGlowActive',
      active: true
    });
    
    currentActiveTabId = tabId;
    console.log('[Glow] Animation started in tab', tabId);
  } catch (error) {
    console.error('[Glow] Error starting animation:', error);
  }
}

/**
 * Stops glow animation in the specified tab
 */
export async function stopGlowAnimation(tabId: number): Promise<void> {
  try {
    await chrome.tabs.sendMessage(tabId, {
      source: 'GlowAnimationService',
      action: 'stopGlow'
    });
    
    // Clear active tab tracking if this was the active tab
    if (currentActiveTabId === tabId) {
      currentActiveTabId = null;
    }
    
    console.log('[Glow] Animation stopped in tab', tabId);
  } catch (error) {
    console.error('[Glow] Error stopping animation:', error);
  }
}

/**
 * Stops glow animation in all tabs
 */
export async function stopGlowAnimationInAllTabs(): Promise<void> {
  try {
    // Only stop in the current active tab if we know it
    if (currentActiveTabId) {
      await stopGlowAnimation(currentActiveTabId);
    }
    
    // Notify background script that glow is inactive
    await chrome.runtime.sendMessage({
      action: 'setGlowActive',
      active: false
    });
    
    currentActiveTabId = null;
    console.log('[Glow] Animation stopped in all tabs');
  } catch (error) {
    console.error('[Glow] Error stopping animation in all tabs:', error);
  }
}

/**
 * Moves glow animation to the new active tab
 */
export async function moveGlowToActiveTab(newActiveTabId: number): Promise<void> {
  if (currentActiveTabId === newActiveTabId) {
    return; // Already active
  }
  
  try {
    // Stop in previous tab
    if (currentActiveTabId) {
      await stopGlowAnimation(currentActiveTabId);
    }
    
    // Start in new active tab
    await startGlowAnimation(newActiveTabId);
    
    console.log('[Glow] Animation moved to active tab', newActiveTabId);
  } catch (error) {
    console.error('[Glow] Error moving animation to active tab:', error);
  }
}
