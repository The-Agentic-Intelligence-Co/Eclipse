/**
 * Esquemas JSON para el Executor Agent
 */

export const EXECUTOR_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    type: {
      type: "string",
      enum: ["tool_call", "human_request", "step_completed"]
    },
    toolCall: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "Identificador único de la llamada a herramienta"
        },
        function: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Nombre de la herramienta a ejecutar"
            },
            arguments: {
              type: "object",
              description: "Argumentos para la herramienta"
            }
          },
          required: ["name", "arguments"],
          additionalProperties: false
        }
      },
      required: ["id", "function"],
      additionalProperties: false
    },
    reason: {
      type: "string",
      description: "Explicación de por qué se eligió esta acción"
    },
    content: {
      type: "string",
      description: "Contenido de la respuesta"
    }
  },
  required: ["type", "content"],
  additionalProperties: false
};

export const EXECUTOR_JSON_SCHEMA_CONFIG = {
  name: "executor_response",
  schema: EXECUTOR_RESPONSE_SCHEMA
};
