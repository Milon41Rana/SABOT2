import React, { useState, useEffect, useRef } from 'react';
import {
  Message,
  MessageImage,
  ChatSession,
  Persona,
  AppSettings,
} from './types';
import { DEFAULT_PERSONAS } from './data/personas';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { EmptyChatState } from './components/EmptyChatState';
import { SettingsModal } from './components/SettingsModal';
import { ImageViewerModal } from './components/ImageViewerModal';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { WifiOff } from 'lucide-react';

const STORAGE_KEY_SESSIONS = 'gemini_chatbot_sessions_v1';
const STORAGE_KEY_SETTINGS = 'gemini_chatbot_settings_v1';
const STORAGE_KEY_ACTIVE_ID = 'gemini_chatbot_active_id_v1';

const DEFAULT_SETTINGS: AppSettings = {
  defaultModel: 'gemini-3.1-flash-lite',
  defaultUseSearch: false,
  defaultTemperature: 0.7,
  defaultPersonaId: 'general',
  autoScroll: true,
  speechRate: 1.0,
  soundEffects: true,
  sendOnEnter: true,
};

function createInitialSession(personaId = 'general'): ChatSession {
  return {
    id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    title: 'New Chat',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages: [],
    personaId,
    useSearch: false,
    model: 'gemini-3.1-flash-lite',
    temperature: 0.7,
    isPinned: false,
  };
}

