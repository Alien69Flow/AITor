export type Role = 'user' | 'model';

export enum ModelId {
  GEMINI = 'gemini',
  DEEPSEEK = 'deepseek',
  GPT = 'gpt',
  GROK = 'grok',
  ALIENFLOW = 'alienflow'
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Attachment {
  mimeType: string;
  data: string; // Base64
}

export interface MessageAction {
  label: string;
  subLabel?: string;
  type: 'select-model' | 'system-details';
  payload: ModelId | string;
  icon?: string;
}

export interface ChatMessage {
  id: string;
  role: Role;
  text: string;
  timestamp: number;
  modelUsed?: ModelId; // To track which personality answered
  isThinking?: boolean; // For deepseek visualization
  thoughtProcess?: string; // Content of the thinking block
  attachments?: Attachment[]; // For images/files
  actions?: MessageAction[]; // For interactive buttons
}

export interface ModelConfig {
  id: ModelId;
  name: string;
  description: string;
  baseModel: string; // The actual Gemini model string to use
  systemInstruction: string;
  themeColor: string;
  icon: string;
  useThinking?: boolean;
  isComingSoon?: boolean; // New flag to disable models that lack specific APIs
  tools?: {
    googleSearch?: boolean;
    googleMaps?: boolean;
  };
}