import { useEffect } from 'react';

export const useChromeAPI = () => {
  useEffect(() => {
    // Sidebar extension loaded successfully
    
    // Log cuando el panel se hace visible
    if (document.visibilityState === 'visible') {
      // Side panel is now visible
    }
    
    // Listener para cambios de visibilidad
    const handleVisibilityChange = () => {
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
