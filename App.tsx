import React, { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import { ModelId, ChatMessage } from './types';
import { streamResponse } from './services/aiService';
import { MODELS } from './constants';

const App: React.FC = () => {
  const [activeModel, setActiveModel] = useState<ModelId>(ModelId.GEMINI);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSendMessage = useCallback(async (text: string) => {
    // Add User Message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: text,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    const isThinkingModel = MODELS[activeModel].useThinking;

    // Create placeholder for AI response
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
      // Pass history excluding the placeholder we just added
      const stream = streamResponse([...messages, userMsg], text, activeModel);
      
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
            ? { ...msg, text: "I encountered an error connecting to the neural network. Please try again." } 
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [activeModel, messages]);

  const handleClearChat = () => {
    if (window.confirm("Are you sure you want to clear the conversation?")) {
      setMessages([]);
      if (window.innerWidth < 768) setSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#0f1115] text-white font-sans overflow-hidden">
      <Sidebar 
        activeModel={activeModel}
        onSelectModel={setActiveModel}
        onClearChat={handleClearChat}
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
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
