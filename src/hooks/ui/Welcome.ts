import { useState, useEffect } from 'react';
import { WELCOME_MESSAGES, WELCOME_MESSAGE_INTERVAL } from '../../constants/welcomeMessages';
import type { 
  UseWelcomeMessagesReturn
} from '../../types/hooks';

/**
 * Hook personalizado para manejar los mensajes de bienvenida rotativos
 * @param {boolean} hasStartedChat - Si el chat ha comenzado
 * @returns {UseWelcomeMessagesReturn} Estado del mensaje de bienvenida actual
 */
export const useWelcomeMessages = (hasStartedChat: boolean): UseWelcomeMessagesReturn => {
  const [welcomeMessageIndex, setWelcomeMessageIndex] = useState<number>(0);

  // Rotar mensajes de bienvenida cada 3 segundos
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
