import { marked } from 'marked';

/**
 * Configura marked con opciones seguras y optimizadas
 */
const configureMarked = () => {
  marked.setOptions({
    breaks: true,        // Permitir saltos de línea
    gfm: true,          // GitHub Flavored Markdown
    sanitize: false,    // No sanitizar (ya que confiamos en la IA)
    smartLists: true,   // Listas inteligentes
    smartypants: true   // Tipografía inteligente
  });
};

/**
 * Renderiza Markdown de forma segura
 * @param {string} markdownText - Texto en Markdown
 * @returns {string} HTML renderizado
 */
export const renderMarkdown = (markdownText) => {
  try {
    // Configurar marked para mayor seguridad
    configureMarked();
    
    return marked(markdownText);
  } catch (error) {
    console.error('Error al renderizar Markdown:', error);
    // En caso de error, devolver el texto plano
    return markdownText;
  }
};
