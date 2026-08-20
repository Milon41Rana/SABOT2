import React, { useState } from 'react';
import {
  X,
  Sliders,
  Sparkles,
  Bot,
  Globe,
  Database,
  Trash2,
  Download,
  Check,
  Info,
} from 'lucide-react';
import { AppSettings, ChatSession, Persona } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  activePersona: Persona;
  customSystemPrompt?: string;
  onUpdateCustomSystemPrompt: (prompt: string) => void;
  sessions: ChatSession[];
  onClearAllData: () => void;
  onExportAllData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  activePersona,
  customSystemPrompt,
  onUpdateCustomSystemPrompt,
  sessions,
  onClearAllData,
  onExportAllData,
}) => {
  const [activeTab, setActiveTab] = useState<'model' | 'persona' | 'data'>('model');
  const [tempPrompt, setTempPrompt] = useState(
    customSystemPrompt !== undefined ? customSystemPrompt : activePersona.systemPrompt
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSavePersonaPrompt = () => {
    onUpdateCustomSystemPrompt(tempPrompt);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleResetToDefaultPrompt = () => {
    setTempPrompt(activePersona.systemPrompt);
    onUpdateCustomSystemPrompt(activePersona.systemPrompt);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const totalMessages = sessions.reduce((acc, s) => acc + s.messages.length, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div
        id="settings-modal"
        className="relative w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-950/40">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-400" />
            <h2 className="font-semibold text-base text-zinc-100">Settings & Configuration</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-zinc-800 px-5 bg-zinc-950/20 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('model')}
            className={`py-3 px-3 border-b-2 font-medium transition-colors ${
              activeTab === 'model'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Model & Parameters
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('persona')}
            className={`py-3 px-3 border-b-2 font-medium transition-colors ${
              activeTab === 'persona'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            System Persona
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('data')}
            className={`py-3 px-3 border-b-2 font-medium transition-colors ${
              activeTab === 'data'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Data & Privacy
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-sm">
          {activeTab === 'model' && (
            <div className="space-y-5">
              {/* Model Choice */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  AI Model
                </label>
                <select
                  value={settings.defaultModel}
                  onChange={(e) => onUpdateSettings({ defaultModel: e.target.value })}
                  className="w-full bg-zinc-850 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="gemini-3.1-flash-lite">⚡ Gemini 3.1 Flash Lite (Ultra Low Latency & High Speed)</option>
                  <option value="gemini-3.7-flash">Gemini 3.7 Flash (Hybrid)</option>
                </select>
                <p className="mt-1 text-[11px] text-indigo-400/80">
                  ⚡ Locked to Gemini 3.1 Flash Lite for ultra-fast Netlify serverless execution.
                </p>
              </div>

              {/* Temperature Slider */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-zinc-300">
                    Creativity (Temperature): {settings.defaultTemperature}
                  </label>
                  <span className="text-[11px] text-zinc-500">
                    {settings.defaultTemperature < 0.4
                      ? 'Precise & Direct'
                      : settings.defaultTemperature > 0.9
                      ? 'Creative & Brainstorming'
                      : 'Balanced'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.5"
                  step="0.05"
                  value={settings.defaultTemperature}
                  onChange={(e) =>
                    onUpdateSettings({ defaultTemperature: parseFloat(e.target.value) })
                  }
                  className="w-full accent-indigo-500 bg-zinc-800 rounded-lg cursor-pointer h-2"
                />
              </div>

              {/* Default Web Search */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-850/70 border border-zinc-800">
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Enable Search Grounding by Default</span>
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    Automatically ground answers with up-to-date Google Search sources.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.defaultUseSearch}
                  onChange={(e) => onUpdateSettings({ defaultUseSearch: e.target.checked })}
                  className="w-4 h-4 rounded accent-indigo-500"
                />
              </div>
            </div>
          )}

          {activeTab === 'persona' && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-zinc-300">
                    Custom System Instructions ({activePersona.name})
                  </label>
                  <button
                    type="button"
                    onClick={handleResetToDefaultPrompt}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300"
                  >
                    Reset to Default
                  </button>
                </div>
                <textarea
                  value={tempPrompt}
                  onChange={(e) => setTempPrompt(e.target.value)}
                  rows={6}
                  placeholder="Define custom behavior, tone, style, guidelines..."
                  className="w-full p-3 bg-zinc-850 border border-zinc-700 rounded-xl text-xs font-mono text-zinc-200 focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleSavePersonaPrompt}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors"
                >
                  {savedSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Saved Instructions</span>
                    </>
                  ) : (
                    <span>Save Instructions</span>
                  )}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-zinc-850/60 border border-zinc-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
                  <Database className="w-4 h-4 text-indigo-400" />
                  <span>Storage Overview</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-zinc-900/80 border border-zinc-800">
                    <div className="text-zinc-500 text-[10px]">Saved Chats</div>
                    <div className="text-sm font-semibold text-zinc-100">{sessions.length}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-zinc-900/80 border border-zinc-800">
                    <div className="text-zinc-500 text-[10px]">Total Messages</div>
                    <div className="text-sm font-semibold text-zinc-100">{totalMessages}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={onExportAllData}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-850 hover:bg-zinc-800 border border-zinc-700 text-xs font-medium text-zinc-200 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Export All Chats as JSON Backup</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Are you sure you want to delete all saved conversations? This cannot be undone.')) {
                      onClearAllData();
                      onClose();
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-950/70 border border-rose-800/60 text-xs font-medium text-rose-300 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>Clear All Saved Conversations</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-800 bg-zinc-950/40 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
