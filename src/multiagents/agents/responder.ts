// This is the logic for Ask Mode
import { GENERAL_SYSTEM_PROMPT } from "../prompts/systemPrompts";
import { 
  getAvailableTools, 
  executeMultipleTools
} from "../tools/index";
import type { Tab, ToolCall, ToolResult } from "../tools/tabs/types";
import type { ChatMessage } from "../../types/hooks";
import {
  mapChatHistoryToMessages,
  getUnifiedTabs,
  addTabContext,
  processStreaming,
  createGroqCompletion,
  createAssistantMessageWithToolCalls,
  createToolMessages,
  streamToolDescriptions,
  handleAIError,
  type StreamingCallback,
  type GroqMessage
} from "../shared";

// Main function to get AI response
export async function getAIResponse(
  _userMessage: string, 
  chatHistory: ChatMessage[] = [], 
  onChunk?: StreamingCallback, 
  selectedTabs: Tab[] = [], 
  currentActiveTab: Tab | null = null, 
  showCurrentTabIndicator: boolean = true, 
  mode: 'ask' | 'agent' = 'agent'
): Promise<string> {
  try {
    // Prepare messages and context using shared utilities
    const messages = mapChatHistoryToMessages(chatHistory);
    const allAvailableTabs = getUnifiedTabs(selectedTabs, currentActiveTab, showCurrentTabIndicator);
    const enhancedMessages = await addTabContext(messages, selectedTabs, currentActiveTab, showCurrentTabIndicator);
    const availableTools = getAvailableTools(allAvailableTabs, mode);
    
    // First call to Groq using shared utility
    const completion = await createGroqCompletion(
      [{ role: "system", content: GENERAL_SYSTEM_PROMPT }, ...enhancedMessages], 
      availableTools
    );

    // Process streaming and tool calls using shared utility
    const { fullResponse, toolCalls, toolDescriptions } = await processStreaming(completion, onChunk);
    
    // If there are tool calls, execute them and make second call
    if (toolCalls.length > 0) {
      console.log('toolCalls in responder', toolCalls);
      return await handleToolCalls(toolCalls, enhancedMessages, allAvailableTabs, onChunk, toolDescriptions, mode);
    }

    return fullResponse;
  } catch (error) {
    return handleAIError(error, 'Ask Mode');
  }
}

// Helper functions specific to responder

async function handleToolCalls(
  toolCalls: ToolCall[], 
  enhancedMessages: Array<{ role: 'user' | 'assistant'; content: string }>, 
  allAvailableTabs: Tab[], 
  onChunk: StreamingCallback | undefined, 
  toolDescriptions: string[], 
  mode: 'ask' | 'agent'
): Promise<string> {
  try {
    // Stream descriptions using shared utility
    streamToolDescriptions(toolDescriptions, onChunk);
    
    const toolResults: ToolResult[] = await executeMultipleTools(toolCalls, allAvailableTabs, mode);
    
    // Add assistant message using shared utility
    const assistantMessage = createAssistantMessageWithToolCalls('', toolCalls);
    enhancedMessages.push(assistantMessage as any);
    
    // Add tool results using shared utility
    const toolMessages = createToolMessages(toolResults);
    enhancedMessages.push(...toolMessages as any);
    
    // Second call to Groq using shared utility
    const finalCompletion = await createGroqCompletion(
      [{ role: "system", content: GENERAL_SYSTEM_PROMPT }, ...enhancedMessages as GroqMessage[]], 
      []
    );

    // Process final response without including tool description
    let finalResponse = '';
    let finalIsFirstChunk = true;
    
    for await (const chunk of finalCompletion as any) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        finalResponse += content;
        // Stream only the final response
        onChunk?.(content, finalResponse, finalIsFirstChunk);
        finalIsFirstChunk = false;
      }
    }
    
    return finalResponse;
  } catch (error) {
    return handleAIError(error, 'tool execution');
  }
}
