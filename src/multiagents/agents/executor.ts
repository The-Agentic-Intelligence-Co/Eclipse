import { EXECUTOR_SYSTEM_PROMPT } from '../prompts/executor';
import { 
  mapChatHistoryToMessages,
  getUnifiedTabs,
  addTabContext,
  processStreaming,
  createGroqCompletion,
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
    const enhancedMessages = addTabContext(messages, selectedTabs, currentActiveTab, showCurrentTabIndicator);
    
    const availableTools = getAvailableTools(allAvailableTabs, 'agent');
    const toolsList = availableTools.map((t: any) => t.function.name).join(', ');
    
    const executorPrompt = EXECUTOR_SYSTEM_PROMPT.replace('{tools}', toolsList);
    
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
        { role: "system", content: executorPrompt },
        { role: "user", content: contextMessage },
        ...enhancedMessages
      ],
      availableTools
    );
    
    const { fullResponse, toolCalls } = await processStreaming(completion, onChunk);
    console.log('fullResponse', fullResponse);
    console.log('toolCalls jiji', toolCalls);
    
    if (toolCalls && toolCalls.length > 0) {
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

