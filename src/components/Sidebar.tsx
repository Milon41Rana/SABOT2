import React, { useState } from 'react';
import {
  Plus,
  MessageSquare,
  Search,
  Trash2,
  Edit2,
  Pin,
  Check,
  X,
  Sparkles,
  ChevronDown,
  Settings,
  PanelLeftClose,
} from 'lucide-react';
import { ChatSession, Persona } from '../types';
import { DynamicIcon } from './Icons';

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string;
  personas: Persona[];
  activePersonaId: string;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onTogglePinSession: (id: string) => void;
  onSelectPersona: (id: string) => void;
  onOpenSettings: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  activeSessionId,
  personas,
  activePersonaId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onRenameSession,
  onTogglePinSession,
  onSelectPersona,
  onOpenSettings,
  isOpen,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [showPersonaSelector, setShowPersonaSelector] = useState(false);

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedSessions = filteredSessions.filter((s) => s.isPinned);
  const recentSessions = filteredSessions.filter((s) => !s.isPinned);

  const activePersona = personas.find((p) => p.id === activePersonaId) || personas[0];

  const handleStartRename = (e: React.MouseEvent, s: ChatSession) => {
    e.stopPropagation();
    setEditingId(s.id);
    setEditTitle(s.title);
  };

  const handleSaveRename = (e: React.MouseEvent | React.FormEvent, id: string) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      onRenameSession(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const renderSessionItem = (session: ChatSession) => {
    const isActive = session.id === activeSessionId;
    const isEditing = session.id === editingId;

    return (
      <div
        key={session.id}
        id={`session-item-${session.id}`}
        onClick={() => onSelectSession(session.id)}
        className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer text-xs transition-all ${
          isActive
            ? 'bg-zinc-800/90 text-zinc-100 font-medium shadow-xs border border-zinc-700/60'
            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850/60 border border-transparent'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <MessageSquare
            className={`w-3.5 h-3.5 flex-shrink-0 ${
              isActive ? 'text-indigo-400' : 'text-zinc-500 group-hover:text-zinc-400'
            }`}
          />

          {isEditing ? (
            <div className="flex items-center gap-1 flex-1 min-w-0" onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveRename(e, session.id);
                  if (e.key === 'Escape') setEditingId(null);
                }}
                autoFocus
                className="w-full bg-zinc-900 px-2 py-1 rounded text-xs text-zinc-100 border border-indigo-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={(e) => handleSaveRename(e, session.id)}
                className="p-1 text-emerald-400 hover:text-emerald-300"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleCancelRename}
                className="p-1 text-zinc-400 hover:text-zinc-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <span className="truncate flex-1">{session.title}</span>
          )}
        </div>

        {/* Action icons on hover */}
        {!isEditing && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onTogglePinSession(session.id);
              }}
              className={`p-1 rounded hover:bg-zinc-700 ${
                session.isPinned ? 'text-indigo-400 opacity-100' : 'text-zinc-400'
              }`}
              title={session.isPinned ? 'Unpin chat' : 'Pin chat'}
            >
              <Pin className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={(e) => handleStartRename(e, session)}
              className="p-1 rounded hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200"
              title="Rename chat"
            >
              <Edit2 className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteSession(session.id);
              }}
              className="p-1 rounded hover:bg-rose-950 hover:text-rose-400 text-zinc-400 transition-colors"
              title="Delete chat"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="app-sidebar"
        className={`fixed md:static inset-y-0 left-0 z-50 flex flex-col w-72 bg-zinc-900 border-r border-zinc-800 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between p-3.5 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-semibold text-sm text-zinc-100 tracking-tight">Chatbot</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onClose}
              className="md:hidden p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
              title="Close sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            id="btn-new-chat"
            type="button"
            onClick={() => {
              onNewSession();
              if (window.innerWidth < 768) onClose();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Persona Selector Dropdown */}
        <div className="px-3 pb-2">
          <div className="relative">
            <button
              id="btn-sidebar-persona"
              type="button"
              onClick={() => setShowPersonaSelector(!showPersonaSelector)}
              className="w-full flex items-center justify-between p-2 rounded-xl bg-zinc-850 hover:bg-zinc-800 border border-zinc-750 text-xs transition-colors"
            >
              <div className="flex items-center gap-2 truncate">
                <div
                  className={`w-5 h-5 rounded-md bg-gradient-to-br ${activePersona.badgeColor} flex items-center justify-center text-white text-[10px]`}
                >
                  <DynamicIcon name={activePersona.iconName} className="w-3 h-3" />
                </div>
                <span className="font-medium text-zinc-200 truncate">{activePersona.name}</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${showPersonaSelector ? 'rotate-180' : ''}`} />
            </button>

            {showPersonaSelector && (
              <div className="absolute top-full left-0 right-0 mt-1 p-1.5 bg-zinc-850 border border-zinc-700 rounded-xl shadow-xl z-20 space-y-1">
                {personas.map((persona) => (
                  <button
                    key={persona.id}
                    type="button"
                    onClick={() => {
                      onSelectPersona(persona.id);
                      setShowPersonaSelector(false);
                    }}
                    className={`w-full flex items-center gap-2 p-2 rounded-lg text-left text-xs transition-colors ${
                      persona.id === activePersonaId
                        ? 'bg-indigo-600/20 text-indigo-300 font-medium'
                        : 'text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md bg-gradient-to-br ${persona.badgeColor} flex items-center justify-center text-white flex-shrink-0`}
                    >
                      <DynamicIcon name={persona.iconName} className="w-3 h-3" />
                    </div>
                    <div className="truncate">
                      <div className="truncate font-medium">{persona.name}</div>
                      <div className="text-[10px] text-zinc-500 truncate">{persona.tagline}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Search Input for sessions */}
        {sessions.length > 2 && (
          <div className="px-3 pb-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chats..."
                className="w-full pl-8 pr-3 py-1.5 bg-zinc-850 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 border border-zinc-800 focus:outline-none focus:border-zinc-600"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto px-2 space-y-4 py-2">
          {pinnedSessions.length > 0 && (
            <div className="space-y-1">
              <div className="px-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-1">
                <Pin className="w-3 h-3 text-indigo-400" />
                <span>Pinned</span>
              </div>
              {pinnedSessions.map(renderSessionItem)}
            </div>
          )}

          <div className="space-y-1">
            <div className="px-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Recent Chats
            </div>
            {recentSessions.length === 0 && pinnedSessions.length === 0 ? (
              <div className="px-3 py-6 text-center text-xs text-zinc-500">
                No conversations yet. Start a new chat!
              </div>
            ) : (
              recentSessions.map(renderSessionItem)
            )}
          </div>
        </div>

        {/* Bottom Footer Actions */}
        <div className="p-3 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
          <button
            id="btn-open-settings"
            type="button"
            onClick={onOpenSettings}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
          >
            <Settings className="w-4 h-4 text-zinc-400" />
            <span>Settings</span>
          </button>

          <span className="text-[11px] text-zinc-500">
            {sessions.length} {sessions.length === 1 ? 'chat' : 'chats'}
          </span>
        </div>
      </aside>
    </>
  );
};
