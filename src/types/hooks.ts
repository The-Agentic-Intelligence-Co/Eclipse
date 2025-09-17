/**
 * Tipos para los hooks de la aplicación
 */

// Tipos para pestañas
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

// Tipos para mensajes del chat
export interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
}

// Tipos para callbacks de streaming
export interface StreamingCallbacks {
  startTyping?: () => void;
  stopTyping?: () => void;
  startStreaming?: () => void;
  stopStreaming?: () => void;
  handleStreamingChunk?: (chunk: string, fullResponse: string, isFirstChunk: boolean, onFirstChunk?: () => void) => void;
}

// Tipos para callbacks de mensajes
export interface MessageCallbacks {
  addUserMessage: (content: string) => ChatMessage[];
  addAIResponse: (content: string) => void;
  addErrorMessage: (errorMessage?: string) => void;
  updateMessage: (messageId: string, newContent: string) => void;
  removeMessagesAfter: (messageId: string) => void;
  startTyping: () => void;
  stopTyping: () => void;
}

// Tipos para el hook de gestión de pestañas
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

// Tipos para el hook de streaming
export interface UseStreamingReturn {
  streamingMessage: string;
  streamingHtml: string;
  isStreaming: boolean;
  startStreaming: () => void;
  stopStreaming: () => void;
  handleStreamingChunk: (chunk: string, fullResponse: string, isFirstChunk: boolean, onFirstChunk?: () => void) => void;
}

// Tipos para el hook de indicadores de pestañas
export interface UseTabIndicatorsReturn {
  hoveredIndicator: string | null;
  setHoveredIndicator: (indicator: string | null) => void;
}

// Tipos para el hook de gestión de dropdowns
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

// Tipos para el hook de mensajes de bienvenida
export interface UseWelcomeMessagesReturn {
  currentWelcomeMessage: string;
  hasWelcomeMessages: boolean;
}

// Tipos para el hook de estado del footer
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

// Tipos para el hook de mensajes del chat
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

// Tipos para el hook de edición de mensajes
export interface UseMessageEditingReturn {
  editingMessageId: string | null;
  editingContent: string;
  startEdit: (messageId: string, content: string) => string;
  cancelEdit: () => void;
  updateEditingContent: (content: string) => void;
}

// Tipos para el hook de gestión del chat
export interface UseChatManagementReturn {
  handleUserMessage: (userMessage: string, mode: string, onChatStart?: () => void) => Promise<void>;
  handleConfirmEdit: (messageId: string, newContent: string, messages: ChatMessage[], onEditComplete?: () => void) => Promise<void>;
}

// Tipos para eventos de mensajes
export interface UserMessageEvent extends CustomEvent {
  detail: {
    message: string;
    mode: string;
  };
}

// Tipos para componentes React
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