import React from 'react';
import { Download, Play, RefreshCw, Copy, Check } from 'lucide-react';
import { DubResult } from '../types';

interface ResultCardProps {
  result: DubResult;
  onReset: () => void;
}

const ResultCard: React.FC<ResultCardProps> = ({ result, onReset }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(result.translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="bg-slate-800/80 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
        
        {/* Audio Player Section */}
        <div className="p-8 bg-gradient-to-b from-slate-800 to-slate-900 border-b border-slate-700">
          <div className="flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-20 h-20 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/30 animate-pulse">
               <Play className="w-8 h-8 text-white fill-current ml-1" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">¡Doblaje Completado!</h2>
              <p className="text-slate-400">Tu audio ha sido traducido y sintetizado al español.</p>
            </div>

            <audio 
              controls 
              src={result.audioUrl} 
              className="w-full max-w-md h-12 rounded-lg accent-indigo-500"
            />

            <div className="flex gap-4 pt-4">
              <a 
                href={result.audioUrl} 
                download="dub_espanol.wav"
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-all transform hover:scale-105 shadow-lg shadow-indigo-600/20"
              >
                <Download className="w-4 h-4" />
                Descargar Audio
              </a>
              <button 
                onClick={onReset}
                className="flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl font-medium transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Nuevo Doblaje
              </button>
            </div>
          </div>
        </div>

        {/* Transcript Section */}
        <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-700">
          {/* Original */}
          <div className="p-6 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Transcripción Original</h3>
            <p className="text-slate-300 leading-relaxed text-sm h-64 overflow-y-auto pr-2 custom-scrollbar">
              {result.originalText}
            </p>
          </div>

          {/* Translation */}
          <div className="p-6 space-y-4 bg-indigo-900/10">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-indigo-400">Traducción Español</h3>
              <button 
                onClick={handleCopy}
                className="text-slate-500 hover:text-white transition-colors p-1"
                title="Copiar texto"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-slate-100 leading-relaxed text-sm h-64 overflow-y-auto pr-2 custom-scrollbar">
              {result.translatedText}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ResultCard;