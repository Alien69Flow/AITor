import React from 'react';
import { MODELS, Icons } from '../constants';
import { ModelId } from '../types';

interface SidebarProps {
  activeModel: ModelId;
  onSelectModel: (id: ModelId) => void;
  onClearChat: () => void;
  onExportChat: () => void;
  isOpen: boolean;
  toggleSidebar: () => void;
  hasActiveChat?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeModel, 
  onSelectModel, 
  onClearChat, 
  onExportChat, 
  isOpen, 
  toggleSidebar,
  hasActiveChat = false
}) => {
  // Official AlienFlow DAO Logo recreated as SVG Data URI
  const OFFICIAL_LOGO_URI = `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120" fill="none">
      <!-- Golden Roof / Chevron -->
      <path d="M10 25 L50 5 L90 25" stroke="#C5A059" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      
      <!-- Green Emblem (Abstract UN/Globe Style) -->
      <circle cx="50" cy="45" r="14" stroke="#4CAF50" stroke-width="1.5"/>
      <path d="M50 31 V59 M36 45 H64" stroke="#4CAF50" stroke-width="1" opacity="0.8"/>
      <path d="M40 38 C45 35 55 35 60 38" stroke="#4CAF50" stroke-width="1" stroke-linecap="round"/>
      <path d="M40 52 C45 55 55 55 60 52" stroke="#4CAF50" stroke-width="1" stroke-linecap="round"/>
      <!-- Laurels Abstract -->
      <path d="M30 35 Q20 45 30 55 M70 35 Q80 45 70 55" stroke="#4CAF50" stroke-width="1.5" fill="none"/>

      <!-- Golden Hourglass -->
      <path d="M30 70 L70 70 L50 90 L30 70 Z" stroke="#C5A059" stroke-width="1.5" fill="none"/>
      <path d="M30 110 L70 110 L50 90 L30 110 Z" stroke="#C5A059" stroke-width="1.5" fill="none"/>
      
      <!-- UFO & Beam -->
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

  const handleModelClick = (e: React.MouseEvent, modelId: ModelId, modelName: string) => {
    e.preventDefault(); // Prevent any default button behavior
    
    if (activeModel === modelId) {
      if (window.innerWidth < 768) toggleSidebar();
      return;
    }

    // If there is an active chat, ask for confirmation
    if (hasActiveChat) {
      const confirmed = window.confirm(`Switch active neural node to ${modelName}? \n\nCurrent conversation context will be preserved, but the responding persona will change.`);
      if (!confirmed) return;
    }
    
    // Always call onSelectModel to ensure the parent state is updated
    onSelectModel(modelId);
    
    // Close sidebar on mobile
    if (window.innerWidth < 768) {
      toggleSidebar();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={toggleSidebar}
      />
      
      {/* Sidebar Content */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-50
        w-72 bg-[#13161b] border-r border-gray-800
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        flex flex-col font-exo
      `}>
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo Container */}
            <div className="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center bg-[#0a0c10] border border-purple-500/30 p-1">
               <img 
                 src={OFFICIAL_LOGO_URI}
                 alt="ΔlieπFlΦw DAO Logo" 
                 className="w-full h-full object-contain" 
               />
            </div>
            
            <div>
              <h1 className="text-lg font-bold font-nasalization bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400">
                ΔlieπFlΦw
              </h1>
              <span className="text-[10px] tracking-[0.2em] text-gray-400 uppercase block font-nasalization">
                DAO
              </span>
            </div>
          </div>
          {/* Mobile close button */}
          <button onClick={toggleSidebar} className="md:hidden text-gray-400 hover:text-white">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div>
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 px-2 font-nasalization">
              Neural Nodes
            </h2>
            <div className="space-y-2">
              {Object.values(MODELS).map((model) => {
                const Icon = Icons[model.icon as keyof typeof Icons];
                const isActive = activeModel === model.id;
                const isComingSoon = model.isComingSoon;
                
                return (
                  <button
                    key={model.id}
                    onClick={(e) => handleModelClick(e, model.id, model.name)}
                    className={`
                      w-full text-left p-3 rounded-xl transition-all duration-200
                      flex items-start gap-3 group border cursor-pointer
                      ${isActive 
                        ? 'bg-gray-800 border-gray-700 shadow-lg shadow-purple-900/10' 
                        : 'bg-transparent border-transparent hover:bg-gray-800/50 hover:border-gray-800'}
                      ${isComingSoon ? 'opacity-70' : 'opacity-100'}
                    `}
                    aria-pressed={isActive}
                  >
                    <div className={`mt-0.5 ${isActive ? model.themeColor : 'text-gray-400 group-hover:text-gray-200'}`}>
                      <Icon />
                    </div>
                    <div>
                      <div className={`font-medium text-sm flex items-center gap-2 ${isActive ? 'text-white' : 'text-gray-300'} font-exo`}>
                        {model.name}
                        {isComingSoon && <span className="text-[8px] font-bold bg-yellow-900/50 text-yellow-500 px-1.5 py-0.5 rounded border border-yellow-900">SOON</span>}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5 leading-snug">
                        {model.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-800 space-y-2">
          <button
            onClick={onExportChat}
            className="w-full flex items-center justify-center gap-2 p-3 text-sm font-medium text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded-lg transition-colors font-exo"
          >
            <Icons.Download />
            Export Data
          </button>
          
          <button
            onClick={onClearChat}
            className="w-full flex items-center justify-center gap-2 p-3 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors font-exo"
          >
            <Icons.Trash />
            Reset Protocol
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;