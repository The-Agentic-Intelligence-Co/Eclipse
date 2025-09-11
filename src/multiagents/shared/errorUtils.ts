/**
 * Utilidades para manejo de errores de manera consistente
 */

/**
 * Maneja errores de manera consistente
 */
export function handleAIError(error: unknown, context: string): string {
  console.error(`Error en ${context}:`, error);
  const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
  return `Lo siento, hubo un error al procesar tu consulta en ${context}. Por favor, intenta de nuevo. Error: ${errorMessage}`;
}
