import type { Tab } from '../../types/hooks';

// Load all available browser tabs
export const loadTabs = async (): Promise<Tab[]> => {
  try {
    return chrome?.tabs ? (await chrome.tabs.query({}) as Tab[]) : [];
  } catch (error) {
    console.log('No se pudieron cargar las pestañas:', error);
    return [];
  }
};
