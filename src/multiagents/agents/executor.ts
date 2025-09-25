import { EXECUTOR_SYSTEM_PROMPT } from '../prompts/executor';
import { 
  mapChatHistoryToMessages,
  getUnifiedTabs,
  addTabContext,
  processStreaming,
  createGroqCompletion,
  streamUserDescription,
  type StreamingCallback
} from '../shared';
import { getAvailableTools } from '../tools/index';
import type { Tab, ChatMessage } from '../../types/hooks';
import type { Plan, PlanStep, ExecutorResponse } from '../types/agent';

export async function getExecutorResponse(
  plan: Plan,
  currentStep: PlanStep,
  chatHistory: ChatMessage[],
  selectedTabs: Tab[],
  currentActiveTab: Tab | null,
  showCurrentTabIndicator: boolean,
  onChunk?: StreamingCallback,
  validatorFeedback?: string
): Promise<ExecutorResponse> {
  try {
    const messages = mapChatHistoryToMessages(chatHistory);
    const allAvailableTabs = getUnifiedTabs(selectedTabs, currentActiveTab, showCurrentTabIndicator);
    const enhancedMessages = await addTabContext(messages, selectedTabs, currentActiveTab, showCurrentTabIndicator);    
    const availableTools = getAvailableTools(allAvailableTabs, 'agent');
    
    const contextMessage = `
Current plan:
${JSON.stringify(plan, null, 2)}

Current step to complete:
${JSON.stringify(currentStep, null, 2)}

${validatorFeedback ? `Validator feedback: ${validatorFeedback}` : ''}
`;
    console.log('enhancedMessages in executor', enhancedMessages);
    console.log('contextMessage in executor', contextMessage);
    const completion = await createGroqCompletion(
      [
        { role: "system", content: EXECUTOR_SYSTEM_PROMPT },
        { role: "user", content: contextMessage },
        ...enhancedMessages
      ],
      availableTools
    );
    
    // FASE 1: Recibir JSON completo sin streaming
    const { fullResponse, toolCalls } = await processStreaming(completion, undefined);
    console.log('fullResponse', fullResponse);
    console.log('toolCalls from executor', toolCalls);
    
    if (toolCalls && toolCalls.length > 0) {
      // FASE 2: Hacer streaming del userDescription de la herramienta si hay callback
      if (onChunk) {
        const toolCall = toolCalls[0];
        const toolUserDescription = extractUserDescriptionFromToolCall(toolCall);
        
        if (toolUserDescription) {
          await streamUserDescription(toolUserDescription, onChunk);
        }
      }
      
      return {
        type: 'tool_call',
        toolCall: toolCalls[0],
        reason: extractReasonFromToolCall(toolCalls[0]),
        content: fullResponse
      };
    }
    
    // Si no hay tool calls, significa que el executor no pudo determinar qué herramienta usar
    return {
      type: 'no_tool_call',
      content: 'I was unable to determine which tool to use for this step. Please provide more specific instructions.'
    };
  } catch (error) {
    return {
      type: 'no_tool_call',
      content: 'I encountered an error processing the request. Please provide more information.'
    };
  }
}

function extractReasonFromToolCall(toolCall: any): string {
  try {
    const args = JSON.parse(toolCall.function.arguments);
    return args.reason || 'No reason provided';
  } catch {
    return 'No reason provided';
  }
}

function extractUserDescriptionFromToolCall(toolCall: any): string | null {
  try {
    const args = JSON.parse(toolCall.function.arguments);
    return args.userDescription || null;
  } catch {
    return null;
  }
}

