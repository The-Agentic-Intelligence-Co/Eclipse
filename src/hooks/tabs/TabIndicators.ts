import { useState } from 'react';
import type { UseTabIndicatorsReturn } from '../../types/hooks';

// Handles tab indicators hover state
export const useTabIndicators = (): UseTabIndicatorsReturn => {
  const [hoveredIndicator, setHoveredIndicator] = useState<string | null>(null);

  return {
    // State
    hoveredIndicator,
    
    // Actions
    setHoveredIndicator
  };
};
