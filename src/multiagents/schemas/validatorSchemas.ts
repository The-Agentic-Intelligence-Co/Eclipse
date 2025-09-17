/**
 * Esquemas JSON para el Validator Agent
 */

export const VALIDATOR_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    type: {
      type: "string",
      enum: ["step_completed", "step_in_progress", "plan_completed"]
    },
    stepId: {
      type: "string",
      description: "ID del step que se está validando"
    },
    feedback: {
      type: "string",
      description: "Feedback específico sobre el progreso del step"
    },
    updatedPlan: {
      type: "object",
      properties: {
        id: {
          type: "string"
        },
        status: {
          type: "string",
          enum: ["draft", "executing", "completed", "error", "paused"]
        },
        title: {
          type: "string"
        },
        description: {
          type: "string"
        },
        steps: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: {
                type: "string"
              },
              title: {
                type: "string"
              },
              description: {
                type: "string"
              },
              status: {
                type: "string",
                enum: ["pending", "in_progress", "done", "error"]
              },
              order: {
                type: "number"
              },
              toolCallHistory: {
                type: "array",
                items: {
                  type: "object"
                }
              }
            },
            required: ["id", "title", "description", "status", "order", "toolCallHistory"],
            additionalProperties: false
          }
        }
      },
      additionalProperties: false
    },
    userDescription: {
      type: "string",
      description: "Descripción de la respuesta final al usuario que cumple su consulta original usando los resultados de las herramientas ejecutadas (solo cuando type es 'plan_completed')"
    }
  },
  required: ["type", "userDescription"],
  additionalProperties: false
};

export const VALIDATOR_JSON_SCHEMA_CONFIG = {
  name: "validator_response",
  schema: VALIDATOR_RESPONSE_SCHEMA
};
