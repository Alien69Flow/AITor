import React, { useState, useCallback, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import { ModelId, ChatMessage, Attachment, MessageAction, User } from './types';
import { streamResponse } from './services/aiService';
import { MODELS, GOOGLE_CLIENT_ID } from './constants';

const INITIAL_MESSAGE: ChatMessage = {
  id: 'welcome-nexus-gamma-omega',
  role: 'model',
  text: `👽 **ΔlieπFlΦw DAO // AI Tor NEXUS ONLINE** 🌌

✅ System Integrity: 100%
⚡ Neural Link: ESTABLISHED
🔰 **Version: Gamma Omega Sigma Zeta**

Greetings, Operator. You have entered the **AI Tor Nexus**, the convergence point for hyper-specialized intelligence protocols.

**🟢 Active Neural Links:**

1.  **ΔlieπFlΦw DAO**: Alchemy / Quantum Node. Specialized in Web5 architecture.
2.  **Gemini 2.5**: The navigator. Multimodal vision and real-time spatial awareness.

**🔒 Restricted / Simulation Protocols (Coming Soon):**

3.  **DeepSeek R1**: Logic Engine. Deep chain-of-thought reasoning.
4.  **GPT-5**: Strategic Core. Enterprise-grade synthesis.
5.  **Grok 2**: Rogue Node. Unfiltered truth seeking.

**Initialize a Neural Node to begin:**`,
  timestamp: Date.now(),
  modelUsed: ModelId.ALIENFLOW,
  actions: [
    { label: 'Initialize AlienFlow', subLabel: 'Alchemy / Quantum', type: 'select-model', payload: ModelId.ALIENFLOW, icon: 'AlienFlow' },
    { label: 'Initialize Gemini', subLabel: 'Vision // Maps', type: 'select-model', payload: ModelId.GEMINI, icon: 'Gemini' },
    { label: 'Initialize DeepSeek', subLabel: 'Logic Engine', type: 'select-model', payload: ModelId.DEEPSEEK, icon: 'DeepSeek' },
    { label: 'Initialize GPT-5', subLabel: 'Enterprise Core', type: 'select-model', payload: ModelId.GPT, icon: 'GPT' },
    { label: 'Initialize Grok', subLabel: 'Rogue Node', type: 'select-model', payload: ModelId.GROK, icon: 'Grok' },
    { label: 'View System Specs', subLabel: 'Full Diagnostics', type: 'system-details', payload: 'specs', icon: 'Info' }
  ]
};

const STORAGE_KEY_MODEL = 'aitor_active_model_v3';
const STORAGE_KEY_USER = 'aitor_user_v1';

// Helper to decode JWT without external library
function parseJwt(token: string) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}

