import { PLANNER_SYSTEM_PROMPT } from '../prompts/planner';
import { 
  mapChatHistoryToMessages,
  addTabContext,
  createGroqCompletion,
  type StreamingCallback,
  processStreaming
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
    
    const { fullResponse } = await processStreaming(completion, onChunk);
    console.log('fullResponse', fullResponse);
    
    return parsePlannerResponse(fullResponse);
  } catch (error) {
    return {
      type: 'direct_response',
      content: 'I apologize, but I encountered an error processing your request. Please try again.'
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
      return {
        type: 'direct_response',
        content: parsed.content
      };
    }
    
    if (parsed.type === 'plan' && parsed.plan) {
      console.log('✅ Planner created plan:', parsed);
      return {
        type: 'plan',
        content: parsed.content,
        plan: {
          ...parsed.plan,
          toolCallHistory: [], // Inicializar historial de herramientas
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
      content: 'I apologize, but I encountered an error processing your request. Please try again.'
    };
  }
}
