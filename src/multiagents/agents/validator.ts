import { VALIDATOR_SYSTEM_PROMPT } from '../prompts/validator';
import { 
  mapChatHistoryToMessages,
  addTabContext,
  processStreaming,
  createGroqCompletion,
  streamUserDescription,
  type StreamingCallback
} from '../shared';
import type { Tab, ChatMessage } from '../../types/hooks';
import type { Plan, ValidatorResponse } from '../types/agent';

export async function getValidatorResponse(
  plan: Plan,
  chatHistory: ChatMessage[] = [],
  selectedTabs: Tab[] = [],
  currentActiveTab: Tab | null = null,
  showCurrentTabIndicator: boolean = true,
  onChunk?: StreamingCallback
): Promise<ValidatorResponse> {
  try {
    const messages = mapChatHistoryToMessages(chatHistory);
    const enhancedMessages = await addTabContext(messages, selectedTabs, currentActiveTab, showCurrentTabIndicator);
    
    // Extraer el step actual del plan (el que está in_progress)
    const currentStep = plan.steps.find(step => step.status === 'in_progress');
    const completedSteps = plan.steps.filter(step => step.status === 'done');
    const pendingSteps = plan.steps.filter(step => step.status === 'pending');
    
    // Parsear información relevante del step actual
    const stepToolCalls = plan.toolCallHistory.filter(tc => tc.stepId === currentStep?.id);
    const lastToolCall = stepToolCalls[stepToolCalls.length - 1];
    const toolHistory = stepToolCalls.map(toolCall => ({
      toolName: toolCall.toolCall.function.name,
      reason: toolCall.reason,
      result: toolCall.result.success,
      content: toolCall.result.content
    }));
    
    const stepProgress = currentStep ? {
      stepId: currentStep.id,
      stepTitle: currentStep.title,
      stepDescription: currentStep.description,
      status: currentStep.status,
      toolsUsed: stepToolCalls.length,
      toolHistory: toolHistory,
      lastToolUsed: lastToolCall?.toolCall?.function?.name,
      lastToolResult: lastToolCall?.result?.success,
    } : null;
    
    const contextMessage = `
PLAN OVERVIEW:
- Plan ID: ${plan.id}
- Plan Status: ${plan.status}
- Plan Title: ${plan.title}
- Needs Browser Control: ${plan.needsBrowserControl}
- Total Steps: ${plan.steps.length}
- Completed Steps: ${completedSteps.length}
- In Progress: ${currentStep ? 1 : 0}
- Pending Steps: ${pendingSteps.length}

CURRENT STEP DETAILS:
${stepProgress ? JSON.stringify(stepProgress, null, 2) : 'No step in progress'}

COMPLETED STEPS SUMMARY:
${completedSteps.map(step => {
  const stepTools = plan.toolCallHistory.filter(tc => tc.stepId === step.id);
  const toolSummary = stepTools.map(tool => 
    `  • ${tool.toolCall.function.name}: ${tool.reason} (${tool.result.success ? 'success' : 'failed'})`
  ).join('\n');
  return `- ${step.title} (${stepTools.length} tools used)\n${toolSummary}`;
}).join('\n')}

PENDING STEPS:
${pendingSteps.map(step => `- ${step.title}`).join('\n')}
`;
    console.log('contextMessage in validator', contextMessage);
    const completion = await createGroqCompletion(
      [
        { role: "system", content: VALIDATOR_SYSTEM_PROMPT },
        { role: "user", content: contextMessage },
        ...enhancedMessages
      ],
      []
    );
    
    // FASE 1: Recibir JSON completo sin streaming
    const { fullResponse } = await processStreaming(completion, undefined);
    console.log('fullResponse validator', fullResponse);
    
    // Parsear la respuesta para extraer userDescription
    const parsedResponse = parseValidatorResponse(fullResponse);
    
    // FASE 2: Hacer streaming del userDescription si hay callback y es plan_completed
    if (onChunk && parsedResponse.userDescription && parsedResponse.type === 'plan_completed') {
      console.log('🎬 Starting streaming of validator userDescription:', parsedResponse.userDescription);
      await streamUserDescription(parsedResponse.userDescription, onChunk);
      console.log('✅ Finished streaming validator userDescription');
    }
    
    return parsedResponse;
  } catch (error) {
    return {
      type: 'step_in_progress',
      feedback: 'Unable to validate step completion',
      userDescription: 'I encountered an error validating the step. Please try again.'
    };
  }
}

function parseValidatorResponse(response: string): ValidatorResponse {
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn('⚠️ No JSON found in validator response:', response.substring(0, 200));
      throw new Error('No JSON found in response');
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    if (parsed.type === 'step_completed' || parsed.type === 'step_in_progress' || parsed.type === 'plan_completed') {
      console.log('✅ Validator response:', parsed);
      return {
        type: parsed.type,
        stepId: parsed.stepId,
        feedback: parsed.feedback,
        updatedPlan: parsed.updatedPlan,
        userDescription: parsed.userDescription
      };
    }
    
    console.warn('⚠️ Invalid response format in validator:', parsed);
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('❌ Error parsing validator response:', error);
    console.error('📝 Raw response:', response.substring(0, 500));
    
    return {
      type: 'step_in_progress',
      feedback: 'Unable to validate step completion',
      userDescription: 'I encountered an error validating the step. Please try again.'
    };
  }
}
