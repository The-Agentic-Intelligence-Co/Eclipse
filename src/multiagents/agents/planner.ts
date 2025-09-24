import { PLANNER_SYSTEM_PROMPT } from '../prompts/planner';
import { 
  mapChatHistoryToMessages,
  addTabContext,
  createGroqCompletion,
  type StreamingCallback,
  processStreaming,
  streamUserDescription
} from '../shared';
import type { Tab, ChatMessage } from '../../types/hooks';
import type { PlannerResponse } from '../types/agent';

export async function getPlannerResponse(
  _userMessage: string,
  chatHistory: ChatMessage[] = [],
  selectedTabs: Tab[] = [],
  currentActiveTab: Tab | null = null,
  showCurrentTabIndicator: boolean = true,
  onChunk?: StreamingCallback
): Promise<PlannerResponse> {
  try {
    const messages = mapChatHistoryToMessages(chatHistory);
    const enhancedMessages = addTabContext(messages, selectedTabs, currentActiveTab, showCurrentTabIndicator);
    
    const completion = await createGroqCompletion(
      [{ role: "system", content: PLANNER_SYSTEM_PROMPT }, ...enhancedMessages],
      []
    );
    
    // FASE 1: Recibir JSON completo sin streaming
    const { fullResponse } = await processStreaming(completion, undefined);
    console.log('fullResponse', fullResponse);
    
    // Parsear la respuesta para extraer userDescription
    const parsedResponse = parsePlannerResponse(fullResponse);
    
    // FASE 2: Hacer streaming del userDescription si hay callback
    if (onChunk && parsedResponse.userDescription) {
      await streamUserDescription(parsedResponse.userDescription, onChunk);
    }
    
    return parsedResponse;
  } catch (error) {
    return {
      type: 'direct_response',
      userDescription: 'I apologize, but I encountered an error processing your request. Please try again.'
    };
  }
}

function parsePlannerResponse(response: string): PlannerResponse {
  try {
    // Try to find JSON in the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn('⚠️ No JSON found in planner response:', response.substring(0, 200));
      throw new Error('No JSON found in response');
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    if (parsed.type === 'direct_response') {
      console.log('✅ Planner direct response:', parsed);
      console.log('✅ Planner direct response userDescription:', parsed.userDescription);
      return {
        type: 'direct_response',
        userDescription: parsed.userDescription
      };
    }
    
    if (parsed.type === 'plan' && parsed.plan) {
      console.log('✅ Planner created plan:', parsed);
      console.log('✅ Planner created plan userDescription:', parsed.userDescription);
      return {
        type: 'plan',
        userDescription: parsed.userDescription,
        plan: {
          ...parsed.plan,
          toolCallHistory: [], // Inicializar historial de herramientas
          needsBrowserControl: parsed.plan.needsBrowserControl || false, // Usar el valor del prompt o false por defecto
          createdAt: new Date(),
          updatedAt: new Date()
        }
      };
    }
    
    console.warn('⚠️ Invalid response format in planner:', parsed);
    throw new Error('Invalid response format');
  
  } catch (error) {

    console.error('❌ Error parsing planner response:', error);
    console.error('📝 Raw response:', response.substring(0, 500));
    
    return {
      type: 'direct_response',
      userDescription: 'I apologize, but I encountered an error processing your request. Please try again.'
    };
  }
}