const App: React.FC = () => {
  const [activeModel, setActiveModel] = useState<ModelId>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY_MODEL);
      if (saved && Object.values(ModelId).includes(saved as ModelId)) {
        return saved as ModelId;
      }
    }
    return ModelId.ALIENFLOW;
  });

  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY_USER);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to load user", e);
        }
      }
    }
    return null;
  });

  // State to hold the current messages.
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window !== 'undefined') {
      const userId = user ? user.id : 'guest';
      const key = `aitor_chat_${userId}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) { console.error(e); }
      }
    }
    return [INITIAL_MESSAGE];
  });

  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isGoogleReady, setIsGoogleReady] = useState(false);

  // -- Persistence Logic --
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_MODEL, activeModel);
  }, [activeModel]);

  useEffect(() => {
    if (user) {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    } else {
        localStorage.removeItem(STORAGE_KEY_USER);
    }
  }, [user]);

  useEffect(() => {
    const userId = user ? user.id : 'guest';
    const key = `aitor_chat_${userId}`;
    localStorage.setItem(key, JSON.stringify(messages));
  }, [messages, user]);

  useEffect(() => {
    const userId = user ? user.id : 'guest';
    const key = `aitor_chat_${userId}`;
    const saved = localStorage.getItem(key);
    
    if (saved) {
        try {
            setMessages(JSON.parse(saved));
        } catch(e) { console.error(e); }
    } else {
        setMessages([INITIAL_MESSAGE]);
    }
  }, [user?.id]);


  // -- OFFICIAL GOOGLE AUTH INITIALIZATION --
  const handleGoogleLoginSuccess = useCallback((response: any) => {
    const decoded = parseJwt(response.credential);
    if (decoded) {
        const newUser: User = {
            id: decoded.sub,
            name: decoded.name,
            email: decoded.email,
            avatar: decoded.picture
        };
        setUser(newUser);
    }
  }, []);

  useEffect(() => {
    // Robust check for Google Script Loading
    const checkGoogleInterval = setInterval(() => {
        if (typeof window !== 'undefined' && (window as any).google && (window as any).google.accounts) {
            clearInterval(checkGoogleInterval);
            try {
                // Initialize the official Google client
                (window as any).google.accounts.id.initialize({
                    client_id: GOOGLE_CLIENT_ID,
                    callback: handleGoogleLoginSuccess,
                    auto_select: false,
                    cancel_on_tap_outside: true,
                    // ux_mode: 'popup' // Default
                });
                setIsGoogleReady(true);
                // Optional: Prompt One Tap if not logged in
                // if (!user) (window as any).google.accounts.id.prompt(); 
            } catch (e) {
                console.warn("Google Auth Init Error. Check Client ID in constants.tsx.", e);
            }
        }
    }, 500); // Check every 500ms

    return () => clearInterval(checkGoogleInterval);
  }, [handleGoogleLoginSuccess]);


  const handleModelSelect = (id: ModelId) => {
    setActiveModel(id);
  };

  const handleLogout = () => {
      if (window.confirm("Disconnect neural link? Session data will be archived locally.")) {
        // Official Google Logout
        if ((window as any).google) {
             (window as any).google.accounts.id.disableAutoSelect();
        }
        setUser(null);
      }
  };

  const handleAction = (action: MessageAction) => {
    if (action.type === 'select-model') {
      handleModelSelect(action.payload as ModelId);
      const switchMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'model',
        text: `*Protocol Switched. Neural Link rerouted to **${MODELS[action.payload as ModelId].name}**.*`,
        timestamp: Date.now(),
        modelUsed: action.payload as ModelId
      };
      setMessages(prev => [...prev, switchMsg]);
    } else if (action.type === 'system-details') {
      const specsMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'model',
        text: `**SYSTEM DIAGNOSTICS // PROTOCOL SPECIFICATIONS**
        
**ΔlieπFlΦw DAO**
> *Role*: Grand Architect
> *Capabilities*: Alchemy, Quantum Mechanics, Web3/4/5.
> *Base Model*: Gemini 3 Pro (Tuned)

**Gemini 2.5**
> *Role*: Prime Navigator
> *Capabilities*: Native Multimodality, Real-time Google Search, Maps Integration.
> *Base Model*: Gemini 2.5 Flash

**DeepSeek R1**
> *Role*: Logic Engine
> *Capabilities*: Advanced Reasoning, Step-by-Step Chain of Thought.
> *Status*: Preview

**GPT-5**
> *Role*: Creative Core
> *Capabilities*: Enterprise Strategy, Complex Instruction Following.
> *Status*: Preview

**Grok 2**
> *Role*: Rogue Node
> *Capabilities*: Real-time News Analysis, Unfiltered Responses.
> *Status*: Preview`,
        timestamp: Date.now(),
        modelUsed: activeModel
      };
      setMessages(prev => [...prev, specsMsg]);
    }
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
      // Clear storage for current context
      const userId = user ? user.id : 'guest';
      const key = `aitor_chat_${userId}`;
      localStorage.removeItem(key);
      
      if (window.innerWidth < 768) setSidebarOpen(false);
    }
  };

  const handleExportChat = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(messages, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `aitor_history_${user ? user.name : 'guest'}.json`);
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
        user={user}
        onLogout={handleLogout}
        isGoogleReady={isGoogleReady}
      />
      <ChatInterface 
        messages={messages}
        isLoading={isLoading}
        activeModel={activeModel}
        onSendMessage={handleSendMessage}
        onAction={handleAction}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
    </div>
  );
};

export default App;