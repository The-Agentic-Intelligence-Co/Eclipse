/**
 * Funciones de extracción de contenido DOM
 */

/**
 * Extrae el contenido del DOM del body de la pestaña activa
 * Limpia todos los atributos de estilo pero preserva otros atributos
 * @returns {Promise<string>} Contenido del DOM limpio
 */
export async function extractDomContent() {
  try {
    // Obtener la pestaña activa
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!activeTab) {
      throw new Error('No se pudo obtener la pestaña activa');
    }

    // Ejecutar script en la pestaña activa para extraer el DOM
    const results = await chrome.scripting.executeScript({
      target: { tabId: activeTab.id },
      func: extractDomFromPage
    });

    if (!results || results.length === 0) {
      throw new Error('No se pudo ejecutar el script de extracción');
    }

    const domContent = results[0].result;
    
    if (!domContent) {
      throw new Error('No se pudo extraer contenido del DOM');
    }

    return domContent;
    
  } catch (error) {
    console.error('Error al extraer contenido del DOM:', error);
    throw new Error(`Error al extraer contenido del DOM: ${error.message}`);
  }
}

/**
 * Función que se ejecuta en el contexto de la página para extraer el DOM
 * Esta función se ejecuta en el contexto de la página web
 * @returns {string} Contenido del DOM limpio
 */
function extractDomFromPage() {
  try {
    // Obtener el elemento body
    const body = document.body;
    
    if (!body) {
      return 'No se encontró el elemento body en la página';
    }

    // Clonar el body para no modificar el DOM original
    const clonedBody = body.cloneNode(true);
    
    // Función recursiva para limpiar solo atributos de estilo inline
    function cleanStylingAttributes(element) {
      // Solo remover el atributo 'style' (estilos inline)
      if (element.hasAttribute('style')) {
        element.removeAttribute('style');
      }
      
      // Procesar elementos hijos recursivamente
      for (let child of element.children) {
        cleanStylingAttributes(child);
      }
    }
    
    // Limpiar atributos de estilo del body clonado
    cleanStylingAttributes(clonedBody);
    
    // Convertir a string HTML
    const cleanHtml = clonedBody.outerHTML;
    
    // Limpiar espacios en blanco y saltos de línea innecesarios
    const cleanedHtml = cleanHtml
      .replace(/\s+/g, ' ')
      .replace(/>\s+</g, '><')
      .trim();
    
    return cleanedHtml;
    
  } catch (error) {
    console.error('Error al extraer DOM en la página:', error);
    return `Error al extraer contenido del DOM: ${error.message}`;
  }
}
