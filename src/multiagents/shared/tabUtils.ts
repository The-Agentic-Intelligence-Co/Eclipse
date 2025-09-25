/**
 * Utilidades para manejo de pestañas y contexto del navegador
 */

import type { Tab } from "../tools/tabs/types";

/**
 * Unifica las pestañas seleccionadas con la pestaña activa actual
 */
export function getUnifiedTabs(
  selectedTabs: Tab[], 
  currentActiveTab: Tab | null, 
  showCurrentTabIndicator: boolean
): Tab[] {
  const allTabs = [...selectedTabs];
  if (currentActiveTab && showCurrentTabIndicator && !selectedTabs.some(tab => tab.id === currentActiveTab.id)) {
    allTabs.push(currentActiveTab);
  }
  console.log('allTabs in getUnifiedTabs', allTabs);
  return allTabs;
}

/**
 * Añade contexto de pestañas a los mensajes con estado actualizado en tiempo real
 */
export async function addTabContext(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>, 
  selectedTabs: Tab[], 
  currentActiveTab: Tab | null, 
  showCurrentTabIndicator: boolean
): Promise<Array<{ role: 'user' | 'assistant'; content: string }>> {
  if (!selectedTabs?.length && !(currentActiveTab && showCurrentTabIndicator)) return messages;
  
  // Obtener el estado actual de las pestañas en tiempo real
  const currentActiveTabInfo = await getCurrentActiveTab();
  
  const contextParts: string[] = [];
  if (selectedTabs?.length) {
    contextParts.push(`**Selected tabs:**\n${selectedTabs.map(tab => `- **${tab.title}** (${tab.url})`).join('\n')}`);
  }
  
  // Usar la pestaña activa actual en lugar de la obsoleta
  if (currentActiveTabInfo && showCurrentTabIndicator) {
    contextParts.push(`**Current active tab:**\n- **${currentActiveTabInfo.title}** (${currentActiveTabInfo.url})`);
  }
  
  console.log('contextParts in addTabContext (updated)', contextParts);
  
  const enhancedMessages = [...messages];
  if (enhancedMessages.length > 0) {
    enhancedMessages[0] = {
      ...enhancedMessages[0],
      content: `${enhancedMessages[0].content}\n\n**Context from browser tabs:**\n${contextParts.join('\n\n')}`
    };
  }
  return enhancedMessages;
}

/**
 * Obtiene la pestaña activa actual en tiempo real
 */
async function getCurrentActiveTab(): Promise<Tab | null> {
  try {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (activeTab && activeTab.id && activeTab.url) {
      return {
        id: activeTab.id,
        title: activeTab.title || 'Untitled',
        url: activeTab.url
      };
    }
    return null;
  } catch (error) {
    console.warn('Error getting current active tab:', error);
    return null;
  }
}
