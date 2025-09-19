import { marked } from 'marked';

// Converts markdown text to safe HTML
export const renderMarkdown = (markdownText: string): string => {
  try {
    // Parse markdown with safe settings
    const result = marked.parse(markdownText, {
      breaks: true,        // Allow line breaks
      gfm: true,          // GitHub Flavored Markdown
      async: false        // Ensure string output, not Promise
    });
    
    // Handle unexpected Promise result
    if (result && typeof result === 'object' && 'then' in result) {
      console.warn('marked.parse returned Promise unexpectedly');
      return markdownText; // Fallback to plain text
    }
    
    return result as string;
  } catch (error) {
    console.error('Error rendering Markdown:', error);
    // Return plain text on error
    return markdownText;
  }
};
