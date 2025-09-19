/**
 * Utilidades específicas para manejo de pestañas del navegador
 */

import type { Tab } from '../types/hooks';

/**
 * Verifica si una pestaña es la pestaña activa actual
 * @param {Tab} tab - Pestaña a verificar
 * @param {Tab | null} currentActiveTab - Pestaña activa actual
 * @param {boolean} showCurrentTabIndicator - Si mostrar indicador de pestaña actual
 * @returns {boolean} True si es la pestaña activa
 */
export const isCurrentActiveTab = (tab: Tab, currentActiveTab: Tab | null, showCurrentTabIndicator: boolean): boolean => {
  return !!(showCurrentTabIndicator && currentActiveTab && currentActiveTab.id === tab.id);
};

/**
 * Verifica si una pestaña está seleccionada
 * @param {Tab} tab - Pestaña a verificar
 * @param {Tab[]} selectedTabs - Pestañas seleccionadas
 * @returns {boolean} True si está seleccionada
 */
export const isTabSelected = (tab: Tab, selectedTabs: Tab[]): boolean => {
  return selectedTabs.some(t => t.id === tab.id);
};
