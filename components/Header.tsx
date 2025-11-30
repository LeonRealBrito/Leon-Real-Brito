import React from 'react';
import { Mic2, Languages } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="w-full p-6 flex items-center justify-between border-b border-slate-700 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg shadow-purple-500/20">
          <Languages className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">EcoDub <span className="text-indigo-400">AI</span></h1>
          <p className="text-xs text-slate-400">Doblaje inteligente al Español</p>
        </div>
      </div>
      <a 
        href="#" 
        className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
      >
        <Mic2 className="w-4 h-4" />
        <span>Powered by Gemini 2.5</span>
      </a>
    </header>
  );
};

export default Header;