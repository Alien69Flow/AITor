import React, { useState, useRef, useEffect } from 'react';
import { MODELS, Icons, GOOGLE_CLIENT_ID } from '../constants';
import { ModelId, User } from '../types';

interface SidebarProps {
  activeModel: ModelId;
  onSelectModel: (id: ModelId) => void;
  onClearChat: () => void;
  onExportChat: () => void;
  isOpen: boolean;
  toggleSidebar: () => void;
  hasActiveChat?: boolean;
  user?: User | null;
  onLogout?: () => void;
  isGoogleReady?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeModel, 
  onSelectModel, 
  onClearChat, 
  onExportChat, 
  isOpen, 
  toggleSidebar,
  hasActiveChat = false,
  user,
  onLogout,
  isGoogleReady = false
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [latency, setLatency] = useState(24);
  const [pendingModel, setPendingModel] = useState<{id: ModelId, name: string} | null>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const [hoveredModel, setHoveredModel] = useState<ModelId | null>(null);

  // Check if user has configured the client ID
  const isClientIdConfigured = GOOGLE_CLIENT_ID && !GOOGLE_CLIENT_ID.includes("YOUR_GOOGLE_CLIENT_ID");

  // Render official Google Button when user is not logged in and library is ready
  useEffect(() => {
    if (!user && isGoogleReady && isClientIdConfigured && (window as any).google) {
        try {
             const btnContainer = document.getElementById("google-btn-container");
             if (btnContainer) {
                 // Clear previous buttons to avoid duplicates/errors
                 btnContainer.innerHTML = '';
                 // Official Render Call
                 (window as any).google.accounts.id.renderButton(
                    btnContainer,
                    { 
                        theme: "filled_black", 
                        size: "large", 
                        text: "signin_with", 
                        shape: "rectangular",
                        width: "240",
                        logo_alignment: "left"
                    }
                );
             }
        } catch(e) {
            console.error("Google Button Render Error:", e);
        }
    }
  }, [user, isOpen, isGoogleReady, isClientIdConfigured]); 

