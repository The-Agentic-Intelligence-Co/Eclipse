// Types for application hooks

// Types for tabs
export interface Tab {
  id: number;
  title: string;
  url: string;
  favIconUrl?: string;
  active?: boolean;
  windowId?: number;
  index?: number;
  pinned?: boolean;
  audible?: boolean;
  discarded?: boolean;
  autoDiscardable?: boolean;
  groupId?: number;
  status?: 'loading' | 'complete';
}

// Types for chat messages
export interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
}

// Types for streaming callbacks
export interface StreamingCallbacks {
  startTyping?: () => void;
  stopTyping?: () => void;
  startStreaming?: () => void;
  stopStreaming?: () => void;
  handleStreamingChunk?: (chunk: string, fullResponse: string, isFirstChunk: boolean, onFirstChunk?: () => void) => void;
}

// Types for message callbacks
export interface MessageCallbacks {
  addUserMessage: (content: string) => ChatMessage[];
  addAIResponse: (content: string) => void;
  addErrorMessage: (errorMessage?: string) => void;
  updateMessage: (messageId: string, newContent: string) => void;
  removeMessagesAfter: (messageId: string) => void;
  startTyping: () => void;
  stopTyping: () => void;
}

// Types for tab management hook
export interface UseTabManagementReturn {
  tabs: Tab[];
  selectedTabs: Tab[];
  showCurrentTabIndicator: boolean;
  currentActiveTab: Tab | null;
  addTab: (tab: Tab) => boolean;
  removeTab: (tabId: number) => void;
  toggleCurrentTab: () => boolean;
  removeCurrentTab: () => void;
  totalSelected: number;
  maxLimit: number;
}

// Types for streaming hook
export interface UseStreamingReturn {
  streamingMessage: string;
  streamingHtml: string;
  isStreaming: boolean;
  startStreaming: () => void;
  stopStreaming: () => void;
  handleStreamingChunk: (chunk: string, fullResponse: string, isFirstChunk: boolean, onFirstChunk?: () => void) => void;
}

// Types for tab indicators hook
export interface UseTabIndicatorsReturn {
  hoveredIndicator: string | null;
  setHoveredIndicator: (indicator: string | null) => void;
}

// Types for dropdown management hook
export interface UseDropdownManagementReturn {
  isContextDropdownOpen: boolean;
  isModeDropdownOpen: boolean;
  showTabSelection: boolean;
  toggleContextDropdown: () => void;
  toggleModeDropdown: () => void;
  showTabSelectionMode: () => void;
  hideTabSelectionMode: () => void;
  closeAllDropdowns: () => void;
}

// Types for welcome messages hook
export interface UseWelcomeMessagesReturn {
  currentWelcomeMessage: string;
  hasWelcomeMessages: boolean;
}

// Types for footer state hook
export interface UseFooterStateReturn {
  selectedMode: string;
  content: string;
  isFocused: boolean;
  handleInput: (e: React.FormEvent<HTMLDivElement>) => void;
  handleFocus: (focused: boolean) => void;
  clearContent: () => void;
  hasContent: () => boolean;
  changeMode: (mode: string) => void;
}

// Types for chat messages hook
export interface UseChatMessagesReturn {
  messages: ChatMessage[];
  isTyping: boolean;
  addUserMessage: (content: string) => ChatMessage[];
  addAIResponse: (content: string) => void;
  addErrorMessage: (errorMessage?: string) => void;
  updateMessage: (messageId: string, newContent: string) => void;
  removeMessagesAfter: (messageId: string) => void;
  startTyping: () => void;
  stopTyping: () => void;
}

// Types for message editing hook
export interface UseMessageEditingReturn {
  editingMessageId: string | null;
  editingContent: string;
  startEdit: (messageId: string, content: string) => string;
  cancelEdit: () => void;
  updateEditingContent: (content: string) => void;
}

// Types for chat management hook
export interface UseChatManagementReturn {
  handleUserMessage: (userMessage: string, mode: string, onChatStart?: () => void) => Promise<void>;
  handleConfirmEdit: (messageId: string, newContent: string, messages: ChatMessage[], onEditComplete?: () => void) => Promise<void>;
}

// Types for message events
export interface UserMessageEvent extends CustomEvent {
  detail: {
    message: string;
    mode: string;
  };
}

// Types for React components
export interface AppProps {}

export interface HeaderProps {
  hasStartedChat: boolean;
}

export interface ContentProps {
  selectedTabs: Tab[];
  tabs: Tab[];
  showCurrentTabIndicator: boolean;
  currentActiveTab: Tab | null;
  addTab: (tab: Tab) => boolean;
  removeTab: (tabId: number) => void;
  toggleCurrentTab: () => boolean;
  removeCurrentTab: () => void;
  totalSelected: number;
  maxLimit: number;
  onChatStart: () => void;
}

export interface FooterProps {
  selectedTabs: Tab[];
  tabs: Tab[];
  showCurrentTabIndicator: boolean;
  currentActiveTab: Tab | null;
  addTab: (tab: Tab) => boolean;
  removeTab: (tabId: number) => void;
  toggleCurrentTab: () => boolean;
  removeCurrentTab: () => void;
  totalSelected: number;
  maxLimit: number;
}

export interface MessageItemProps {
  message: ChatMessage;
  isEditing: boolean;
  onStartEdit: (messageId: string, content: string) => string;
  onUpdateContent: (content: string) => void;
  onBlur: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  editRef: React.RefObject<HTMLSpanElement>;
}