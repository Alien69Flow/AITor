import React, { useEffect, useRef, useState } from 'react';
import { ChatMessage, ModelId, Attachment, MessageAction } from '../types';
import { Icons, MODELS } from '../constants';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  isLoading: boolean;
  activeModel: ModelId;
  onSendMessage: (text: string, attachments: Attachment[]) => void;
  onAction?: (action: MessageAction) => void;
  toggleSidebar: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  isLoading, 
  activeModel, 
  onSendMessage,
  onAction,
  toggleSidebar
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [inputText, setInputText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  // Dropdown States
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Smart Auto-scroll logic
  useEffect(() => {
    if (scrollRef.current) {
      if (messages.length === 1 && messages[0].role === 'model') {
         scrollRef.current.scrollTop = 0;
      } else {
         const isHugeJump = scrollRef.current.scrollHeight - scrollRef.current.scrollTop > 1000;
         scrollRef.current.scrollTo({
           top: scrollRef.current.scrollHeight,
           behavior: isHugeJump ? 'auto' : 'smooth'
         });
      }
    }
  }, [messages, isLoading, attachments]);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClick = () => setOpenDropdown(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && attachments.length === 0) || isLoading) return;
    
    onSendMessage(inputText, attachments);
    setInputText('');
    setAttachments([]);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const processFiles = (files: File[]) => {
    files.forEach(file => {
      if (!file.type.startsWith('image/')) return; 
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
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const currentModelConfig = MODELS[activeModel];
  const ModelIcon = Icons[currentModelConfig.icon as keyof typeof Icons];
  const isComingSoon = currentModelConfig.isComingSoon;

  const toggleDropdown = (e: React.MouseEvent, name: string) => {
    e.stopPropagation();
    setOpenDropdown(openDropdown === name ? null : name);
  };

  // Helper to trigger tool actions
  const triggerTool = (promptPrefix: string) => {
    setOpenDropdown(null);
    if(isLoading) return;
    onSendMessage(promptPrefix, []);
  };

  const formatMessageText = (text: string) => {
    const parts = text.split(/(```[\s\S]*?```)/g);
    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const content = part.slice(3, -3).replace(/^[a-z]+\n/, ''); 
        return (
          <div key={index} className="my-3 md:my-4 rounded-lg overflow-hidden border border-white/10 shadow-lg">
            <div className="bg-black/40 px-3 py-1.5 text-[10px] md:text-xs text-gray-500 font-mono border-b border-white/5 flex items-center gap-2">
               <div className="flex gap-1.5">
                 <div className="w-2.5 h-2.5 rounded-full bg-red-500/20"></div>
                 <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20"></div>
                 <div className="w-2.5 h-2.5 rounded-full bg-green-500/20"></div>
               </div>
               CODE BLOCK
            </div>
            <pre className="bg-[#0a0c10] p-3 md:p-4 overflow-x-auto text-[10px] md:text-sm font-mono text-gray-300">
              <code>{content}</code>
            </pre>
          </div>
        );
      }
      return (
        <span key={index} className="whitespace-pre-wrap font-exo leading-relaxed break-words">
          {part.split(/(\*\*.*?\*\*|###.*?$|^>.*?$|^✅.*?$|^⚡.*?$)/gm).map((subPart, subIndex) => {
            if (subPart.startsWith('**') && subPart.endsWith('**')) {
              return <strong key={subIndex} className="text-white font-bold tracking-wide">{subPart.slice(2, -2)}</strong>;
            }
            if (subPart.startsWith('###')) {
               return <h3 key={subIndex} className="text-base md:text-lg font-nasalization text-purple-200 mt-4 mb-2">{subPart.replace('###', '').trim()}</h3>
            }
            if (subPart.trim().startsWith('>')) {
               return <blockquote key={subIndex} className="border-l-2 border-purple-500/50 pl-3 italic text-gray-400 my-2 bg-purple-500/5 py-1 rounded-r text-sm">{subPart.replace('>', '').trim()}</blockquote>
            }
            if (subPart.trim().startsWith('✅')) {
              return <span key={subIndex} className="block text-green-400 font-mono text-xs md:text-sm my-1 animate-pulse font-bold">{subPart.trim()}</span>
            }
            if (subPart.trim().startsWith('⚡')) {
              return <span key={subIndex} className="block text-blue-400 font-mono text-xs md:text-sm my-1 animate-pulse font-bold" style={{ animationDuration: '1.5s' }}>{subPart.trim()}</span>
            }
            return subPart;
          })}
        </span>
      );
    });
  };

  return (
    <div 
      className="flex-1 flex flex-col h-full relative bg-[#0f1115] font-exo overflow-hidden"
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
    >
      {/* Enhanced Header with Dropdown Menu */}
      <header className="h-16 md:h-20 border-b border-white/5 flex items-center justify-between px-4 md:px-8 bg-[#0f1115]/90 backdrop-blur-xl sticky top-0 z-30 shadow-2xl">
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleSidebar}
            className="md:hidden p-2 -ml-2 text-gray-400 hover:text-white transition-colors active:scale-95"
          >
            <Icons.Menu />
          </button>
          
          {/* Active Model Indicator */}
          <div className="flex items-center gap-3 pl-2 md:pl-0 border-l border-white/5 md:border-none md:pl-0 pl-4">
             <div className={`
               p-1.5 md:p-2 rounded-xl shadow-lg border border-white/10
               ${currentModelConfig.themeColor} bg-gradient-to-br from-white/5 to-transparent
               transition-all duration-300
             `}>
              <div className="scale-90 md:scale-100"><ModelIcon /></div>
            </div>
            <div>
              <h2 className="text-xs md:text-sm font-bold text-white leading-none font-nasalization tracking-wider mb-1">
                {currentModelConfig.name}
              </h2>
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${isComingSoon ? 'bg-yellow-500' : 'bg-green-400 animate-pulse'}`}></span>
                <p className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-gray-500 font-mono">
                  {isComingSoon ? 'OFFLINE' : 'ONLINE'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Right Menu Dropdowns */}
        <div className="flex items-center gap-2 md:gap-3">
            
            {/* Version / Nodes Menu */}
            <div className="relative">
                <button 
                    onClick={(e) => toggleDropdown(e, 'nodes')}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white hover:bg-white/5 transition-all border border-transparent hover:border-white/5 active:bg-white/10"
                >
                    <Icons.Cpu />
                    <span className="hidden md:inline">Nodes</span>
                    <Icons.ChevronDown />
                </button>
                {openDropdown === 'nodes' && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-[#13161b] border border-white/10 rounded-xl shadow-[0_0_30px_-5px_rgba(0,0,0,0.8)] p-2 z-50 animate-in fade-in zoom-in-95 duration-200 backdrop-blur-3xl ring-1 ring-white/5">
                        <div className="px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-white/5 mb-2">System Status</div>
                        <div className="space-y-1">
                            {Object.values(MODELS).map(model => (
                                <div key={model.id} className="flex justify-between items-center text-xs text-gray-300 hover:bg-white/5 p-2 rounded-lg transition-colors cursor-default">
                                    <span className="flex items-center gap-2">
                                        <div className={`w-1 h-4 rounded-full ${model.isComingSoon ? 'bg-orange-500' : 'bg-green-500'}`}></div>
                                        {model.name}
                                    </span>
                                    <span className={`font-mono text-[10px] ${model.isComingSoon ? 'text-orange-400' : 'text-green-400'}`}>
                                        {model.isComingSoon ? 'OFFLINE' : 'ACTIVE'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Tools Menu - Alphabetized */}
            <div className="relative">
                <button 
                    onClick={(e) => toggleDropdown(e, 'tools')}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white hover:bg-white/5 transition-all border border-transparent hover:border-white/5 active:bg-white/10"
                >
                    <Icons.Settings />
                    <span className="hidden md:inline">Tools</span>
                    <Icons.ChevronDown />
                </button>
                {openDropdown === 'tools' && (
                     <div className="absolute right-0 top-full mt-2 w-64 bg-[#13161b] border border-white/10 rounded-xl shadow-[0_0_30px_-5px_rgba(0,0,0,0.8)] p-2 z-50 animate-in fade-in zoom-in-95 duration-200 backdrop-blur-3xl ring-1 ring-white/5">
                        <div className="px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-white/5 mb-2">Modules</div>
                        
                        <div className="grid grid-cols-1 gap-1">
                             <button onClick={() => triggerTool("Brainstorm creative ideas for:")} className="w-full text-left flex items-center gap-3 text-xs text-gray-300 hover:bg-white/5 hover:text-white p-2 rounded-lg group transition-all">
                                <div className="p-1.5 rounded bg-orange-500/10 text-orange-400 group-hover:bg-orange-500 group-hover:text-white transition-all"><Icons.Brainstorm /></div>
                                <span className="font-medium">Brainstorm</span>
                            </button>

                             <button onClick={() => triggerTool("Act as a Code Interpreter. Write code to solve this problem:")} className="w-full text-left flex items-center gap-3 text-xs text-gray-300 hover:bg-white/5 hover:text-white p-2 rounded-lg group transition-all">
                                <div className="p-1.5 rounded bg-yellow-500/10 text-yellow-400 group-hover:bg-yellow-500 group-hover:text-white transition-all"><Icons.Code /></div>
                                <span className="font-medium">Code Interpreter</span>
                            </button>

                             <button onClick={() => triggerTool("Act as a Creative Writer. Write a story about:")} className="w-full text-left flex items-center gap-3 text-xs text-gray-300 hover:bg-white/5 hover:text-white p-2 rounded-lg group transition-all">
                                <div className="p-1.5 rounded bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all"><Icons.Pen /></div>
                                <span className="font-medium">Creative Writer</span>
                            </button>

                             <button onClick={() => triggerTool("Act as a Data Analyst. Analyze the following information:")} className="w-full text-left flex items-center gap-3 text-xs text-gray-300 hover:bg-white/5 hover:text-white p-2 rounded-lg group transition-all">
                                <div className="p-1.5 rounded bg-pink-500/10 text-pink-400 group-hover:bg-pink-500 group-hover:text-white transition-all"><Icons.Analyze /></div>
                                <span className="font-medium">Data Analyst</span>
                            </button>

                            <button onClick={() => triggerTool("Generate a prompt to create an image of:")} className="w-full text-left flex items-center gap-3 text-xs text-gray-300 hover:bg-white/5 hover:text-white p-2 rounded-lg group transition-all">
                                <div className="p-1.5 rounded bg-purple-500/10 text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-all"><Icons.Image /></div>
                                <span className="font-medium">Image Gen</span>
                            </button>
                            
                             <button onClick={() => triggerTool("Summarize the following text concisely:")} className="w-full text-left flex items-center gap-3 text-xs text-gray-300 hover:bg-white/5 hover:text-white p-2 rounded-lg group transition-all">
                                <div className="p-1.5 rounded bg-teal-500/10 text-teal-400 group-hover:bg-teal-500 group-hover:text-white transition-all"><Icons.Summarize /></div>
                                <span className="font-medium">Summarizer</span>
                            </button>

                            <button onClick={() => triggerTool("Act as a Universal Translator. Please translate the following text:")} className="w-full text-left flex items-center gap-3 text-xs text-gray-300 hover:bg-white/5 hover:text-white p-2 rounded-lg group transition-all">
                                <div className="p-1.5 rounded bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all"><Icons.Translate /></div>
                                <span className="font-medium">Translator</span>
                            </button>

                            <button onClick={() => triggerTool("Search the web for the latest information on:")} className="w-full text-left flex items-center gap-3 text-xs text-gray-300 hover:bg-white/5 hover:text-white p-2 rounded-lg group transition-all">
                                <div className="p-1.5 rounded bg-green-500/10 text-green-400 group-hover:bg-green-500 group-hover:text-white transition-all"><Icons.Search /></div>
                                <span className="font-medium">Web Search</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

        </div>
      </header>

      {/* Drag Overlay */}
      {isDragOver && (
        <div className="absolute inset-0 z-50 bg-purple-900/40 backdrop-blur-sm border-2 border-dashed border-purple-400 m-4 rounded-2xl flex items-center justify-center pointer-events-none">
          <div className="bg-black/80 px-6 py-3 rounded-full text-purple-200 font-nasalization animate-bounce">
            DROP VISUAL DATA HERE
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8 scroll-smooth"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-60 p-8">
             {/* Empty State / Loading */}
          </div>
        )}

        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const msgModelConfig = msg.modelUsed ? MODELS[msg.modelUsed] : currentModelConfig;
          
          return (
            <div 
              key={msg.id} 
              className={`flex ${isUser ? 'justify-end' : 'justify-start'} group animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              <div className={`max-w-[95%] md:max-w-[85%] lg:max-w-[70%] flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className={`
                  hidden md:flex
                  w-8 h-8 md:w-10 md:h-10 rounded-xl flex-shrink-0 items-center justify-center shadow-lg border border-white/5
                  ${isUser ? 'bg-gradient-to-br from-indigo-600 to-blue-700 text-white' : 'bg-gradient-to-br from-gray-800 to-gray-900 ' + msgModelConfig.themeColor}
                `}>
                  {isUser ? (
                    <span className="font-nasalization text-xs">ID</span>
                  ) : (
                    (() => { const Icon = Icons[msgModelConfig.icon as keyof typeof Icons]; return <Icon /> })()
                  )}
                </div>

                <div className={`flex flex-col gap-1.5 ${isUser ? 'items-end' : 'items-start'} w-full`}>
                   {/* Name Label */}
                   <span className="text-[10px] text-gray-500 uppercase font-nasalization tracking-widest px-1">
                    {isUser ? 'OPERATOR' : msgModelConfig.name}
                  </span>

                   <div className={`
                    glass-card rounded-2xl px-4 py-3 md:px-6 md:py-5 text-sm md:text-[15px] leading-relaxed shadow-xl w-full
                    ${isUser 
                      ? 'bg-gradient-to-br from-blue-600/20 to-indigo-600/10 border-blue-500/20 text-blue-50 rounded-tr-sm' 
                      : 'bg-[#1a1d23]/80 border-white/5 text-gray-200 rounded-tl-sm'}
                  `}>
                    {/* Attachments */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {msg.attachments.map((att, i) => (
                          att.mimeType.startsWith('image/') && (
                            <div key={i} className="relative rounded-lg overflow-hidden border border-white/10 shadow-md transition-all">
                              <img 
                                src={`data:${att.mimeType};base64,${att.data}`} 
                                alt="Attachment" 
                                className="max-w-full md:max-w-[300px] max-h-[300px] object-cover" 
                              />
                            </div>
                          )
                        ))}
                      </div>
                    )}

                    {msg.isThinking && !isUser && (
                       <div className="mb-4 pl-4 border-l-2 border-purple-500/50 italic text-gray-400 text-xs font-mono bg-purple-500/5 py-2 pr-2 rounded-r">
                         <div className="flex items-center gap-2 mb-1 not-italic font-bold text-purple-300 uppercase tracking-wider text-[10px]">
                           <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                            </span>
                           Deep Thinking Protocol Active
                         </div>
                         Analysing Logic Gates...
                       </div>
                    )}
                    
                    {formatMessageText(msg.text)}

                    {/* Actions */}
                    {msg.actions && msg.actions.length > 0 && onAction && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4 pt-4 border-t border-white/5">
                        {msg.actions.map((action, i) => {
                          const ActionIcon = action.icon && Icons[action.icon as keyof typeof Icons] 
                            ? Icons[action.icon as keyof typeof Icons] 
                            : null;
                          return (
                            <button
                              key={i}
                              onClick={() => onAction(action)}
                              className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-purple-500/30 transition-all text-left group/btn active:scale-[0.98]"
                            >
                              {ActionIcon && (
                                <div className="p-1.5 rounded bg-black/20 text-gray-400 group-hover/btn:text-white transition-colors">
                                  <ActionIcon />
                                </div>
                              )}
                              <div>
                                <div className="text-sm font-bold text-gray-200 group-hover/btn:text-purple-300 transition-colors font-nasalization">
                                  {action.label}
                                </div>
                                {action.subLabel && (
                                  <div className="text-[10px] text-gray-500 group-hover/btn:text-gray-400 uppercase tracking-wider">
                                    {action.subLabel}
                                  </div>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex justify-start pl-2 md:pl-0">
             <div className="max-w-[80%] md:max-w-[75%] flex gap-4">
                <div className={`
                    hidden md:flex
                    w-8 h-8 md:w-10 md:h-10 rounded-xl flex-shrink-0 items-center justify-center bg-gray-800 ${currentModelConfig.themeColor} border border-white/5`
                }>
                   <ModelIcon />
                </div>
                <div className="glass-card rounded-2xl rounded-tl-sm px-5 py-4 flex items-center gap-1.5 border border-white/5">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Input Area - Redesigned Floating Style */}
      <div className="p-3 md:p-6 pb-4 md:pb-8 bg-gradient-to-t from-[#0f1115] via-[#0f1115] to-transparent z-20">
        {isComingSoon ? (
          <div className="max-w-3xl mx-auto glass border border-yellow-500/20 rounded-2xl p-6 text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-yellow-500/5 group-hover:bg-yellow-500/10 transition-colors"></div>
            <h3 className="text-yellow-400 font-bold mb-2 font-nasalization tracking-widest uppercase relative z-10">Access Restricted</h3>
            <p className="text-gray-400 text-sm font-exo relative z-10 max-w-lg mx-auto">
              Simulated node <strong>{currentModelConfig.name}</strong> is offline. API handshake protocol requires elevated privileges.
            </p>
            <div className="mt-4 flex justify-center gap-2 relative z-10">
               <span className="text-[10px] bg-yellow-900/40 text-yellow-200 px-2 py-1 rounded border border-yellow-700/50">ERROR_CODE_403</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto">
            {/* Attachment Preview */}
            {attachments.length > 0 && (
              <div className="absolute bottom-full mb-3 left-0 flex gap-2 overflow-x-auto w-full p-2 bg-[#0f1115]/80 backdrop-blur-md rounded-xl border border-white/5 shadow-xl">
                {attachments.map((att, i) => (
                  <div key={i} className="relative group shrink-0">
                    <div className="w-16 h-16 rounded-lg bg-gray-800 border border-gray-700 overflow-hidden flex items-center justify-center">
                      <img src={`data:${att.mimeType};base64,${att.data}`} className="w-full h-full object-cover" />
                    </div>
                    <button 
                      type="button"
                      onClick={() => removeAttachment(i)}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-md transition-all scale-0 group-hover:scale-100"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="relative group">
              {/* Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl opacity-10 group-hover:opacity-30 transition duration-500 blur-lg"></div>
              
              <div className="relative flex items-center bg-[#13161b] rounded-2xl border border-white/10 shadow-2xl transition-all">
                {/* File Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 md:p-4 text-gray-400 hover:text-purple-400 transition-colors border-r border-white/5 active:scale-95"
                  title="Upload Visual Data"
                >
                  <Icons.Paperclip />
                </button>

                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Transmit data to ${currentModelConfig.name}...`}
                  className="w-full bg-transparent text-white px-4 py-3 md:py-4 focus:outline-none placeholder-gray-600 font-exo text-sm md:text-base"
                  disabled={isLoading}
                />
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={handleFileSelect}
                  accept="image/*"
                  multiple 
                />

                {/* Send Button */}
                <div className="p-2">
                   <button
                    type="submit"
                    disabled={(!inputText.trim() && attachments.length === 0) || isLoading}
                    className={`
                      p-2 md:p-3 rounded-xl flex items-center justify-center transition-all duration-300
                      ${(!inputText.trim() && attachments.length === 0) || isLoading 
                        ? 'bg-gray-800 text-gray-600 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-[0_0_20px_rgba(124,58,237,0.6)] transform hover:scale-110 active:scale-95'}
                    `}
                  >
                    <Icons.Send />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex justify-center">
              <p className="text-[10px] text-gray-500/50 font-exo tracking-widest uppercase hover:text-gray-400 transition-colors cursor-default select-none flex items-center gap-2">
                 <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                 AI Tor Nexus can make mistakes. Verify important info.
                 <span className="w-1 h-1 rounded-full bg-gray-600"></span>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;