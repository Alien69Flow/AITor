import React, { useEffect, useRef } from 'react';
import { ChatMessage, ModelId } from '../types';
import { Icons, MODELS } from '../constants';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  isLoading: boolean;
  activeModel: ModelId;
  onSendMessage: (text: string) => void;
  toggleSidebar: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  isLoading, 
  activeModel, 
  onSendMessage,
  toggleSidebar
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputText, setInputText] = React.useState('');

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const currentModelConfig = MODELS[activeModel];
  const ModelIcon = Icons[currentModelConfig.icon as keyof typeof Icons];

  // Helper to format text with simplistic markdown-like features (bold, code blocks)
  const formatMessageText = (text: string) => {
    // Very basic split for code blocks
    const parts = text.split(/(```[\s\S]*?```)/g);
    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const content = part.slice(3, -3).replace(/^[a-z]+\n/, ''); // remove lang tag if present
        return (
          <pre key={index} className="bg-gray-950 p-3 rounded-lg my-2 overflow-x-auto text-xs md:text-sm font-mono text-gray-300 border border-gray-800">
            <code>{content}</code>
          </pre>
        );
      }
      // Basic bold formatting
      return (
        <span key={index} className="whitespace-pre-wrap">
          {part.split(/(\*\*.*?\*\*)/g).map((subPart, subIndex) => {
            if (subPart.startsWith('**') && subPart.endsWith('**')) {
              return <strong key={subIndex} className="text-white font-semibold">{subPart.slice(2, -2)}</strong>;
            }
            return subPart;
          })}
        </span>
      );
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full relative bg-[#0f1115]">
      {/* Header */}
      <header className="h-16 border-b border-gray-800 flex items-center justify-between px-4 md:px-6 bg-[#0f1115]/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleSidebar}
            className="md:hidden p-2 -ml-2 text-gray-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          
          <div className={`p-1.5 rounded-lg bg-gray-800 ${currentModelConfig.themeColor}`}>
            <ModelIcon />
          </div>
          <div>
            <h2 className="font-semibold text-white leading-tight">
              {currentModelConfig.name}
            </h2>
            <p className="text-xs text-green-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
              Online
            </p>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-50 p-8">
            <div className={`w-16 h-16 rounded-2xl bg-gray-800 mb-6 flex items-center justify-center ${currentModelConfig.themeColor}`}>
              <div className="transform scale-150">
                <ModelIcon />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-200 mb-2">
              Hello, I'm {currentModelConfig.name}
            </h3>
            <p className="text-gray-400 max-w-md">
              {currentModelConfig.description} Ask me anything.
            </p>
          </div>
        )}

        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const msgModelConfig = msg.modelUsed ? MODELS[msg.modelUsed] : currentModelConfig;
          
          return (
            <div 
              key={msg.id} 
              className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] md:max-w-[75%] lg:max-w-[65%] flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className={`
                  w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center
                  ${isUser ? 'bg-gray-700 text-gray-300' : 'bg-gray-800 ' + msgModelConfig.themeColor}
                `}>
                  {isUser ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  ) : (
                    (() => {
                        const Icon = Icons[msgModelConfig.icon as keyof typeof Icons];
                        return <Icon />
                    })()
                  )}
                </div>

                {/* Bubble */}
                <div className={`
                  flex flex-col gap-1
                  ${isUser ? 'items-end' : 'items-start'}
                `}>
                   <div className={`
                    rounded-2xl px-4 py-3 text-sm md:text-base leading-relaxed shadow-sm
                    ${isUser 
                      ? 'bg-blue-600 text-white rounded-tr-sm' 
                      : 'bg-[#1a1d23] text-gray-200 border border-gray-800 rounded-tl-sm'}
                  `}>
                    {/* If DeepSeek "Thinking" */}
                    {msg.isThinking && !isUser && (
                       <div className="mb-3 pl-3 border-l-2 border-gray-600 italic text-gray-500 text-xs">
                         <span className="flex items-center gap-2 mb-1 not-italic font-medium text-gray-400">
                           <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></span>
                           Thinking Process
                         </span>
                         {/* We simulate showing thought process if the API returned it, otherwise generic */}
                         Analysis complete. Generating logical structure...
                       </div>
                    )}
                    
                    {formatMessageText(msg.text)}
                  </div>
                  <span className="text-[10px] text-gray-600 uppercase font-mono px-1">
                    {isUser ? 'You' : msgModelConfig.name}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex justify-start">
             <div className="max-w-[75%] flex gap-3">
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-gray-800 ${currentModelConfig.themeColor}`}>
                   <ModelIcon />
                </div>
                <div className="bg-[#1a1d23] border border-gray-800 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-6 bg-[#0f1115]">
        <form 
          onSubmit={handleSubmit}
          className="relative max-w-4xl mx-auto"
        >
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Message ${currentModelConfig.name}...`}
            className="w-full bg-[#1a1d23] border border-gray-700 text-white rounded-2xl pl-5 pr-12 py-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-lg placeholder-gray-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className={`
              absolute right-2 top-2 bottom-2 aspect-square rounded-xl flex items-center justify-center transition-all
              ${!inputText.trim() || isLoading 
                ? 'bg-gray-800 text-gray-600 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-900/20'}
            `}
          >
            <Icons.Send />
          </button>
        </form>
        <p className="text-center text-[10px] text-gray-600 mt-3 font-mono">
          AITor can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;
