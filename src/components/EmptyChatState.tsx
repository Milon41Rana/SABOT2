import React from 'react';
import { Sparkles, ArrowRight, Bot, Search, Zap, Code, ShieldCheck } from 'lucide-react';
import { Persona } from '../types';
import { DynamicIcon } from './Icons';

interface EmptyChatStateProps {
  persona: Persona;
  onSelectPrompt: (prompt: string) => void;
  useSearch: boolean;
}

export const EmptyChatState: React.FC<EmptyChatStateProps> = ({
  persona,
  onSelectPrompt,
  useSearch,
}) => {
  return (
    <div id="empty-chat-state" className="flex flex-col items-center justify-center min-h-[60vh] max-w-3xl mx-auto px-4 py-8 text-center">
      {/* Persona Hero Icon */}
      <div
        className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${persona.badgeColor} p-0.5 shadow-xl shadow-indigo-500/10 mb-4 flex items-center justify-center text-white`}
      >
        <div className="w-full h-full bg-zinc-950/40 rounded-[14px] flex items-center justify-center backdrop-blur-xs">
          <DynamicIcon name={persona.iconName} className="w-7 h-7" />
        </div>
      </div>

      {/* Hero Headings */}
      <h1 className="text-xl md:text-2xl font-bold text-zinc-100 tracking-tight mb-2">
        {persona.name}
      </h1>
      <p className="text-sm text-zinc-400 max-w-md mb-6 leading-relaxed">
        {persona.description}
      </p>

      {/* Feature Badges */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8 text-xs text-zinc-400">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Gemini 3.7 Flash</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800">
          <Search className="w-3.5 h-3.5 text-cyan-400" />
          <span>Search Grounding {useSearch ? '(Active)' : '(Available)'}</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Multimodal Vision</span>
        </div>
      </div>

      {/* Suggested Starter Prompts Grid */}
      <div className="w-full space-y-2 text-left">
        <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider px-1">
          Suggested Starters
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {persona.suggestedStarters.map((starter, idx) => (
            <button
              key={idx}
              id={`btn-starter-${idx}`}
              type="button"
              onClick={() => onSelectPrompt(starter)}
              className="group flex items-start justify-between p-3.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-left transition-all duration-200 shadow-xs"
            >
              <span className="text-xs md:text-sm text-zinc-300 group-hover:text-zinc-100 leading-snug pr-2">
                {starter}
              </span>
              <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-indigo-400 flex-shrink-0 mt-0.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
