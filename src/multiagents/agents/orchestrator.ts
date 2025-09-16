import { getPlannerResponse } from './planner';
import { getExecutorResponse } from './executor';
import { getValidatorResponse } from './validator';
import { executeTool } from '../tools/index';
import { handleAIError, getUnifiedTabs } from '../shared';
import type { Tab, ChatMessage } from '../../types/hooks';
import type { Plan, ToolCallHistory } from '../types/plan';
import type { StreamingCallback } from '../shared';

export async function getAgentResponse(
  userMessage: string,
  chatHistory: ChatMessage[] = [],
  selectedTabs: Tab[] = [],
  currentActiveTab: Tab | null = null,
  showCurrentTabIndicator: boolean = true,
  onChunk?: StreamingCallback
): Promise<string> {
  try {
    const allAvailableTabs = getUnifiedTabs(selectedTabs, currentActiveTab, showCurrentTabIndicator);
    
    const plannerResponse = await getPlannerResponse(
      userMessage,
      chatHistory,
      selectedTabs,
      currentActiveTab,
      showCurrentTabIndicator,
      onChunk
    );
    
    if (plannerResponse.type === 'direct_response') {
      return plannerResponse.content;
    }
    
    const plan = plannerResponse.plan!;
        
    return await executePlanWithValidation(
      plan,
      chatHistory,
      selectedTabs,
      currentActiveTab,
      showCurrentTabIndicator,
      onChunk,
      allAvailableTabs
    );
    
  } catch (error) {
    return handleAIError(error, 'Agent Mode');
  }
}

async function executePlanWithValidation(
  plan: Plan,
  chatHistory: ChatMessage[],
  selectedTabs: Tab[],
  currentActiveTab: Tab | null,
  showCurrentTabIndicator: boolean,
  onChunk?: StreamingCallback,
  allAvailableTabs?: Tab[]
): Promise<string> {
  const MAX_ITERATIONS = 20;
  let currentStepIndex = 0;
  let lastValidatorFeedback: string | undefined;
  
  plan.status = 'executing';
  
  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const currentStep = plan.steps[currentStepIndex];
    console.log('currentStep', currentStepIndex);
    
    if (!currentStep) {
      plan.status = 'completed';
      return createPlanCompletionResponse(plan);
    }
    
    if (currentStep.status === 'done') {
      currentStepIndex++;
      lastValidatorFeedback = undefined;
      continue;
    }
    
    currentStep.status = 'in_progress';
    
    const executorResponse = await getExecutorResponse(
      plan,
      currentStep,
      chatHistory,
      selectedTabs,
      currentActiveTab,
      showCurrentTabIndicator,
      onChunk,
      lastValidatorFeedback
    );
    
    if (executorResponse.type === 'human_request') {
      plan.status = 'paused';
      return createPauseResponse(plan, executorResponse.humanRequest!);
    }
    
    let toolResult;
    if (executorResponse.type === 'tool_call') {
      console.log('executorResponse.toolCall', executorResponse.toolCall);
      console.log('selectedTabs in executePlanWithValidation R', selectedTabs);
      toolResult = await executeTool(
        executorResponse.toolCall!,
        allAvailableTabs,
        'agent'
      );
      console.log('toolResult', toolResult);
      const toolCallHistory: ToolCallHistory = {
        id: generateId(),
        toolCall: executorResponse.toolCall!,
        reason: executorResponse.reason || 'No reason provided',
        result: toolResult,
        timestamp: new Date(),
        stepId: currentStep.id
      };
      console.log('Tool use registered: ', toolCallHistory);
      console.log('Full toolCallHistory: ', plan.toolCallHistory);
      plan.toolCallHistory.push(toolCallHistory);
    }
    
    const validatorResponse = await getValidatorResponse(
      plan,
      chatHistory,
      selectedTabs,
      currentActiveTab,
      showCurrentTabIndicator,
      onChunk
    );
    console.log('validatorResponse', validatorResponse);
    if (validatorResponse.updatedPlan) {
      console.log('plan before update', plan);
      console.log('validatorResponse.updatedPlan before update', validatorResponse.updatedPlan);
      
      const updatedPlan = validatorResponse.updatedPlan;
      
      // Actualizar propiedades no-array directamente
      Object.keys(updatedPlan).forEach(key => {
        const value = updatedPlan[key as keyof typeof updatedPlan];
        if (value !== undefined && key !== 'steps') {
          (plan as any)[key] = value;
        }
      });
      
      // Manejar steps específicos que han cambiado
      if (updatedPlan.steps) {
        const updatedSteps = updatedPlan.steps;
        updatedSteps.forEach((updatedStep: any) => {
          if (updatedStep && updatedStep.id) {
            const stepIndex = plan.steps.findIndex((step: any) => step.id === updatedStep.id);
            if (stepIndex !== -1) {
              // Actualizar step existente
              plan.steps[stepIndex] = { ...plan.steps[stepIndex], ...updatedStep };
            }
          }
        });
      }
      console.log('plan after update', plan);
      console.log('validatorResponse.updatedPlan after update', validatorResponse.updatedPlan);
    }

    // Store feedback for next iteration
    lastValidatorFeedback = validatorResponse.feedback;
    console.log('lastValidatorFeedback', lastValidatorFeedback);
    if (validatorResponse.type === 'step_completed') {
      currentStepIndex++;
      lastValidatorFeedback = undefined;
    } else if (validatorResponse.type === 'plan_completed') {
      plan.status = 'completed';
      return createPlanCompletionResponse(plan);
    }
  }
  console.log('plan', plan);
  plan.status = 'error';
  return createErrorResponse(plan, 'Maximum steps reached');
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

function createPlanCompletionResponse(plan: Plan): string {
  const completedSteps = plan.steps.filter(step => step.status === 'done').length;
  return `✅ Plan completed successfully!\n\n**${plan.title}**\n\nCompleted ${completedSteps} out of ${plan.steps.length} steps.\n\n${plan.description}`;
}

function createPauseResponse(plan: Plan, humanRequest: any): string {
  return `⏸️ Plan paused for user input.\n\n**${plan.title}**\n\n${humanRequest.message}\n\nPlease provide the requested information to continue.`;
}

function createErrorResponse(plan: Plan, error: string): string {
  return `❌ Plan failed: ${error}\n\n**${plan.title}**\n\n${plan.description}`;
}
