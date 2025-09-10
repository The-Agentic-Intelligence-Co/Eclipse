import agentIcon from '../side-panel/assets/icons/agent-mode-icon-2.svg';
import askIcon from '../side-panel/assets/icons/ask-icon.svg';
import submitIcon from '../side-panel/assets/icons/submit-btn-icon.svg';
import checkmarkIcon from '../side-panel/assets/icons/checkmark.svg';
import tabIcon from '../side-panel/assets/icons/tab.svg';
import selectTabsIcon from '../side-panel/assets/icons/select-tabs-icon.svg';
import deleteIcon from '../side-panel/assets/icons/delete.svg';

export interface Mode {
  value: 'agent' | 'ask';
  label: string;
  icon: string;
}

export interface ContextOption {
  value: 'current-tab' | 'select-tab';
  label: string;
  icon: string;
}

export interface Icons {
  submit: string;
  checkmark: string;
  tab: string;
  delete: string;
}

export interface TabLimits {
  MAX_SELECTIONS: number;
  TITLE_MAX_LENGTH: number;
  TITLE_SHORT_MAX_LENGTH: number;
}

export const MODES: Mode[] = [
  { value: 'agent', label: 'Agent', icon: agentIcon },
  { value: 'ask', label: 'Ask', icon: askIcon }
];

export const CONTEXT_OPTIONS: ContextOption[] = [
  { value: 'current-tab', label: 'Current Tab Content', icon: tabIcon },
  { value: 'select-tab', label: 'Select Tab', icon: selectTabsIcon }
];

export const ICONS: Icons = {
  submit: submitIcon,
  checkmark: checkmarkIcon,
  tab: tabIcon,
  delete: deleteIcon
};

export const TAB_LIMITS: TabLimits = {
  MAX_SELECTIONS: 5,
  TITLE_MAX_LENGTH: 25,
  TITLE_SHORT_MAX_LENGTH: 15
};
