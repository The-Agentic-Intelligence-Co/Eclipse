import { useState, useEffect } from 'react';
import { WELCOME_MESSAGES, WELCOME_MESSAGE_INTERVAL } from '../../constants/welcomeMessages';
import type { UseWelcomeMessagesReturn } from '../../types/hooks';

// Manages rotating welcome messages for the UI
export const useWelcomeMessages = (hasStartedChat: boolean): UseWelcomeMessagesReturn => {
  const [welcomeMessageIndex, setWelcomeMessageIndex] = useState<number>(0);

  // Rotate welcome messages every 3 seconds when chat hasn't started
  useEffect(() => {
    if (!hasStartedChat) {
      const interval = setInterval(() => {
        setWelcomeMessageIndex(prev => (prev + 1) % WELCOME_MESSAGES.length);
      }, WELCOME_MESSAGE_INTERVAL);

      return () => clearInterval(interval);
    }
  }, [hasStartedChat]);

  return {
    currentWelcomeMessage: WELCOME_MESSAGES[welcomeMessageIndex],
    hasWelcomeMessages: !hasStartedChat
  };
};
