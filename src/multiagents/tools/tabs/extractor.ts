/**
 * Tool para extraer contenido de texto de las pestañas seleccionadas
 * Usa Chrome scripting para obtener el contenido de las páginas
 */

import { CACHE_CONFIG, CONTENT_SELECTORS } from '../core/config.ts';
import type { Tab, ExtractedContent } from './types';

// Caché simple en memoria con TTL para evitar repetir extracciones en poco tiempo
const tabContentCache = new Map<number, { content: string; expiresAt: number }>();

/**
 * Extrae el texto de una pestaña específica
 * @param tabId - ID de la pestaña
 * @param options - Opciones de extracción incluyendo TTL del caché
 * @returns Contenido de texto extraído
 */
export async function extractTabContent(
  tabId: number, 
  { ttlMs = CACHE_CONFIG.DEFAULT_TTL_MS }: { ttlMs?: number } = {}
): Promise<string> {
  try {
    // Verificar que tenemos permisos de scripting
    if (!chrome?.scripting) {
      throw new Error('Chrome scripting API no disponible');
    }
    
    console.log("Desde extractor.js, Extrayendo contenido de la pestaña:", tabId);

    // Verificar caché
    const cached = tabContentCache.get(tabId);
    const now = Date.now();
    if (cached && cached.expiresAt > now) {
      return cached.content;
    }

    console.log("Desde extractor.js, Caché:", tabContentCache);

    // Ejecutar script para extraer contenido
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      func: (maxLength: number, selectors: string[]) => {
        // Función que se ejecuta en el contexto de la página
        const getPageContent = (): string => {
          // Intentar obtener el contenido principal
          let content = '';
          console.log("Buscando contenido en la página");
          
          // Buscar elementos de contenido principal usando selectors pasados como parámetro
          for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element) {
              content = (element as HTMLElement).innerText || element.textContent || '';
              console.log("Contenido encontrado en selector:", selector);
              break;
            }
          }

          // Si no hay contenido principal, usar el body
          if (!content) {
            content = document.body.innerText || document.body.textContent || '';
            console.log("Usando contenido del body");
          }
          
          console.log("Contenido extraído, longitud:", content.length);
          
          // Limpiar y formatear el texto
          return content
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, maxLength); // Limitar según configuración
        };
        
        console.log("Ejecutando script para extraer contenido");
        return getPageContent();
      },
      args: [CACHE_CONFIG.MAX_CONTENT_LENGTH, [...CONTENT_SELECTORS]] // Pasar maxLength y selectors como argumentos
    });
    console.log("Desde extractor.js, Resultados del script:", results);
    // Obtener el resultado del script
    if (results && results[0] && results[0].result) {
      const content = results[0].result as string;
      tabContentCache.set(tabId, { content, expiresAt: Date.now() + ttlMs });
      return content;
    }
    console.log("Desde extractor.js, No se pudo extraer contenido de esta pestaña");
    return 'No se pudo extraer contenido de esta pestaña';
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return `Error al extraer contenido: ${errorMessage}`;
  }
}

/**
 * Extrae contenido de múltiples pestañas
 * @param tabs - Array de objetos de pestañas
 * @returns Array de objetos con contenido extraído
 */
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
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      extractedContent.push({
        title: tab.title,
        url: tab.url,
        content: `Error: ${errorMessage}`
      });
    }
  }
  
  return extractedContent;
}
