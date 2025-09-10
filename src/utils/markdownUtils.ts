import { marked } from 'marked';

/**
 * Renderiza Markdown de forma segura
 * @param {string} markdownText - Texto en Markdown
 * @returns {string} HTML renderizado
 */
export const renderMarkdown = (markdownText: string): string => {
  try {
    // Usar marked.parse con configuración explícita para asegurar que devuelve string
    const result = marked.parse(markdownText, {
      breaks: true,        // Permitir saltos de línea
      gfm: true,          // GitHub Flavored Markdown
      async: false        // Asegurar que devuelve string, no Promise
    });
    
    // Verificar si el resultado es una Promise y manejarlo
    if (result && typeof result === 'object' && 'then' in result) {
      console.warn('marked.parse devolvió una Promise inesperadamente');
      return markdownText; // Fallback a texto plano
    }
    
    return result as string;
  } catch (error) {
    console.error('Error al renderizar Markdown:', error);
    // En caso de error, devolver el texto plano
    return markdownText;
  }
};
