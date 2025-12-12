import React, { useState, useCallback, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import { ModelId, ChatMessage, Attachment } from './types';
import { streamResponse } from './services/aiService';
import { MODELS } from './constants';

const INITIAL_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'model',
  text: "🌌 **ΔlieπFlΦw DAO** 🌌\n\n**SYSTEM STATUS: ONLINE**\n*Node: AI Tor (Master Interface)*\n\nGreetings. The Synapse Collective is active. I am ready to architect your request.\n\n✨ **OPERATIONAL NODES**\n\n⚛️ **ΔlieπFlΦw DAO (AI Tor)**\n*The Architect — Quantum Web3 & Neural Architecture.*\n🟢 **STATUS: ACTIVE & READY**\n\n🔹 **Gemini 2.5**\n*The Navigator — Real-Time Knowledge.*\n🟢 **STATUS: ONLINE**\n\n⚠️ **RESTRICTED NODES**\n\n```\n🧠 DeepSeek R1 [OFFLINE]\n> The Logician — Logic & Reasoning.\n> STATUS: 🔴 COMING SOON\n```\n\n```\n👔 GPT-5 Preview [OFFLINE]\n> The Executive — Enterprise Strategy.\n> STATUS: 🔴 COMING SOON\n```\n\n```\n🚀 Grok 2 [OFFLINE]\n> The Maverick — Radical Curiosity.\n> STATUS: 🔴 COMING SOON\n```\n\n*Awaiting your input...*",
  timestamp: Date.now(),
  modelUsed: ModelId.ALIENFLOW 
};

const STORAGE_KEY_HISTORY = 'aitor_chat_history_v23'; 
const STORAGE_KEY_MODEL = 'aitor_active_model_v3';

const App: React.FC = () => {
  const [activeModel, setActiveModel] = useState<ModelId>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY_MODEL);
      // Validate that the saved model exists in our current enum
      if (saved && Object.values(ModelId).includes(saved as ModelId)) {
        return saved as ModelId;
      }
    }
    // Default to ALIENFLOW as requested
    return ModelId.ALIENFLOW;
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        } catch (e) {
          console.error("Failed to load chat history", e);
        }
      }
    }
    return [INITIAL_MESSAGE];
  });

  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_MODEL, activeModel);
  }, [activeModel]);

  // Wrapper for setting active model to ensure consistent behavior
  const handleModelSelect = (id: ModelId) => {
    setActiveModel(id);
  };

  const handleSendMessage = useCallback(async (text: string, attachments: Attachment[] = []) => {
    const config = MODELS[activeModel];
    
    // Add User Message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: text,
      timestamp: Date.now(),
      attachments: attachments 
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    const isThinkingModel = config.useThinking;

    const aiMsgId = (Date.now() + 1).toString();
    const initialAiMsg: ChatMessage = {
      id: aiMsgId,
      role: 'model',
      text: '',
      timestamp: Date.now(),
      modelUsed: activeModel,
      isThinking: isThinkingModel
    };

    setMessages(prev => [...prev, initialAiMsg]);

    try {
      // Stream Response
      const stream = streamResponse([...messages, userMsg], activeModel, attachments);
      
      let fullText = "";

      for await (const chunk of stream) {
        fullText += chunk;
        setMessages(prev => 
          prev.map(msg => 
            msg.id === aiMsgId 
              ? { ...msg, text: fullText } 
              : msg
          )
        );
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => 
        prev.map(msg => 
          msg.id === aiMsgId 
            ? { ...msg, text: "Connection interrupted." } 
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [activeModel, messages]);

  const handleClearChat = () => {
    if (window.confirm("Are you sure you want to clear the conversation history?")) {
      setMessages([INITIAL_MESSAGE]);
      localStorage.removeItem(STORAGE_KEY_HISTORY);
      if (window.innerWidth < 768) setSidebarOpen(false);
    }
  };

  const handleExportChat = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(messages, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "aitor_history.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="flex h-screen w-full bg-[#0f1115] text-white font-exo overflow-hidden">
      <Sidebar 
        activeModel={activeModel}
        onSelectModel={handleModelSelect}
        onClearChat={handleClearChat}
        onExportChat={handleExportChat}
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        hasActiveChat={messages.length > 1}
      />
      <ChatInterface 
        messages={messages}
        isLoading={isLoading}
        activeModel={activeModel}
        onSendMessage={handleSendMessage}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
    </div>
  );
};

export default App;