  // Close settings on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Simulate network latency fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
        setLatency(prev => {
            const change = Math.floor(Math.random() * 10) - 5;
            const newVal = prev + change;
            return newVal < 12 ? 12 : newVal > 60 ? 60 : newVal;
        });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Official AlienFlow DAO Logo
  const OFFICIAL_LOGO_URI = `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120" fill="none">
      <path d="M10 25 L50 5 L90 25" stroke="#C5A059" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="50" cy="45" r="14" stroke="#4CAF50" stroke-width="1.5"/>
      <path d="M50 31 V59 M36 45 H64" stroke="#4CAF50" stroke-width="1" opacity="0.8"/>
      <path d="M40 38 C45 35 55 35 60 38" stroke="#4CAF50" stroke-width="1" stroke-linecap="round"/>
      <path d="M40 52 C45 55 55 55 60 52" stroke="#4CAF50" stroke-width="1" stroke-linecap="round"/>
      <path d="M30 35 Q20 45 30 55 M70 35 Q80 45 70 55" stroke="#4CAF50" stroke-width="1.5" fill="none"/>
      <path d="M30 70 L70 70 L50 90 L30 70 Z" stroke="#C5A059" stroke-width="1.5" fill="none"/>
      <path d="M30 110 L70 110 L50 90 L30 110 Z" stroke="#C5A059" stroke-width="1.5" fill="none"/>
      <ellipse cx="50" cy="82" rx="6" ry="2.5" fill="#C5A059"/>
      <path d="M50 82 L50 85 M46 84 L40 105 H60 L54 84" fill="url(#beamGradient)" opacity="0.8"/>
      <defs>
        <linearGradient id="beamGradient" x1="50" y1="84" x2="50" y2="105" gradientUnits="userSpaceOnUse">
          <stop stop-color="#C5A059" stop-opacity="0.9"/>
          <stop offset="1" stop-color="#C5A059" stop-opacity="0.1"/>
        </linearGradient>
      </defs>
    </svg>
  `)}`;

  const primeModels = [MODELS[ModelId.ALIENFLOW], MODELS[ModelId.GEMINI]];
  const simModels = [MODELS[ModelId.DEEPSEEK], MODELS[ModelId.GPT], MODELS[ModelId.GROK]];

  const handleModelClick = (e: React.MouseEvent, modelId: ModelId, modelName: string) => {
    e.preventDefault();
    
    if (activeModel === modelId) {
      if (window.innerWidth < 768) toggleSidebar();
      return;
    }

    if (hasActiveChat) {
      setPendingModel({ id: modelId, name: modelName });
      return;
    }
    
    performModelSwitch(modelId);
  };

  const performModelSwitch = (modelId: ModelId) => {
    onSelectModel(modelId);
    if (window.innerWidth < 768) {
      toggleSidebar();
    }
  };

  const confirmSwitch = () => {
    if (pendingModel) {
      performModelSwitch(pendingModel.id);
      setPendingModel(null);
    }
  };

  const cancelSwitch = () => {
    setPendingModel(null);
  };

  const renderModelButton = (model: any, type: 'prime' | 'sim') => {
    const Icon = Icons[model.icon as keyof typeof Icons];
    const isActive = activeModel === model.id;
    const isLocked = model.isComingSoon;
    const isHovered = hoveredModel === model.id;
    
    // Dynamic styling classes
    const containerClasses = isActive 
      ? `bg-[#1a1d23] border ${type === 'prime' ? 'border-purple-500/50 shadow-[0_0_20px_-5px_rgba(168,85,247,0.4)]' : 'border-orange-500/50 shadow-[0_0_20px_-5px_rgba(249,115,22,0.4)]'}`
      : `bg-transparent border border-transparent hover:bg-white/5 hover:border-white/10 ${isLocked ? 'opacity-60' : 'opacity-80 hover:opacity-100'}`;

    const iconColorClass = isActive ? 'text-white' : model.themeColor;
    
    return (
      <div 
        key={model.id} 
        className="relative group perspective-1000 mb-2"
        onMouseEnter={() => setHoveredModel(model.id)}
        onMouseLeave={() => setHoveredModel(null)}
      >
        <button
          onClick={(e) => handleModelClick(e, model.id, model.name)}
          className={`
            relative w-full text-left p-3.5 rounded-2xl transition-all duration-300
            flex items-center gap-4 overflow-hidden
            ${containerClasses}
            ${isLocked ? 'cursor-not-allowed grayscale-[0.5]' : ''}
          `}
        >
          {/* Glowing Background Effect for Active State */}
          {isActive && (
            <div className={`absolute inset-0 bg-gradient-to-r ${type === 'prime' ? 'from-purple-500/10 to-blue-500/10' : 'from-orange-500/10 to-red-500/10'} opacity-50`}></div>
          )}

          {/* Icon Container */}
          <div className={`
            relative p-2.5 rounded-xl transition-transform duration-300 transform group-hover:scale-110 flex-shrink-0 shadow-lg
            ${isActive 
                ? `bg-gradient-to-br from-gray-700 to-gray-900 border border-white/20` 
                : 'bg-white/5 border border-white/5'}
          `}>
             <div className={`${iconColorClass}`}><Icon /></div>
          </div>
          
          {/* Text Content */}
          <div className="relative z-10 flex-1 min-w-0 flex flex-col justify-center">
            <div className="flex items-center justify-between mb-1">
               <span className={`font-bold text-sm tracking-wide font-nasalization ${isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                 {model.name}
               </span>
               {isLocked && <Icons.Lock />}
            </div>
            <div className="text-[10px] text-gray-500 font-exo truncate group-hover:text-gray-400 transition-colors tracking-wide">
              {model.description}
            </div>
          </div>
          
          {/* Active Indicator Bar */}
          {isActive && (
             <div className={`absolute right-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-l-full bg-gradient-to-b ${type === 'prime' ? 'from-purple-500 to-blue-500' : 'from-orange-500 to-red-500'} shadow-[0_0_10px_currentColor]`}></div>
          )}
        </button>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={toggleSidebar}
      />

      {/* Floating Tooltip Component */}
      {hoveredModel && (
         <div 
            className="fixed z-[100] hidden md:block pointer-events-none"
            style={{ 
                left: '340px', // Sidebar width + margin
                top: '50%',
                transform: 'translateY(-50%)' 
            }}
         >
             {Object.values(MODELS).map(model => {
                 if (model.id !== hoveredModel) return null;
                 const isPrime = !model.isComingSoon;
                 return (
                    <div key={model.id} className="animate-in fade-in slide-in-from-left-4 duration-200">
                        <div className="relative bg-[#13161b]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-[0_0_50px_-10px_rgba(0,0,0,0.8)] max-w-xs ring-1 ring-white/5">
                            {/* Decorative Elements */}
                            <div className={`absolute top-0 left-0 w-1 h-full rounded-l-2xl ${isPrime ? 'bg-gradient-to-b from-purple-500 to-blue-500' : 'bg-gradient-to-b from-orange-500 to-red-500'}`}></div>
                            
                            {/* Header */}
                            <div className="flex items-center gap-3 mb-3 border-b border-white/5 pb-3">
                                <div className={`p-2 rounded-lg bg-white/5 ${model.themeColor}`}>
                                    {(() => { const I = Icons[model.icon as keyof typeof Icons]; return <I/> })()}
                                </div>
                                <div>
                                    <h4 className="text-white font-nasalization font-bold text-sm">{model.name}</h4>
                                    <span className={`text-[10px] font-mono uppercase tracking-wider ${isPrime ? 'text-green-400' : 'text-orange-400'}`}>
                                        {isPrime ? '● System Online' : '● System Offline'}
                                    </span>
                                </div>
                            </div>

                            {/* Body */}
                            <p className="text-xs text-gray-300 leading-relaxed font-exo mb-4">
                                {model.systemInstruction.split('.')[0] + '.'}
                                <br/><br/>
                                <span className="text-gray-500 italic text-[11px]">{model.description}</span>
                            </p>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-2">
                                {model.tools?.googleSearch && (
                                    <span className="text-[9px] px-2 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">Web Access</span>
                                )}
                                {model.tools?.googleMaps && (
                                    <span className="text-[9px] px-2 py-1 rounded bg-green-500/10 text-green-400 border border-green-500/20">Spatial Data</span>
                                )}
                                {model.useThinking && (
                                    <span className="text-[9px] px-2 py-1 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">Deep Logic</span>
                                )}
                                {model.isComingSoon && (
                                    <span className="text-[9px] px-2 py-1 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">Preview</span>
                                )}
                            </div>
                        </div>
                    </div>
                 );
             })}
         </div>
      )}

      {/* Confirmation Modal */}
      {pendingModel && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#13161b] border border-white/10 p-6 rounded-2xl shadow-2xl max-w-sm w-full relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500"></div>
            
            <h3 className="text-lg font-bold text-white mb-3 font-nasalization flex items-center gap-2">
              <span className="p-1 rounded bg-purple-500/10 text-purple-400">
                <Icons.Cpu />
              </span>
              Switch Neural Node?
            </h3>
            
            <p className="text-gray-400 text-sm mb-6 font-exo leading-relaxed">
              Switching to <strong className="text-white">{pendingModel.name}</strong> will change the responding persona. Current conversation context will be preserved.
            </p>

            <div className="flex gap-3 justify-end">
              <button 
                onClick={cancelSwitch}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmSwitch}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-lg hover:shadow-purple-500/20 transition-all"
              >
                Confirm Switch
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Sidebar Container */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-50
        w-[300px] md:w-[320px]
        bg-[#0f1115]/95 backdrop-blur-xl border-r border-white/5
        transform transition-transform duration-300 cubic-bezier(0.16, 1, 0.3, 1)
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        flex flex-col font-exo shadow-2xl md:shadow-none
        h-full
      `}>
        {/* Header / Logo */}
        <div className="h-16 md:h-20 px-5 md:px-6 border-b border-white/5 flex items-center justify-between relative bg-black/20">
          <div className="flex items-center gap-4">
            <div className="relative group cursor-pointer hover:scale-105 transition-transform duration-500">
              <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full group-hover:bg-purple-500/30 transition-all duration-500"></div>
              <div className="relative w-9 h-9 md:w-11 md:h-11 rounded-xl bg-gradient-to-b from-[#1a1d23] to-[#0f1115] border border-white/10 flex items-center justify-center p-1.5 shadow-lg">
                 <img 
                   src={OFFICIAL_LOGO_URI}
                   alt="ΔlieπFlΦw DAO Logo" 
                   className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(197,160,89,0.5)]" 
                 />
              </div>
            </div>
            
            <div className="flex flex-col justify-center">
              <h1 className="text-lg font-bold font-nasalization tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-purple-200 via-white to-purple-200 shadow-purple-500/50 drop-shadow-sm">
                AI TOR
              </h1>
              <span className="text-[9px] tracking-[0.35em] text-purple-400/80 uppercase font-nasalization">
                NEXUS
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative" ref={settingsRef}>
              <button 
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className={`p-2 rounded-lg transition-colors ${isSettingsOpen ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                <Icons.Settings />
              </button>

              {isSettingsOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-[#13161b] border border-white/10 shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-1">
                    <button
                        onClick={() => { onExportChat(); setIsSettingsOpen(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold uppercase tracking-wider text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all font-nasalization group text-left"
                    >
                        <Icons.Download />
                        Export Log
                    </button>
                    <button
                        onClick={() => { onClearChat(); setIsSettingsOpen(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold uppercase tracking-wider text-red-400 hover:bg-red-500/10 rounded-lg transition-all font-nasalization group text-left mt-1"
                    >
                        <Icons.Trash />
                        Reset System
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button onClick={toggleSidebar} className="md:hidden p-2 text-gray-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto px-4 md:px-5 py-6 space-y-8 custom-scrollbar">
          
          {/* Neural Memory / Authentication */}
          <div className="animate-in fade-in duration-700">
             <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-3 px-1 font-nasalization flex items-center gap-2 group cursor-pointer hover:text-purple-400 transition-colors">
              <Icons.History />
              Neural Memory
            </h2>
            
            {user ? (
                 // Logged In State (User Profile)
                 <div className="bg-[#1a1d23] border border-purple-500/30 rounded-2xl p-4 relative overflow-hidden group shadow-[0_0_20px_-10px_rgba(168,85,247,0.3)]">
                     <div className="absolute top-0 right-0 p-2 opacity-30 group-hover:opacity-50 transition-opacity">
                         <div className="w-20 h-20 bg-purple-500/30 blur-2xl rounded-full"></div>
                     </div>
                     <div className="flex items-center gap-3.5 mb-3.5 relative z-10">
                         <div className="w-11 h-11 rounded-full border-2 border-white/10 overflow-hidden shadow-lg ring-2 ring-purple-500/20">
                             <img src={user.avatar} className="w-full h-full object-cover" alt="User Avatar" />
                         </div>
                         <div className="overflow-hidden">
                             <div className="text-sm font-bold text-white font-roboto truncate tracking-wide">{user.name}</div>
                             <div className="text-[10px] text-gray-400 font-exo truncate opacity-80">{user.email}</div>
                             <div className="text-[9px] text-green-400 font-mono flex items-center gap-1.5 mt-1">
                                 <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                Link Active
                             </div>
                         </div>
                     </div>
                     <button 
                        onClick={onLogout}
                        className="w-full py-2 rounded-xl bg-white/5 text-gray-400 text-xs font-bold uppercase hover:bg-red-500/10 hover:text-red-400 transition-all flex items-center justify-center gap-2 border border-white/5 hover:border-red-500/20 relative z-10"
                     >
                        <Icons.LogOut /> Disconnect
                     </button>
                 </div>
            ) : (
                // Logged Out State (Google Button Container) - Restored Visuals
                <div className="bg-[#1a1d23] border border-white/5 rounded-2xl p-4 relative overflow-hidden group">
                     {/* Cyberpunk accents */}
                     <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-gray-600"></div>
                     <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-gray-600"></div>
                     <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-gray-600"></div>
                     <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-gray-600"></div>

                    <div className="text-[10px] text-gray-400 mb-4 leading-relaxed font-exo text-center">
                         Initialize secure authentication handshake to synchronize neural memory banks.
                    </div>
                    
                    {/* The Google Button Render Target */}
                    <div className="flex justify-center relative min-h-[44px]">
                         {/* The Real Button Container */}
                         <div id="google-btn-container" className="flex justify-center items-center w-full z-10"></div>
                         
                         {/* FALLBACK VISUAL BUTTON - Shows if Client ID is missing or loading */}
                         {(!isGoogleReady || !isClientIdConfigured) && (
                            <button 
                                className="absolute inset-0 z-0 flex items-center justify-center gap-3 bg-[#131314] hover:bg-[#1b1b1f] border border-[#747775] rounded-[4px] w-[240px] h-[40px] transition-colors mx-auto my-auto"
                                onClick={() => alert("AUTHENTICATION PROTOCOL INTERRUPTED:\n\nPlease update GOOGLE_CLIENT_ID in constants.tsx with your valid GCP OAuth Credential to enable the neural link.")}
                            >
                                <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                                    <svg viewBox="0 0 18 18" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9087c1.7018-1.5668 2.6836-3.874 2.6836-6.615z" fill="#4285F4"></path>
                                        <path d="M9 18c2.43 0 4.4673-.806 5.9564-2.1805l-2.9087-2.2581c-.8059.54-1.8368.859-3.0477.859-2.344 0-4.3282-1.5831-5.036-3.7104H.9574v2.3318C2.4382 15.9832 5.4818 18 9 18z" fill="#34A853"></path>
                                        <path d="M3.964 10.71c-.18-.54-.2822-1.1168-.2822-1.71s.1023-1.17.2823-1.71V4.9582H.9573C.3477 6.1732 0 7.5477 0 9s.3477 2.8268.9573 4.0418L3.964 10.71z" fill="#FBBC05"></path>
                                        <path d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5814C13.4632.8918 11.426 0 9 0 5.4818 0 2.4382 2.0168.9574 4.9582l3.0066 2.3318C4.6718 5.1627 6.656 3.5795 9 3.5795z" fill="#EA4335"></path>
                                    </svg>
                                </div>
                                <span className="text-[#e3e3e3] font-roboto font-medium text-sm tracking-wide">Sign in with Google</span>
                            </button>
                         )}
                    </div>
                </div>
            )}
            
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
          
          {/* Prime Section */}
          <div>
            <h2 className="text-[10px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 uppercase tracking-[0.2em] mb-4 px-1 font-nasalization flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
              </span>
              Active Nodes
            </h2>
            <div className="flex flex-col gap-1">
              {primeModels.map(model => renderModelButton(model, 'prime'))}
            </div>
          </div>

          {/* Simulation Section */}
          <div>
             <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-4 px-1 font-nasalization flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500/50"></span>
              Simulation Protocols
            </h2>
            <div className="flex flex-col gap-1">
              {simModels.map(model => renderModelButton(model, 'sim'))}
            </div>
          </div>

        </div>

        {/* Footer Info */}
        <div className="p-5 border-t border-white/5 bg-[#0a0c10] flex flex-col gap-3 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent"></div>
           
           <div className="flex items-center justify-between">
              <span className="text-[9px] text-gray-600 font-mono tracking-wider">SYS.VER.3.4.1</span>
              <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-[9px] text-green-500/80 font-bold tracking-widest">ONLINE</span>
              </div>
           </div>

           <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 font-nasalization tracking-widest truncate">
                 GAMMA OMEGA SIGMA ZETA
              </span>
              <span className="text-[9px] text-gray-700 font-exo flex items-center gap-2">
                 Encrypted Link • <span className="text-purple-500/50 font-mono">{latency}ms</span>
              </span>
           </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;