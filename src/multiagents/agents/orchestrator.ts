import { getPlannerResponse } from './planner';
import { getExecutorResponse } from './executor';
import { getValidatorResponse } from './validator';
import { executeTool } from '../tools/index';
import { handleAIError, getUnifiedTabs } from '../shared';
import { startGlowAnimation, stopGlowAnimationInAllTabs } from '../../utils/glowUtils';
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
      return plannerResponse.userDescription;
    }
    
    const plan = plannerResponse.plan!;
    
    // Start glow animation if plan needs browser control
    if (plan.needsBrowserControl) {
      console.log('[Orchestrator] Plan needs browser control, starting glow animation');
      if (currentActiveTab?.id) {
        await startGlowAnimation(currentActiveTab.id);
      }
    }
        
    try {
      return await executePlanWithValidation(
        plan,
        chatHistory,
        selectedTabs,
        currentActiveTab,
        showCurrentTabIndicator,
        onChunk,
        allAvailableTabs
      );
    } finally {
      // Stop glow animation when plan execution ends
      if (plan.needsBrowserControl) {
        console.log('[Orchestrator] Plan execution ended, stopping glow animation');
        await stopGlowAnimationInAllTabs();
      }
    }
    
  } catch (error) {
    // Stop glow animation on error
    try {
      await stopGlowAnimationInAllTabs();
    } catch (glowError) {
      console.error('[Orchestrator] Error stopping glow animation on error:', glowError);
    }
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
  const MAX_ITERATIONS = 12;
  let currentStepIndex = 0;
  let lastValidatorFeedback: string | undefined;
  
  plan.status = 'executing';
  
  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const currentStep = plan.steps[currentStepIndex];
    
    if (currentStep.status === 'done') {
      currentStepIndex++;
      // NO resetear lastValidatorFeedback aquí - mantenerlo para la siguiente iteración
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
    
    if (executorResponse.type === 'no_tool_call') {
      plan.status = 'paused';
      return createPauseResponse(plan, executorResponse.content);
    }
    
    let toolResult;
    if (executorResponse.type === 'tool_call') {
      toolResult = await executeTool(
        executorResponse.toolCall!,
        allAvailableTabs,
        'agent'
      );
      const toolCallHistory: ToolCallHistory = {
        id: generateId(),
        toolCall: executorResponse.toolCall!,
        reason: executorResponse.reason || 'No reason provided',
        result: toolResult,
        timestamp: new Date(),
        stepId: currentStep.id
      };
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
    if (validatorResponse.updatedPlan) {      
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
    }

    // Store feedback for next iteration
    lastValidatorFeedback = validatorResponse.feedback;
    if (validatorResponse.type === 'step_completed') {
      currentStepIndex++;
      // NO resetear aquí tampoco - mantener el feedback
    } else if (validatorResponse.type === 'plan_completed') {
      plan.status = 'completed';
      return validatorResponse.userDescription
    }
  }
  plan.status = 'error';
  return createErrorResponse(plan, 'Maximum steps reached');
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

function createPauseResponse(plan: Plan, message: string): string {
  return `⏸️ Plan paused.\n\n**${plan.title}**\n\n${message}`;
}

function createErrorResponse(plan: Plan, error: string): string {
  return `❌ Plan failed: ${error}\n\n**${plan.title}**\n\n${plan.description}`;
}
