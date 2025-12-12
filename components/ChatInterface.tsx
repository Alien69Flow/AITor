import React, { useEffect, useRef, useState } from 'react';
import { ChatMessage, ModelId, Attachment } from '../types';
import { Icons, MODELS } from '../constants';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  isLoading: boolean;
  activeModel: ModelId;
  onSendMessage: (text: string, attachments: Attachment[]) => void;
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [inputText, setInputText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, attachments]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && attachments.length === 0) || isLoading) return;
    
    onSendMessage(inputText, attachments);
    setInputText('');
    setAttachments([]);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target?.result) {
          const base64String = (event.target.result as string).split(',')[1];
          setAttachments(prev => [...prev, {
            mimeType: file.type,
            data: base64String
          }]);
        }
      };
      
      reader.readAsDataURL(file);
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const currentModelConfig = MODELS[activeModel];
  const ModelIcon = Icons[currentModelConfig.icon as keyof typeof Icons];
  const isComingSoon = currentModelConfig.isComingSoon;

  const formatMessageText = (text: string) => {
    const parts = text.split(/(```[\s\S]*?```)/g);
    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const content = part.slice(3, -3).replace(/^[a-z]+\n/, ''); 
        return (
          <pre key={index} className="bg-gray-950 p-3 rounded-lg my-2 overflow-x-auto text-xs md:text-sm font-mono text-gray-300 border border-gray-800">
            <code>{content}</code>
          </pre>
        );
      }
      return (
        <span key={index} className="whitespace-pre-wrap font-exo">
          {part.split(/(\*\*.*?\*\*)/g).map((subPart, subIndex) => {
            if (subPart.startsWith('**') && subPart.endsWith('**')) {
              return <strong key={subIndex} className="text-white font-bold">{subPart.slice(2, -2)}</strong>;
            }
            return subPart;
          })}
        </span>
      );
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full relative bg-[#0f1115] font-exo">
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
            <h2 className="font-bold text-white leading-tight font-nasalization tracking-wide">
              {currentModelConfig.name}
            </h2>
            <div className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${isComingSoon ? 'bg-yellow-500' : 'bg-green-400 animate-pulse'}`}></span>
              <p className="text-[10px] uppercase tracking-wider text-gray-400">
                {isComingSoon ? 'Offline / API Key Required' : 'Online / Active'}
              </p>
            </div>
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
            <h3 className="text-2xl font-bold text-gray-200 mb-2 font-nasalization">
              {currentModelConfig.name}
            </h3>
            <p className="text-gray-400 max-w-md font-exo">
              {currentModelConfig.description}
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
                <div className={`
                  w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center
                  ${isUser ? 'bg-gray-700 text-gray-300' : 'bg-gray-800 ' + msgModelConfig.themeColor}
                `}>
                  {isUser ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  ) : (
                    (() => { const Icon = Icons[msgModelConfig.icon as keyof typeof Icons]; return <Icon /> })()
                  )}
                </div>

                <div className={`flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
                   <div className={`
                    rounded-2xl px-4 py-3 text-sm md:text-base leading-relaxed shadow-sm
                    ${isUser 
                      ? 'bg-blue-600 text-white rounded-tr-sm' 
                      : 'bg-[#1a1d23] text-gray-200 border border-gray-800 rounded-tl-sm'}
                  `}>
                    {/* Render Attachments */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {msg.attachments.map((att, i) => (
                          att.mimeType.startsWith('image/') && (
                            <img 
                              key={i} 
                              src={`data:${att.mimeType};base64,${att.data}`} 
                              alt="Uploaded content" 
                              className="max-w-[200px] rounded-lg border border-gray-700" 
                            />
                          )
                        ))}
                      </div>
                    )}

                    {msg.isThinking && !isUser && (
                       <div className="mb-3 pl-3 border-l-2 border-gray-600 italic text-gray-500 text-xs font-mono">
                         <span className="flex items-center gap-2 mb-1 not-italic font-bold text-gray-400 uppercase tracking-wider">
                           <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></span>
                           Processing Logic
                         </span>
                         Analysis complete...
                       </div>
                    )}
                    {formatMessageText(msg.text)}
                  </div>
                  <span className="text-[10px] text-gray-600 uppercase font-nasalization tracking-wider px-1">
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
        {isComingSoon ? (
          <div className="max-w-4xl mx-auto bg-gray-900/50 border border-yellow-900/50 rounded-2xl p-6 text-center">
            <h3 className="text-yellow-500 font-bold mb-2 font-nasalization">Integration Pending</h3>
            <p className="text-gray-400 text-sm font-exo">
              We are respecting your request for authenticity. <br/> 
              Native access to <strong>{currentModelConfig.name}</strong> requires a specific API Key configuration which is coming in a future update.
            </p>
            <p className="text-gray-500 text-xs mt-4">Please switch to <strong>AlienFlow DAO</strong> or <strong>Gemini</strong> to continue.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto">
            {/* Attachment Preview */}
            {attachments.length > 0 && (
              <div className="absolute bottom-full mb-4 left-0 flex gap-2 overflow-x-auto w-full p-2">
                {attachments.map((att, i) => (
                  <div key={i} className="relative group">
                    <div className="w-16 h-16 rounded-lg bg-gray-800 border border-gray-700 overflow-hidden flex items-center justify-center">
                      {att.mimeType.startsWith('image/') 
                        ? <img src={`data:${att.mimeType};base64,${att.data}`} className="w-full h-full object-cover" />
                        : <span className="text-xs text-gray-400">File</span>
                      }
                    </div>
                    <button 
                      type="button"
                      onClick={() => removeAttachment(i)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Transmit to ${currentModelConfig.name}...`}
                className="w-full bg-[#1a1d23] border border-gray-700 text-white rounded-2xl pl-12 pr-12 py-4 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all shadow-lg placeholder-gray-500 font-exo"
                disabled={isLoading}
              />
              
              {/* File Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-white transition-colors"
              >
                <Icons.Paperclip />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileSelect}
                accept="image/*" // Restricting to images for now as they are safest for Gemini Multimodal
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={(!inputText.trim() && attachments.length === 0) || isLoading}
                className={`
                  absolute right-2 top-2 bottom-2 aspect-square rounded-xl flex items-center justify-center transition-all
                  ${(!inputText.trim() && attachments.length === 0) || isLoading 
                    ? 'bg-gray-800 text-gray-600 cursor-not-allowed' 
                    : 'bg-purple-600 text-white hover:bg-purple-500 shadow-lg shadow-purple-900/20'}
                `}
              >
                <Icons.Send />
              </button>
            </div>
          </form>
        )}
        <p className="text-center text-[10px] text-gray-600 mt-3 font-exo opacity-70">
          AI Tor Nexus can make mistakes. Please verify important information.
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;