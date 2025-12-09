import React from 'react';
import { MODELS, Icons } from '../constants';
import { ModelId } from '../types';

interface SidebarProps {
  activeModel: ModelId;
  onSelectModel: (id: ModelId) => void;
  onClearChat: () => void;
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeModel, onSelectModel, onClearChat, isOpen, toggleSidebar }) => {
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
        flex flex-col
      `}>
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
              AI
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              AITor
            </h1>
          </div>
          {/* Mobile close button */}
          <button onClick={toggleSidebar} className="md:hidden text-gray-400">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-2">
              Select Model
            </h2>
            <div className="space-y-2">
              {Object.values(MODELS).map((model) => {
                const Icon = Icons[model.icon as keyof typeof Icons];
                const isActive = activeModel === model.id;
                
                return (
                  <button
                    key={model.id}
                    onClick={() => {
                      onSelectModel(model.id);
                      if (window.innerWidth < 768) toggleSidebar();
                    }}
                    className={`
                      w-full text-left p-3 rounded-xl transition-all duration-200
                      flex items-start gap-3 group border
                      ${isActive 
                        ? 'bg-gray-800 border-gray-700 shadow-lg' 
                        : 'bg-transparent border-transparent hover:bg-gray-800/50 hover:border-gray-800'}
                    `}
                  >
                    <div className={`mt-0.5 ${isActive ? model.themeColor : 'text-gray-400 group-hover:text-gray-200'}`}>
                      <Icon />
                    </div>
                    <div>
                      <div className={`font-medium text-sm ${isActive ? 'text-white' : 'text-gray-300'}`}>
                        {model.name}
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

        <div className="p-4 border-t border-gray-800">
          <button
            onClick={onClearChat}
            className="w-full flex items-center justify-center gap-2 p-3 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
          >
            <Icons.Trash />
            Clear Conversation
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
