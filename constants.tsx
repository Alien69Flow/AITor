import { ModelId, ModelConfig } from './types';

// Icons as React components for ease of use
export const Icons = {
  Gemini: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 22C12 22 20 18 20 12V6C20 6 12 2 12 2C12 2 4 6 4 6V12C4 18 12 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 2L12 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 12L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  DeepSeek: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  GPT: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 4L14.5 9.5L20 10L15.8 13.7L17 19.5L12 16.5L7 19.5L8.2 13.7L4 10L9.5 9.5L12 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Grok: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="20" height="20" rx="4" stroke="currentColor" strokeWidth="2"/>
      <path d="M8 8L16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16 8L8 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Send: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Trash: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 6V4C8 2.89543 8.89543 2 10 2H14C15.1046 2 16 2.89543 16 4V6M19 6V20C19 21.1046 18.1046 22 17 22H7C5.89543 22 5 21.1046 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
};

export const MODELS: Record<ModelId, ModelConfig> = {
  [ModelId.GEMINI]: {
    id: ModelId.GEMINI,
    name: 'Gemini',
    description: 'Balanced, multimodal, and fast.',
    baseModel: 'gemini-2.5-flash',
    systemInstruction: 'You are Gemini. Helpful, accurate, and versatile. Keep answers concise but informative.',
    themeColor: 'text-gemini',
    icon: 'Gemini'
  },
  [ModelId.DEEPSEEK]: {
    id: ModelId.DEEPSEEK,
    name: 'DeepSeek R1',
    description: 'Focuses on deep reasoning and logic.',
    baseModel: 'gemini-2.5-flash', // Using 2.5 flash with thinking budget to simulate R1
    useThinking: true,
    systemInstruction: 'You are DeepSeek. You prioritize extreme logical accuracy, step-by-step reasoning, and coding proficiency. Always think before answering.',
    themeColor: 'text-deepseek',
    icon: 'DeepSeek'
  },
  [ModelId.GPT]: {
    id: ModelId.GPT,
    name: 'GPT-4o',
    description: 'Sophisticated professional assistant.',
    baseModel: 'gemini-3-pro-preview', // Using the smartest model to emulate GPT-4
    systemInstruction: 'You are GPT-4o. You are professional, comprehensive, and articulate. You handle complex tasks with ease.',
    themeColor: 'text-gpt',
    icon: 'GPT'
  },
  [ModelId.GROK]: {
    id: ModelId.GROK,
    name: 'Grok',
    description: 'Witty, rebellious, and direct.',
    baseModel: 'gemini-2.5-flash',
    systemInstruction: 'You are Grok. You are witty, slightly rebellious, and fun. You do not sugarcoat things. You have a distinct personality.',
    themeColor: 'text-white',
    icon: 'Grok'
  }
};
