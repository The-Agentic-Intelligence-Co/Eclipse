// Tool to extract text content from selected tabs
// Uses Chrome scripting to get page content

import { CACHE_CONFIG, CONTENT_SELECTORS } from '../core/config.ts';
import type { Tab, ExtractedContent } from './types';

// Simple in-memory cache with TTL to avoid repeating extractions in short time
const tabContentCache = new Map<number, { content: string; expiresAt: number }>();

// Extract text from a specific tab
export async function extractTabContent(
  tabId: number, 
  { ttlMs = CACHE_CONFIG.DEFAULT_TTL_MS }: { ttlMs?: number } = {}
): Promise<string> {
  try {
    // Check that we have scripting permissions
    if (!chrome?.scripting) {
      throw new Error('Chrome scripting API not available');
    }
    
    console.log("Desde extractor.ts, Extrayendo contenido de la pestaña:", tabId);

    // Check cache
    const cached = tabContentCache.get(tabId);
    const now = Date.now();
    if (cached && cached.expiresAt > now) {
      return cached.content;
    }

    // Execute script to extract content
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      func: (maxLength: number, selectors: string[]) => {
        // Function that runs in the page context
        const getPageContent = (): string => {
          // Try to get main content
          let content = '';
          console.log("Buscando contenido en la página");
          
          // Search for main content elements using passed selectors
          for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element) {
              content = (element as HTMLElement).innerText || element.textContent || '';
              break;
            }
          }

          // If no main content, use the body
          if (!content) {
            content = document.body.innerText || document.body.textContent || '';
          }
                    
          // Clean and format the text
          return content
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, maxLength); // Limit according to configuration
        };
        
        return getPageContent();
      },
      args: [CACHE_CONFIG.MAX_CONTENT_LENGTH, [...CONTENT_SELECTORS]] // Pass maxLength and selectors as arguments
    });
    console.log("Desde extractor.js, Resultados del script:", results);
    // Get script result
    if (results && results[0] && results[0].result) {
      const content = results[0].result as string;
      tabContentCache.set(tabId, { content, expiresAt: Date.now() + ttlMs });
      return content;
    }
    console.log("Desde extractor.js, No se pudo extraer contenido de esta pestaña");
    return 'Could not extract content from this tab';
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return `Error extracting content: ${errorMessage}`;
  }
}

// Extract content from multiple tabs
export async function extractMultipleTabsContent(tabs: Tab[]): Promise<ExtractedContent[]> {
  if (!tabs || tabs.length === 0) {
    return [];
  }

  const extractedContent: ExtractedContent[] = [];
  
  for (const tab of tabs) {
    try {
      const content = await extractTabContent(tab.id);
      extractedContent.push({
        title: tab.title,
        url: tab.url,
        content: content
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      extractedContent.push({
        title: tab.title,
        url: tab.url,
        content: `Error: ${errorMessage}`
      });
    }
  }
  
  return extractedContent;
}
