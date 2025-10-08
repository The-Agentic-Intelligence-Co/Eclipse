// Glow animation for visual feedback when AI is working

(() => {
  const GLOW_OVERLAY_ID = 'eclipse-glow-overlay'
  const GLOW_STYLES_ID = 'eclipse-glow-styles'
  const GLOW_INITIALIZED_KEY = 'eclipse-glow-initialized'
  const GLOW_ENABLED_KEY = 'eclipse-glow-enabled'  // Setting stored in browser
  
  // Check if already loaded to avoid duplicates
  if (window[GLOW_INITIALIZED_KEY]) {
    console.log('[Eclipse] Glow animation already initialized')
    return
  }
  window[GLOW_INITIALIZED_KEY] = true
  
  // Add the glow animation styles to the page
  function injectStyles() {
    if (document.getElementById(GLOW_STYLES_ID)) {
      return
    }
    
    const style = document.createElement('style')
    style.id = GLOW_STYLES_ID
    style.textContent = `
      @keyframes eclipse-glow-pulse {
        0% {
          box-shadow:
            inset 0 0 42px 19px transparent,
            inset 0 0 36px 16px rgba(251, 102, 24, 0.15),
            inset 0 0 30px 13px rgba(251, 102, 24, 0.25),
            inset 0 0 24px 10px rgba(251, 102, 24, 0.35);
        }
        50% {
          box-shadow:
            inset 0 0 52px 25px transparent,
            inset 0 0 46px 23px rgba(251, 102, 24, 0.20),
            inset 0 0 39px 19px rgba(251, 102, 24, 0.30),
            inset 0 0 33px 16px rgba(251, 102, 24, 0.40);
        }
        100% {
          box-shadow:
            inset 0 0 42px 19px transparent,
            inset 0 0 36px 16px rgba(251, 102, 24, 0.15),
            inset 0 0 30px 13px rgba(251, 102, 24, 0.25),
            inset 0 0 24px 10px rgba(251, 102, 24, 0.35);
        }
      }
      
      @keyframes eclipse-glow-fade-in {
        from { opacity: 0; }
        to { opacity: 0.9; }
      }
      
      #${GLOW_OVERLAY_ID} {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        pointer-events: none !important;
        z-index: 2147483647 !important;
        opacity: 0;
        will-change: opacity;
        animation: 
          eclipse-glow-pulse 3s ease-in-out infinite,
          eclipse-glow-fade-in 420ms cubic-bezier(0.22, 1, 0.36, 1) forwards !important;
      }
    `
    document.head.appendChild(style)
  }
  
  // Start the glow effect on the page
  function startGlow() {
    console.log('[Eclipse] startGlow() called')
    // Remove any existing glow effect
    stopGlow()
    
    // Add the glow styles
    console.log('[Eclipse] Injecting styles...')
    injectStyles()
    
    // Create the glow overlay
    console.log('[Eclipse] Creating overlay...')
    const overlay = document.createElement('div')
    overlay.id = GLOW_OVERLAY_ID
    document.body.appendChild(overlay)
    
    console.log('[Eclipse] Glow animation started, overlay added to DOM')
  }
  
  // Stop the glow effect
  function stopGlow() {
    const overlay = document.getElementById(GLOW_OVERLAY_ID)
    if (overlay) {
      overlay.remove()
      console.log('[Eclipse] Glow animation stopped')
    }
  }

  // Check if glow effect is enabled in settings
  function isGlowEnabled() {
    console.log('[Eclipse] isGlowEnabled() called')
    return new Promise((resolve, reject) => {
      try {
        console.log('[Eclipse] Checking chrome.storage.local...')
        if (!chrome.storage || !chrome.storage.local) {
          console.log('[Eclipse] chrome.storage.local not available')
          reject(new Error('chrome.storage.local not available'))
          return
        }
        
        chrome.storage.local.get(GLOW_ENABLED_KEY, (result) => {
          console.log('[Eclipse] Storage result:', result)
          // If setting is missing, glow is enabled by default
          const enabled = result && Object.prototype.hasOwnProperty.call(result, GLOW_ENABLED_KEY)
            ? result[GLOW_ENABLED_KEY] !== false
            : true
          console.log('[Eclipse] Resolving with enabled:', enabled)
          resolve(enabled)
        })
      } catch (e) {
        console.log('[Eclipse] Error in isGlowEnabled:', e)
        reject(e)
      }
    })
  }
  
  // Listen for messages from the extension
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('[Eclipse] Glow animation received ANY message:', request)
    if (request.source !== 'GlowAnimationService') {
      console.log('[Eclipse] Message source not GlowAnimationService, ignoring')
      return
    }
    console.log('[Eclipse] Glow animation message received:', request.action)
    
    switch (request.action) {
      case 'ping':
        sendResponse({ success: true, loaded: true })
        return true
        
      case 'startGlow': {
        // Check if glow is enabled in settings
        console.log('[Eclipse] Checking if glow is enabled...')
        isGlowEnabled().then((enabled) => {
          console.log('[Eclipse] Glow enabled:', enabled)
          if (enabled) {
            console.log('[Eclipse] Starting glow animation...')
            startGlow()
          } else {
            console.log('[Eclipse] Glow is disabled, skipping animation')
          }
          sendResponse({ success: true, skipped: !enabled })
        }).catch((error) => {
          console.log('[Eclipse] Error checking glow enabled, defaulting to true:', error)
          startGlow()
          sendResponse({ success: true, skipped: false })
        })
        return true
      }
        
      case 'stopGlow':
        stopGlow()
        sendResponse({ success: true })
        break
        
      default:
        sendResponse({ success: false, error: 'Unknown action' })
    }
    
    return true  // Keep message channel open for responses
  })
  
  // Stop glow when page is closed
  window.addEventListener('beforeunload', stopGlow)
  
  // Stop glow when switching tabs
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopGlow()
    }
  })
  
  // Ready to start glow when extension sends message
  
  console.log('[Eclipse] Glow animation content script loaded and ready')
})()
