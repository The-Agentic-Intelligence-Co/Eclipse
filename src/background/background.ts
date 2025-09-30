// Configure side panel to open automatically when extension icon is clicked
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
  .then(() => {
    // Side panel behavior configured successfully
  })
  .catch((error: Error) => {
    console.error('Failed to configure side panel behavior:', error);
  });

// Listen for extension icon clicks
chrome.action.onClicked.addListener((tab: chrome.tabs.Tab) => {
  // Extension icon clicked, opening side panel...
  
  // Try to open the side panel programmatically as a fallback
  chrome.sidePanel.open({ windowId: tab.windowId })
    .then(() => {
      // Side panel opened successfully
    })
    .catch((error: Error) => {
      console.error('Failed to open side panel:', error);
    });
});

// Track if glow animation is active
let isGlowActive = false;

// Track the current tab with glow animation
let currentGlowTabId: number | null = null;

// Listen for tab activation changes to move glow animation
chrome.tabs.onActivated.addListener((activeInfo) => {
  if (!isGlowActive) return; // Only move glow if it's currently active
  
  // Ensure glow script is loaded in the new active tab
  chrome.scripting.executeScript({
    target: { tabId: activeInfo.tabId },
    files: ['glow-animation.js']
  }).then(() => {
    // Wait for script to initialize
    setTimeout(() => {
      // Start glow in the new active tab
      chrome.tabs.sendMessage(activeInfo.tabId, {
        source: 'GlowAnimationService',
        action: 'startGlow'
      }).catch(() => {}); // Ignore errors if script not loaded
      
      currentGlowTabId = activeInfo.tabId;
      console.log('[Background] Glow moved to tab', activeInfo.tabId);
    }, 1000);
  }).catch(() => {
    // If injection fails, try to start glow anyway
    chrome.tabs.sendMessage(activeInfo.tabId, {
      source: 'GlowAnimationService',
      action: 'startGlow'
    }).catch(() => {});
    currentGlowTabId = activeInfo.tabId;
  });
});

// Listen for messages to control glow state
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'setGlowActive') {
    isGlowActive = request.active;
    if (!isGlowActive) {
      currentGlowTabId = null; // Reset current tab when glow is deactivated
    }
    console.log('[Background] Glow active state set to:', isGlowActive);
    sendResponse({ success: true });
  }
});

// Background script loaded
