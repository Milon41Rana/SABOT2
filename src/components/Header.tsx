import React, { useState } from 'react';
import {
  Menu,
  PanelLeftOpen,
  Globe,
  Download,
  Trash2,
  Settings,
  ChevronDown,
  Sparkles,
  Check,
  Edit2,
  FileDown,
  Code,
} from 'lucide-react';
import { ChatSession, Persona } from '../types';
import { DynamicIcon } from './Icons';

interface HeaderProps {
  session: ChatSession;
  activePersona: Persona;
  personas: Persona[];
  onSelectPersona: (id: string) => void;
  onToggleSearch: () => void;
  onClearSession: () => void;
  onExportMarkdown: () => void;
  onExportJSON: () => void;
  onOpenSettings: () => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  onRenameSession: (title: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  session,
  activePersona,
  personas,
  onSelectPersona,
  onToggleSearch,
  onClearSession,
  onExportMarkdown,
  onExportJSON,
  onOpenSettings,
  onToggleSidebar,
  isSidebarOpen,
  onRenameSession,
}) => {
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(session.title);

  const handleSaveTitle = () => {
    if (titleInput.trim()) {
      onRenameSession(titleInput.trim());
    }
    setIsEditingTitle(false);
  };

  return (
    <header
      id="chat-header"
      className="sticky top-0 z-30 flex items-center justify-between px-3 md:px-5 py-2.5 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/80"
    >
      {/* Left: Sidebar Toggle + Title */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <button
          id="btn-sidebar-toggle"
          type="button"
          onClick={onToggleSidebar}
          className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-850 transition-colors"
          title={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          <PanelLeftOpen className="w-5 h-5" />
        </button>

        {/* Title / Persona info */}
        <div className="flex items-center gap-2 min-w-0">
          {isEditingTitle ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveTitle();
                  if (e.key === 'Escape') setIsEditingTitle(false);
                }}
                autoFocus
                className="bg-zinc-900 px-2 py-0.5 rounded-lg text-sm text-zinc-100 border border-indigo-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleSaveTitle}
                className="p-1 text-emerald-400 hover:text-emerald-300"
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 group cursor-pointer" onClick={() => {
              setTitleInput(session.title);
              setIsEditingTitle(true);
            }}>
              <span className="font-semibold text-sm md:text-base text-zinc-100 truncate max-w-[160px] sm:max-w-[240px] md:max-w-[340px]">
                {session.title}
              </span>
              <Edit2 className="w-3 h-3 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}
        </div>
      </div>

      {/* Right: Persona Dropdown, Search Grounding, Export, Clear, Settings */}
      <div className="flex items-center gap-1.5 md:gap-2">
        {/* Model Badge */}
        <div
          id="header-model-badge"
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border border-indigo-500/30 text-indigo-300 text-[11px] font-medium shadow-xs"
        >
          <span className="text-amber-400">⚡</span>
          <span>Gemini 3.1 Flash Lite</span>
        </div>

        {/* Persona Selector Pill */}
        <div className="relative">
          <button
            id="btn-header-persona"
            type="button"
            onClick={() => setShowPersonaMenu(!showPersonaMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-xs font-medium text-zinc-200 transition-colors shadow-xs"
          >
            <div
              className={`w-4 h-4 rounded-md bg-gradient-to-br ${activePersona.badgeColor} flex items-center justify-center text-white text-[9px]`}
            >
              <DynamicIcon name={activePersona.iconName} className="w-2.5 h-2.5" />
            </div>
            <span className="hidden sm:inline truncate max-w-[110px]">{activePersona.name}</span>
            <ChevronDown className="w-3 h-3 text-zinc-500" />
          </button>

          {showPersonaMenu && (
            <div className="absolute right-0 mt-1.5 w-60 p-1.5 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-40 space-y-1">
              <div className="px-2 py-1 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                Select Persona
              </div>
              {personas.map((persona) => (
                <button
                  key={persona.id}
                  type="button"
                  onClick={() => {
                    onSelectPersona(persona.id);
                    setShowPersonaMenu(false);
                  }}
                  className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-left text-xs transition-colors ${
                    persona.id === activePersona.id
                      ? 'bg-indigo-600/20 text-indigo-300 font-medium'
                      : 'text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-lg bg-gradient-to-br ${persona.badgeColor} flex items-center justify-center text-white flex-shrink-0`}
                  >
                    <DynamicIcon name={persona.iconName} className="w-3.5 h-3.5" />
                  </div>
                  <div className="truncate flex-1">
                    <div className="font-medium text-zinc-100">{persona.name}</div>
                    <div className="text-[10px] text-zinc-400 truncate">{persona.tagline}</div>
                  </div>
                  {persona.id === activePersona.id && (
                    <Check className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Web Search Grounding Toggle Indicator */}
        <button
          id="btn-header-search"
          type="button"
          onClick={onToggleSearch}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
            session.useSearch
              ? 'bg-cyan-950/90 text-cyan-300 border border-cyan-700/60 shadow-xs'
              : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:bg-zinc-850'
          }`}
          title={session.useSearch ? 'Search Grounding: On' : 'Search Grounding: Off'}
        >
          <Globe className={`w-3.5 h-3.5 ${session.useSearch ? 'text-cyan-400' : 'text-zinc-400'}`} />
          <span className="hidden lg:inline">{session.useSearch ? 'Search On' : 'Search Off'}</span>
        </button>

        {/* Export Chat Menu */}
        <div className="relative">
          <button
            id="btn-header-export"
            type="button"
            onClick={() => setShowExportMenu(!showExportMenu)}
            disabled={session.messages.length === 0}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Export conversation"
          >
            <Download className="w-4 h-4" />
          </button>

          {showExportMenu && (
            <div className="absolute right-0 mt-1.5 w-44 p-1.5 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-40 space-y-1">
              <button
                type="button"
                onClick={() => {
                  onExportMarkdown();
                  setShowExportMenu(false);
                }}
                className="w-full flex items-center gap-2 p-2 rounded-lg text-left text-xs text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800"
              >
                <FileDown className="w-3.5 h-3.5 text-indigo-400" />
                <span>Export as Markdown</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onExportJSON();
                  setShowExportMenu(false);
                }}
                className="w-full flex items-center gap-2 p-2 rounded-lg text-left text-xs text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800"
              >
                <Code className="w-3.5 h-3.5 text-cyan-400" />
                <span>Export as JSON</span>
              </button>
            </div>
          )}
        </div>

        {/* Clear Messages */}
        <button
          id="btn-header-clear"
          type="button"
          onClick={onClearSession}
          disabled={session.messages.length === 0}
          className="p-2 rounded-xl bg-zinc-900 hover:bg-rose-950/60 border border-zinc-800 hover:border-rose-800/60 text-zinc-400 hover:text-rose-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Clear messages in this chat"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        {/* Settings Button */}
        <button
          id="btn-header-settings"
          type="button"
          onClick={onOpenSettings}
          className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
          title="Settings & Personalization"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
