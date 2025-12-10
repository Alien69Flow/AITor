export type Role = 'user' | 'model';

export enum ModelId {
  GEMINI = 'gemini',
  DEEPSEEK = 'deepseek',
  GPT = 'gpt',
  GROK = 'grok',
  ALIENFLOW = 'alienflow'
}

export interface Attachment {
  mimeType: string;
  data: string; // Base64
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