export default function App() {
  // Initialize state from local storage or defaults
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SESSIONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading sessions', e);
    }
    return [createInitialSession()];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    const savedId = localStorage.getItem(STORAGE_KEY_ACTIVE_ID);
    if (savedId && sessions.some((s) => s.id === savedId)) {
      return savedId;
    }
    return sessions[0]?.id || '';
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch (e) {
      console.error('Error loading settings', e);
    }
    return DEFAULT_SETTINGS;
  });

  const [isStreaming, setIsStreaming] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedImageForModal, setSelectedImageForModal] = useState<MessageImage | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Active session helper
  const activeSession =
    sessions.find((s) => s.id === activeSessionId) || sessions[0] || createInitialSession();

  const activePersona =
    DEFAULT_PERSONAS.find((p) => p.id === activeSession.personaId) || DEFAULT_PERSONAS[0];

  // Save sessions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
    } catch (e) {
      console.error('Error saving sessions to localStorage', e);
    }
  }, [sessions]);

  // Save settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving settings to localStorage', e);
    }
  }, [settings]);

  // Save active session ID
  useEffect(() => {
    if (activeSessionId) {
      localStorage.setItem(STORAGE_KEY_ACTIVE_ID, activeSessionId);
    }
  }, [activeSessionId]);

  // Auto-scroll on messages change
  useEffect(() => {
    if (settings.autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeSession.messages, isStreaming, settings.autoScroll]);

  // Update session helper
  const updateActiveSession = (updater: (prevSession: ChatSession) => ChatSession) => {
    setSessions((prevSessions) =>
      prevSessions.map((s) => {
        if (s.id === activeSession.id) {
          return updater(s);
        }
        return s;
      })
    );
  };

  // Create new session
  const handleNewSession = () => {
    if (isStreaming) {
      handleStopGeneration();
    }
    const newSession = createInitialSession(settings.defaultPersonaId);
    newSession.useSearch = settings.defaultUseSearch;
    newSession.temperature = settings.defaultTemperature;
    newSession.model = settings.defaultModel;

    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  // Delete session
  const handleDeleteSession = (id: string) => {
    if (sessions.length <= 1) {
      const fresh = createInitialSession(settings.defaultPersonaId);
      setSessions([fresh]);
      setActiveSessionId(fresh.id);
      return;
    }

    const filtered = sessions.filter((s) => s.id !== id);
    setSessions(filtered);
    if (activeSessionId === id) {
      setActiveSessionId(filtered[0]?.id || '');
    }
  };

  // Rename session
  const handleRenameSession = (id: string, newTitle: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title: newTitle, updatedAt: Date.now() } : s))
    );
  };

  // Toggle pin session
  const handleTogglePinSession = (id: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isPinned: !s.isPinned } : s))
    );
  };

  // Switch persona
  const handleSelectPersona = (personaId: string) => {
    updateActiveSession((prev) => ({
      ...prev,
      personaId,
      updatedAt: Date.now(),
    }));
  };

  // Toggle search grounding
  const handleToggleSearch = () => {
    updateActiveSession((prev) => ({
      ...prev,
      useSearch: !prev.useSearch,
      updatedAt: Date.now(),
    }));
  };

  // Clear messages in active session
  const handleClearSession = () => {
    if (confirm('Clear all messages in this conversation?')) {
      updateActiveSession((prev) => ({
        ...prev,
        messages: [],
        updatedAt: Date.now(),
      }));
    }
  };

  // Stop generation
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);

    // Turn off isStreaming flag in the last message
    updateActiveSession((prev) => {
      const messages = [...prev.messages];
      if (messages.length > 0 && messages[messages.length - 1].isStreaming) {
        messages[messages.length - 1] = {
          ...messages[messages.length - 1],
          isStreaming: false,
        };
      }
      return { ...prev, messages };
    });
  };

  // Send message and stream response
  const handleSendMessage = async (text: string, images: MessageImage[] = []) => {
    if ((!text.trim() && images.length === 0) || isStreaming) return;

    const userMessageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const assistantMessageId = `msg_${Date.now() + 1}_${Math.random().toString(36).substr(2, 6)}`;

    const newUserMessage: Message = {
      id: userMessageId,
      role: 'user',
      text,
      images: images.length > 0 ? images : undefined,
      timestamp: Date.now(),
    };

    const initialAssistantMessage: Message = {
      id: assistantMessageId,
      role: 'model',
      text: '',
      timestamp: Date.now() + 1,
      isStreaming: true,
    };

    // Prepare updated message list
    const currentMessages = [...activeSession.messages, newUserMessage];
    const isFirstMessage = activeSession.messages.length === 0;

    // Immediately update UI with user message + placeholder assistant message
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSession.id) {
          return {
            ...s,
            messages: [...currentMessages, initialAssistantMessage],
            updatedAt: Date.now(),
          };
        }
        return s;
      })
    );

    setIsStreaming(true);

    // Auto-generate title if first message
    if (isFirstMessage && text.trim()) {
      fetch('/api/generate-title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstMessage: text }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.title) {
            handleRenameSession(activeSession.id, data.title);
          }
        })
        .catch((err) => console.error('Title generation failed', err));
    }

    // Set up AbortController
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const persona =
        DEFAULT_PERSONAS.find((p) => p.id === activeSession.personaId) || DEFAULT_PERSONAS[0];
      const systemInstruction = activeSession.customSystemPrompt || persona.systemPrompt;

      const payload = {
        messages: currentMessages,
        systemInstruction,
        useSearch: activeSession.useSearch,
        model: activeSession.model || settings.defaultModel,
        temperature: activeSession.temperature ?? settings.defaultTemperature,
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');

      if (!reader) {
        throw new Error('Response body is unavailable.');
      }

      let accumulatedText = '';
      let accumulatedGroundings: any[] = [];
      let accumulatedQueries: string[] = [];
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith('data: ')) {
            const dataStr = trimmedLine.slice(6);
            if (dataStr === '[DONE]') {
              continue;
            }

            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.error) {
                throw new Error(parsed.error);
              }

              if (parsed.text) {
                accumulatedText += parsed.text;
              }
              if (parsed.groundingChunks && Array.isArray(parsed.groundingChunks)) {
                accumulatedGroundings = [...accumulatedGroundings, ...parsed.groundingChunks];
              }
              if (parsed.webSearchQueries && Array.isArray(parsed.webSearchQueries)) {
                accumulatedQueries = [...accumulatedQueries, ...parsed.webSearchQueries];
              }

              // Update the assistant message in session
              setSessions((prevSessions) =>
                prevSessions.map((s) => {
                  if (s.id === activeSession.id) {
                    const msgs = [...s.messages];
                    const targetIdx = msgs.findIndex((m) => m.id === assistantMessageId);
                    if (targetIdx !== -1) {
                      msgs[targetIdx] = {
                        ...msgs[targetIdx],
                        text: accumulatedText,
                        groundingChunks:
                          accumulatedGroundings.length > 0
                            ? accumulatedGroundings
                            : msgs[targetIdx].groundingChunks,
                        webSearchQueries:
                          accumulatedQueries.length > 0
                            ? accumulatedQueries
                            : msgs[targetIdx].webSearchQueries,
                        isStreaming: true,
                      };
                    }
                    return { ...s, messages: msgs };
                  }
                  return s;
                })
              );
            } catch (e: any) {
              console.error('Error parsing SSE chunk', e);
            }
          }
        }
      }

      // Stream completed normally
      setSessions((prevSessions) =>
        prevSessions.map((s) => {
          if (s.id === activeSession.id) {
            const msgs = [...s.messages];
            const targetIdx = msgs.findIndex((m) => m.id === assistantMessageId);
            if (targetIdx !== -1) {
              msgs[targetIdx] = {
                ...msgs[targetIdx],
                isStreaming: false,
              };
            }
            return { ...s, messages: msgs };
          }
          return s;
        })
      );
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Stream generation was aborted by user.');
      } else {
        console.error('Chat error:', err);
        setSessions((prevSessions) =>
          prevSessions.map((s) => {
            if (s.id === activeSession.id) {
              const msgs = [...s.messages];
              const targetIdx = msgs.findIndex((m) => m.id === assistantMessageId);
              if (targetIdx !== -1) {
                msgs[targetIdx] = {
                  ...msgs[targetIdx],
                  text: err.message || 'Failed to generate response. Please try again.',
                  error: true,
                  isStreaming: false,
                };
              }
              return { ...s, messages: msgs };
            }
            return s;
          })
        );
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  // Regenerate last response
  const handleRegenerate = () => {
    if (isStreaming || activeSession.messages.length === 0) return;

    const msgs = [...activeSession.messages];
    const lastMsg = msgs[msgs.length - 1];

    if (lastMsg.role === 'model') {
      // Remove last assistant message
      const trimmedMessages = msgs.slice(0, -1);
      const lastUserMsg = trimmedMessages[trimmedMessages.length - 1];

      if (lastUserMsg && lastUserMsg.role === 'user') {
        // Rollback session to before the last model response
        updateActiveSession((prev) => ({
          ...prev,
          messages: trimmedMessages.slice(0, -1),
        }));

        // Resend the user message
        handleSendMessage(lastUserMsg.text, lastUserMsg.images || []);
      }
    }
  };

  // Edit user message and resend from that point
  const handleEditMessage = (msgId: string, newText: string) => {
    if (isStreaming) return;

    const targetIdx = activeSession.messages.findIndex((m) => m.id === msgId);
    if (targetIdx === -1) return;

    const targetMsg = activeSession.messages[targetIdx];
    const sliced = activeSession.messages.slice(0, targetIdx);

    updateActiveSession((prev) => ({
      ...prev,
      messages: sliced,
    }));

    handleSendMessage(newText, targetMsg.images || []);
  };

  // Export conversation as Markdown (.md)
  const handleExportMarkdown = () => {
    if (activeSession.messages.length === 0) return;

    let mdContent = `# ${activeSession.title}\n\n`;
    mdContent += `*Date: ${new Date(activeSession.createdAt).toLocaleString()}*\n`;
    mdContent += `*Model: ${activeSession.model || settings.defaultModel}*\n\n---\n\n`;

    activeSession.messages.forEach((msg) => {
      const author = msg.role === 'user' ? '### 👤 User' : `### 🤖 Gemini AI (${activePersona.name})`;
      mdContent += `${author}\n\n${msg.text}\n\n`;

      if (msg.groundingChunks && msg.groundingChunks.length > 0) {
        mdContent += `**Sources:**\n`;
        msg.groundingChunks.forEach((chunk) => {
          if (chunk.web?.uri) {
            mdContent += `- [${chunk.web.title || chunk.web.uri}](${chunk.web.uri})\n`;
          }
        });
        mdContent += `\n`;
      }

      mdContent += `---\n\n`;
    });

    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeSession.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export conversation as JSON
  const handleExportJSON = () => {
    if (activeSession.messages.length === 0) return;

    const blob = new Blob([JSON.stringify(activeSession, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeSession.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export all sessions as backup JSON
  const handleExportAllData = () => {
    const backup = {
      version: 1,
      exportDate: new Date().toISOString(),
      sessions,
      settings,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gemini_chatbot_backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Clear all data
  const handleClearAllData = () => {
    const fresh = createInitialSession(settings.defaultPersonaId);
    setSessions([fresh]);
    setActiveSessionId(fresh.id);
    localStorage.removeItem(STORAGE_KEY_SESSIONS);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100">
      {/* Sidebar Navigation */}
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSession.id}
        personas={DEFAULT_PERSONAS}
        activePersonaId={activeSession.personaId}
        onSelectSession={(id) => {
          if (isStreaming) handleStopGeneration();
          setActiveSessionId(id);
        }}
        onNewSession={handleNewSession}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        onTogglePinSession={handleTogglePinSession}
        onSelectPersona={handleSelectPersona}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Chat Workspace */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-zinc-950 relative">
        {/* Offline Status Alert Banner */}
        {!isOnline && (
          <div
            id="offline-status-banner"
            className="w-full bg-amber-500/10 border-b border-amber-500/30 text-amber-300 text-xs px-4 py-2 flex items-center justify-center gap-2 backdrop-blur-sm z-30"
          >
            <WifiOff className="w-3.5 h-3.5 animate-pulse text-amber-400" />
            <span>
              <strong>অফলাইন মোড:</strong> আপনি বর্তমানে ইন্টারনেট সংযোগ ছাড়া আছেন। পূর্বে সংরক্ষিত চ্যাট হিস্টোরি অ্যাক্সেস করতে পারবেন।
            </span>
          </div>
        )}

        {/* Top Header */}
        <Header
          session={activeSession}
          activePersona={activePersona}
          personas={DEFAULT_PERSONAS}
          onSelectPersona={handleSelectPersona}
          onToggleSearch={handleToggleSearch}
          onClearSession={handleClearSession}
          onExportMarkdown={handleExportMarkdown}
          onExportJSON={handleExportJSON}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
          onRenameSession={(title) => handleRenameSession(activeSession.id, title)}
        />

        {/* Message Stream Area */}
        <main id="chat-messages-container" className="flex-1 overflow-y-auto">
          {activeSession.messages.length === 0 ? (
            <EmptyChatState
              persona={activePersona}
              onSelectPrompt={(prompt) => handleSendMessage(prompt)}
              useSearch={activeSession.useSearch}
            />
          ) : (
            <div className="max-w-4xl mx-auto divide-y divide-zinc-800/40">
              {activeSession.messages.map((message, idx) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  personaIcon={activePersona.iconName}
                  personaColor={activePersona.badgeColor}
                  isLast={idx === activeSession.messages.length - 1}
                  onRegenerate={handleRegenerate}
                  onEdit={(newText) => handleEditMessage(message.id, newText)}
                  onImageClick={(img) => setSelectedImageForModal(img)}
                />
              ))}
              <div ref={messagesEndRef} className="h-6" />
            </div>
          )}
        </main>

        {/* Bottom Floating Input Field */}
        <div className="p-3 md:p-4 bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-transparent">
          <div className="max-w-4xl mx-auto">
            <ChatInput
              onSendMessage={handleSendMessage}
              onStopGeneration={handleStopGeneration}
              isStreaming={isStreaming}
              useSearch={activeSession.useSearch}
              onToggleSearch={handleToggleSearch}
              placeholder={`Message ${activePersona.name}... (Press Enter to send, Shift+Enter for new line)`}
            />
            <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-500 px-1">
              <span className="truncate">Gemini may produce inaccurate information. Verify critical facts.</span>
              <span className="hidden sm:inline-flex items-center gap-1 text-indigo-400/80 font-medium shrink-0 ml-2">
                <span>⚡ Gemini 3.1 Flash Lite</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(newSettings) => setSettings((prev) => ({ ...prev, ...newSettings }))}
        activePersona={activePersona}
        customSystemPrompt={activeSession.customSystemPrompt}
        onUpdateCustomSystemPrompt={(prompt) =>
          updateActiveSession((prev) => ({ ...prev, customSystemPrompt: prompt }))
        }
        sessions={sessions}
        onClearAllData={handleClearAllData}
        onExportAllData={handleExportAllData}
      />

      {/* Image Preview Modal */}
      <ImageViewerModal
        image={selectedImageForModal}
        onClose={() => setSelectedImageForModal(null)}
      />

      {/* PWA App Install Banner Prompt */}
      <PWAInstallPrompt />
    </div>
  );
}
