// Utilities for consistent error handling

// Handles errors consistently
export function handleAIError(error: unknown, context: string): string {
  console.error(`Error in ${context}:`, error);
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  return `Sorry, there was an error processing your request in ${context}. Please try again. Error: ${errorMessage}`;
}
