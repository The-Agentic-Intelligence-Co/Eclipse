import Groq from "groq-sdk";
import { GENERAL_SYSTEM_PROMPT } from "../prompts/systemPrompts";
import { CONFIG } from "../config.js";
import { 
  getAvailableTools, 
  executeMultipleTools, 
  convertToolResultsToMessages 
} from "../tools/index.js";

// ⚠️ ADVERTENCIA DE SEGURIDAD: Esta opción expone la API key en el navegador
// En producción, considera usar un backend proxy para mayor seguridad
const groq = new Groq({
  apiKey: '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',
  dangerouslyAllowBrowser: true
});

/**
 * Función principal para obtener respuesta de la IA
 * @param {string} userMessage - Mensaje del usuario
 * @param {Array} chatHistory - Historial completo de la conversación
 * @param {Function} onChunk - Callback para manejar chunks del streaming
 * @param {Array} selectedTabs - Pestañas seleccionadas para contexto
 * @returns {Promise<string>} Respuesta de la IA
 */
export async function getAIResponse(userMessage, chatHistory = [], onChunk, selectedTabs = [], currentActiveTab = null, showCurrentTabIndicator = true) {
  try {
    // Convertir el historial del chat al formato que espera Groq
    // chatHistory ya incluye el mensaje actual del usuario
    const messages = chatHistory.map(msg => ({
      role: msg.type === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));
    
    // Construir mensaje del sistema usando el prompt importado
    const systemMessage = GENERAL_SYSTEM_PROMPT;
    
    // Si hay pestañas seleccionadas o pestaña activa (solo si está habilitada), agregar contexto básico
    let enhancedMessages = [...messages];
    if ((selectedTabs && selectedTabs.length > 0) || (currentActiveTab && showCurrentTabIndicator)) {
      let contextParts = [];
      
      // Agregar pestañas seleccionadas si existen (solo metadatos, no contenido)
      if (selectedTabs && selectedTabs.length > 0) {
        const tabsContext = selectedTabs.map(tab => 
          `- **${tab.title}** (${tab.url})`
        ).join('\n');
        contextParts.push(`**Selected tabs:**\n${tabsContext}`);
      }
      
      // Agregar pestaña activa solo si está habilitada
      if (currentActiveTab && showCurrentTabIndicator) {
        contextParts.push(`**Current active tab:**\n- **${currentActiveTab.title}** (${currentActiveTab.url})`);
      }
      
      // Combinar todo el contexto
      const fullContext = contextParts.join('\n\n');
      
      // Agregar contexto al primer mensaje del usuario
      if (enhancedMessages.length > 0) {
        enhancedMessages[0] = {
          ...enhancedMessages[0],
          content: `${enhancedMessages[0].content}\n\n**Context from browser tabs:**\n${fullContext}`
        };
      }
    }

    
    // Crear array unificado de pestañas que incluya tanto selectedTabs como currentActiveTab
    let allAvailableTabs = [...selectedTabs];
    if (currentActiveTab && showCurrentTabIndicator) {
      // Verificar que la pestaña activa no esté ya en selectedTabs
      const isAlreadySelected = selectedTabs.some(tab => tab.id === currentActiveTab.id);
      if (!isAlreadySelected) {
        allAvailableTabs.push(currentActiveTab);
      }
    }

    console.log("allAvailableTabs", allAvailableTabs);
    
    // Obtener las tools disponibles para la IA usando todas las pestañas disponibles
    const availableTools = getAvailableTools(allAvailableTabs);

    // Preparar mensajes para enviar a Groq

    
    const completion = await groq.chat.completions.create({
      model: CONFIG.MODEL,
      messages: [
        {
          role: "system",
          content: systemMessage
        },
        ...enhancedMessages
      ],
      tools: availableTools,
      tool_choice: "auto", // La IA decide si usar tools o no
      stream: true,
      max_completion_tokens: CONFIG.MAX_COMPLETION_TOKENS,
      reasoning_effort: CONFIG.REASONING_EFFORT,
      temperature: CONFIG.TEMPERATURE,
    });

    
    let fullResponse = '';
    let isFirstChunk = true;
    let toolCalls = [];
    console.log("toolCalls", toolCalls);
    
    // Procesar el streaming
    for await (const chunk of completion) {
      const delta = chunk.choices[0]?.delta;
      
      // Manejar contenido de texto
      if (delta?.content) {
        fullResponse += delta.content;
        // Llamar al callback con cada chunk para actualización en tiempo real
        if (onChunk) {
          onChunk(delta.content, fullResponse, isFirstChunk);
          isFirstChunk = false;
        }
      }
      
      // Manejar tool calls
      if (delta?.tool_calls) {
        for (const toolCall of delta.tool_calls) {
          if (toolCall.function) {
            // Encontrar o crear la tool call
            let existingToolCall = toolCalls.find(tc => tc.id === toolCall.id);
            if (!existingToolCall) {
              existingToolCall = {
                id: toolCall.id,
                type: 'function',
                function: {
                  name: toolCall.function.name || '',
                  arguments: toolCall.function.arguments || ''
                }
              };
              toolCalls.push(existingToolCall);
            } else {
              // Actualizar argumentos existentes
              if (toolCall.function.arguments) {
                existingToolCall.function.arguments += toolCall.function.arguments;
              }
            }
          }
        }
      }
    }
    
    // Si hay tool calls, ejecutarlas y obtener la respuesta final
    if (toolCalls.length > 0) {
      
      try {
        // Ejecutar todas las tools usando el gestor con las pestañas unificadas
        const toolResults = await executeMultipleTools(toolCalls, allAvailableTabs);
        // Agregar mensaje del asistente con las tool_calls detectadas (requerido por Groq)
        const assistantToolCallMessage = {
          role: 'assistant',
          content: '',
          tool_calls: toolCalls.map(tc => ({
            id: tc.id,
            type: 'function',
            function: {
              name: tc.function.name,
              arguments: tc.function.arguments
            }
          }))
        };
        enhancedMessages.push(assistantToolCallMessage);
        // Convertir resultados a mensajes para Groq (cada uno debe incluir name y tool_call_id)
        const toolMessages = convertToolResultsToMessages(toolResults);
        
        // Agregar mensajes de tools al contexto
        enhancedMessages.push(...toolMessages);
        
        // Hacer una segunda llamada a Groq con los resultados de las tools
        const finalCompletion = await groq.chat.completions.create({
          model: CONFIG.MODEL,
          messages: [
            {
              role: "system",
              content: systemMessage
            },
            ...enhancedMessages
          ],
          stream: true,
          max_completion_tokens: CONFIG.MAX_COMPLETION_TOKENS,
          reasoning_effort: CONFIG.REASONING_EFFORT,
          temperature: CONFIG.TEMPERATURE,
        });

        // Procesar la respuesta final
        let finalResponse = '';
        let finalIsFirstChunk = true;
        console.log("finalResponse", finalResponse);
        

        for await (const chunk of finalCompletion) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            finalResponse += content;
            if (onChunk) {
              onChunk(content, finalResponse, finalIsFirstChunk);
              finalIsFirstChunk = false;
            }
          }
        }

        return finalResponse;
        
      } catch (error) {
        console.error('Error al ejecutar tools o segunda llamada:', error);
        
        // Si fallan las tools, retornar respuesta de error pero no romper todo
        return `Lo siento, hubo un error al procesar tu consulta con las herramientas disponibles. Por favor, intenta de nuevo o reformula tu pregunta. Error: ${error.message}`;
      }
    }
    

    return fullResponse;
  } catch (error) {
    console.error('Error al obtener respuesta de la IA:', error);
    return "Lo siento, hubo un error al procesar tu consulta. Por favor, intenta de nuevo.";
  }
}

