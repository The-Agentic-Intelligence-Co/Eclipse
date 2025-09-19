// Chat message handling utilities

// Checks if message is empty or only whitespace
export const isMessageEmpty = (content: string): boolean => {
  return !content || content.trim() === '';
};

// Creates unique ID for messages
export const generateMessageId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};
