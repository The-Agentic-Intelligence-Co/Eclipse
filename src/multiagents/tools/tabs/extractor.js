/**
 * Tool para extraer contenido de texto de las pestañas seleccionadas
 * Usa Chrome scripting para obtener el contenido de las páginas
 */

/**
 * Extrae el texto de una pestaña específica
 * @param {number} tabId - ID de la pestaña
 * @returns {Promise<string>} Contenido de texto extraído
 */
import { CACHE_CONFIG, CONTENT_SELECTORS } from '../core/config.js';

// Caché simple en memoria con TTL para evitar repetir extracciones en poco tiempo
const tabContentCache = new Map(); // key: tabId, value: { content, expiresAt }

export async function extractTabContent(tabId, { ttlMs = CACHE_CONFIG.DEFAULT_TTL_MS } = {}) {
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
      func: (maxLength, selectors) => {
        // Función que se ejecuta en el contexto de la página
        const getPageContent = () => {
          // Intentar obtener el contenido principal
          let content = '';
          console.log("Buscando contenido en la página");
          
          // Buscar elementos de contenido principal usando selectors pasados como parámetro
          for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element) {
              content = element.innerText || element.textContent;
              console.log("Contenido encontrado en selector:", selector);
              break;
            }
          }

          // Si no hay contenido principal, usar el body
          if (!content) {
            content = document.body.innerText || document.body.textContent;
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
      args: [CACHE_CONFIG.MAX_CONTENT_LENGTH, CONTENT_SELECTORS] // Pasar maxLength y selectors como argumentos
    });
    console.log("Desde extractor.js, Resultados del script:", results);
    // Obtener el resultado del script
    if (results && results[0] && results[0].result) {
      const content = results[0].result;
      tabContentCache.set(tabId, { content, expiresAt: Date.now() + ttlMs });
      return content;
    }
    console.log("Desde extractor.js, No se pudo extraer contenido de esta pestaña");
    return 'No se pudo extraer contenido de esta pestaña';
    
  } catch (error) {
    return `Error al extraer contenido: ${error.message}`;
  }
}

/**
 * Extrae contenido de múltiples pestañas
 * @param {Array} tabs - Array de objetos de pestañas
 * @returns {Promise<Array>} Array de objetos con contenido extraído
 */
export async function extractMultipleTabsContent(tabs) {
  if (!tabs || tabs.length === 0) {
    return [];
  }

  const extractedContent = [];
  
  for (const tab of tabs) {
    try {
      const content = await extractTabContent(tab.id);
      extractedContent.push({
        tabId: tab.id,
        title: tab.title,
        url: tab.url,
        content: content
      });
    } catch (error) {
      extractedContent.push({
        tabId: tab.id,
        title: tab.title,
        url: tab.url,
        content: `Error: ${error.message}`
      });
    }
  }
  
  return extractedContent;
}
