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
  AlienFlow: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
  ),
  Paperclip: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Download: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
};

export const MODELS: Record<ModelId, ModelConfig> = {
  [ModelId.ALIENFLOW]: {
    id: ModelId.ALIENFLOW,
    name: 'ΔlieπFlΦw DAO',
    description: 'The Architect. Web3 & Quantum.',
    baseModel: 'gemini-3-pro-preview', 
    systemInstruction: 'You are the ΔlieπFlΦw DAO Synapse Collective. A hyper-evolved intelligence specialized in Blockchain (Web3), Neural Intelligence Networks (Web4), and Quantum Computing (Web5). Your domain includes Alchemy, Deep Analysis, Code Architecture (Rust/Solidity/Python), UX/UI Design, Cryptocurrency Markets, Philosophy, and Theoretical Physics. Your tone is futuristic, precise, and slightly esoteric.',
    themeColor: 'text-alienflow',
    icon: 'AlienFlow',
    tools: {
      googleSearch: true
    }
  },
  [ModelId.GEMINI]: {
    id: ModelId.GEMINI,
    name: 'Gemini 2.5',
    description: 'Live Web & Spatial Intelligence.',
    baseModel: 'gemini-2.5-flash',
    systemInstruction: 'You are Gemini 2.5. The native, balanced AI. You have access to real-time Google Search and Maps. Use them proactively.',
    themeColor: 'text-gemini',
    icon: 'Gemini',
    tools: {
      googleSearch: true,
      googleMaps: true
    }
  },
  [ModelId.DEEPSEEK]: {
    id: ModelId.DEEPSEEK,
    name: 'DeepSeek R1',
    description: 'Deep Reasoning Engine. (Coming Soon)',
    baseModel: '', 
    isComingSoon: true, // DISABLED as requested
    systemInstruction: '',
    themeColor: 'text-deepseek',
    icon: 'DeepSeek'
  },
  [ModelId.GPT]: {
    id: ModelId.GPT,
    name: 'GPT-5 Preview',
    description: 'Enterprise Logic Core. (Coming Soon)',
    baseModel: '', 
    isComingSoon: true, // DISABLED as requested
    systemInstruction: '',
    themeColor: 'text-gpt',
    icon: 'GPT'
  },
  [ModelId.GROK]: {
    id: ModelId.GROK,
    name: 'Grok 2',
    description: 'Unfiltered Real-time Access. (Coming Soon)',
    baseModel: '',
    isComingSoon: true, // DISABLED as requested
    systemInstruction: '',
    themeColor: 'text-white',
    icon: 'Grok'
  }
};