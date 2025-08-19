// Configure side panel to open automatically when extension icon is clicked
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
  .then(() => {
    // Side panel behavior configured successfully
  })
  .catch((error) => {
    console.error('Failed to configure side panel behavior:', error);
  });

// Listen for extension icon clicks
chrome.action.onClicked.addListener((tab) => {
  // Extension icon clicked, opening side panel...
  
  // Try to open the side panel programmatically as a fallback
  chrome.sidePanel.open({ windowId: tab.windowId })
    .then(() => {
      // Side panel opened successfully
    })
    .catch((error) => {
      console.error('Failed to open side panel:', error);
    });
});

// Background script loaded
