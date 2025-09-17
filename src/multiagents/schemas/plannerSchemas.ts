/**
 * Esquemas JSON para el Planner Agent
 */

export const PLANNER_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    type: {
      type: "string",
      enum: ["direct_response", "plan"]
    },
    userDescription: {
      type: "string",
      description: "Descripción de lo que se va a hacer para el usuario"
    },
    plan: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "Identificador único del plan"
        },
        status: {
          type: "string",
          enum: ["draft", "executing", "completed", "error", "paused"]
        },
        title: {
          type: "string",
          description: "Título descriptivo del plan"
        },
        description: {
          type: "string",
          description: "Descripción detallada del plan"
        },
        steps: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: {
                type: "string",
                description: "Identificador único del step"
              },
              title: {
                type: "string",
                description: "Título del step"
              },
              description: {
                type: "string",
                description: "Descripción detallada del step"
              },
              status: {
                type: "string",
                enum: ["pending", "in_progress", "done", "error"]
              },
              order: {
                type: "number",
                description: "Orden de ejecución del step"
              }
            },
            required: ["id", "title", "description", "status", "order"],
            additionalProperties: false
          }
        }
      },
      required: ["id", "status", "title", "steps"],
      additionalProperties: false
    }
  },
  required: ["type", "userDescription"],
  additionalProperties: false
};

export const PLANNER_JSON_SCHEMA_CONFIG = {
  name: "planner_response",
  schema: PLANNER_RESPONSE_SCHEMA
};
