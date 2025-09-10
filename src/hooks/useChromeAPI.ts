import { useEffect } from 'react';

/**
 * Hook personalizado para manejar la API de Chrome
 * @returns {Object} Objeto vacío (solo para logging)
 */
export const useChromeAPI = (): Record<string, never> => {
  useEffect(() => {
    // Sidebar extension loaded successfully
    
    // Log cuando el panel se hace visible
    if (document.visibilityState === 'visible') {
      // Side panel is now visible
    }
    
    // Listener para cambios de visibilidad
    const handleVisibilityChange = (): void => {
      if (document.visibilityState === 'visible') {
        // Side panel became visible
      } else {
        // Side panel became hidden
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return {};
};
