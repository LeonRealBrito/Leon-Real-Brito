import React from 'react';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';

interface ProcessingStepProps {
  label: string;
  isCompleted: boolean;
  isActive: boolean;
  isError?: boolean;
}

export const ProcessingStep: React.FC<ProcessingStepProps> = ({ label, isCompleted, isActive, isError }) => {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-300 ${
      isActive 
        ? 'bg-indigo-500/10 border-indigo-500/30' 
        : isCompleted 
          ? 'bg-emerald-500/5 border-emerald-500/20' 
          : 'bg-slate-800/50 border-slate-700'
    }`}>
      <div className="shrink-0">
        {isError ? (
          <div className="w-5 h-5 rounded-full border-2 border-red-500 flex items-center justify-center">
             <span className="block w-2 h-2 bg-red-500 rounded-full" />
          </div>
        ) : isCompleted ? (
          <CheckCircle2 className="w-6 h-6 text-emerald-400" />
        ) : isActive ? (
          <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
        ) : (
          <Circle className="w-6 h-6 text-slate-600" />
        )}
      </div>
      <span className={`text-sm font-medium ${
        isActive ? 'text-indigo-200' : isCompleted ? 'text-emerald-200' : 'text-slate-500'
      }`}>
        {label}
      </span>
    </div>
  );
};