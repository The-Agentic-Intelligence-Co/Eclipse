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
  return allTabs;
}

/**
 * Añade contexto de pestañas a los mensajes
 */
export function addTabContext(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>, 
  selectedTabs: Tab[], 
  currentActiveTab: Tab | null, 
  showCurrentTabIndicator: boolean
): Array<{ role: 'user' | 'assistant'; content: string }> {
  if (!selectedTabs?.length && !(currentActiveTab && showCurrentTabIndicator)) return messages;
  
  const contextParts: string[] = [];
  if (selectedTabs?.length) {
    contextParts.push(`**Selected tabs:**\n${selectedTabs.map(tab => `- **${tab.title}** (${tab.url})`).join('\n')}`);
  }
  if (currentActiveTab && showCurrentTabIndicator) {
    contextParts.push(`**Current active tab:**\n- **${currentActiveTab.title}** (${currentActiveTab.url})`);
  }
  
  const enhancedMessages = [...messages];
  if (enhancedMessages.length > 0) {
    enhancedMessages[0] = {
      ...enhancedMessages[0],
      content: `${enhancedMessages[0].content}\n\n**Context from browser tabs:**\n${contextParts.join('\n\n')}`
    };
  }
  return enhancedMessages;
}
