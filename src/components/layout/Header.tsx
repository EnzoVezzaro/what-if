import React from 'react';
import { Menu, X, History, TreePine } from 'lucide-react';
import { useTimelineStore } from '../../store/timelineStore';

interface HeaderProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ isSidebarOpen, toggleSidebar }) => {
  const resetTimeline = useTimelineStore(state => state.resetTimeline);
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-indigo-950 to-blue-900 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-full hover:bg-indigo-800 transition-colors"
            aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          <div className="flex items-center space-x-2">
            <TreePine size={24} className="text-blue-300" />
            <h1 className="text-xl font-bold">What If: The Timeline Explorer</h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={resetTimeline}
            className="flex items-center space-x-1 px-3 py-1.5 rounded bg-blue-800 hover:bg-blue-700 transition-colors"
          >
            <History size={16} />
            <span>Reset</span>
          </button>
          
          <button className="px-3 py-1.5 rounded bg-indigo-700 hover:bg-indigo-600 transition-colors">
            Share
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;