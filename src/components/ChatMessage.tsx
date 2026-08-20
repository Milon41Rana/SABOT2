import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Copy,
  Check,
  RotateCcw,
  Volume2,
  VolumeX,
  Globe,
  ExternalLink,
  Edit2,
  AlertCircle,
  Sparkles,
  User,
} from 'lucide-react';
import { Message, MessageImage } from '../types';
import { CodeBlock } from './CodeBlock';
import { DynamicIcon } from './Icons';

interface ChatMessageProps {
  message: Message;
  personaIcon?: string;
  personaColor?: string;
  isLast: boolean;
  onRegenerate?: () => void;
  onEdit?: (text: string) => void;
  onImageClick?: (image: MessageImage) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  personaIcon = 'Sparkles',
  personaColor = 'from-indigo-500 to-cyan-500',
  isLast,
  onRegenerate,
  onEdit,
  onImageClick,
}) => {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.text);

  const isUser = message.role === 'user';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy message', err);
    }
  };

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = message.text
      .replace(/```[\s\S]*?```/g, 'Code block omitted.')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/[*_~#]/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleSaveEdit = () => {
    if (onEdit && editText.trim()) {
      onEdit(editText.trim());
      setIsEditing(false);
    }
  };

  // Format timestamp (e.g., 2:45 PM)
  const timeFormatted = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      id={`message-${message.id}`}
      className={`group relative flex w-full gap-3 md:gap-4 px-3 md:px-6 py-4 transition-colors ${
        isUser ? 'bg-transparent' : 'bg-zinc-900/40 border-y border-zinc-800/40'
      }`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 pt-0.5">
        {isUser ? (
          <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 shadow-sm">
            <User className="w-4 h-4" />
          </div>
        ) : (
          <div
            className={`w-8 h-8 rounded-xl bg-gradient-to-br ${personaColor} flex items-center justify-center text-white shadow-md shadow-indigo-500/10`}
          >
            <DynamicIcon name={personaIcon} className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Message Content Body */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Header (Author + Timestamp) */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-200">
              {isUser ? 'You' : 'Gemini AI'}
            </span>
            <span className="text-[11px] text-zinc-500">{timeFormatted}</span>
          </div>
        </div>

        {/* Attached Images */}
        {message.images && message.images.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1 pb-2">
            {message.images.map((img) => (
              <div
                key={img.id}
                onClick={() => onImageClick?.(img)}
                className="relative group/img cursor-pointer rounded-xl overflow-hidden border border-zinc-700 bg-zinc-900 max-w-[200px] max-h-[160px] shadow-sm hover:border-indigo-500 transition-all"
                title="Click to view full size"
              >
                <img
                  src={img.data}
                  alt={img.name || 'Attachment'}
                  className="w-full h-full object-cover transition-transform group-hover/img:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity text-xs text-white font-medium">
                  Enlarge
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Text Content */}
        {isEditing ? (
          <div className="mt-2 space-y-2">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full p-3 bg-zinc-850 rounded-xl border border-indigo-500/60 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y min-h-[90px]"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
              >
                Save & Resend
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setEditText(message.text);
                }}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="text-zinc-200">
            {message.error ? (
              <div className="flex items-start gap-2 p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-300 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-medium text-rose-200">Generation Error</p>
                  <p className="text-xs text-rose-300/90">{message.text}</p>
                </div>
              </div>
            ) : isUser ? (
              <p className="text-sm md:text-[15px] leading-relaxed whitespace-pre-wrap text-zinc-100">
                {message.text}
              </p>
            ) : (
              <div className="markdown-body">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '');
                      const isInline = !match && !String(children).includes('\n');
                      if (isInline) {
                        return (
                          <code
                            className="px-1.5 py-0.5 mx-0.5 rounded-md bg-zinc-800 border border-zinc-700/60 text-indigo-300 text-[13px] font-mono"
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      }
                      return (
                        <CodeBlock
                          language={match ? match[1] : ''}
                          value={String(children).replace(/\n$/, '')}
                        />
                      );
                    },
                    a({ href, children }) {
                      return (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-0.5 text-indigo-400 hover:text-indigo-300 underline font-medium"
                        >
                          {children}
                          <ExternalLink className="w-3 h-3 inline" />
                        </a>
                      );
                    },
                  }}
                >
                  {message.text}
                </ReactMarkdown>
                {message.isStreaming && (
                  <span className="inline-block w-2 h-4 ml-1 align-middle bg-indigo-400 rounded-sm animate-cursor-blink" />
                )}
              </div>
            )}
          </div>
        )}

        {/* Google Search Grounding Sources */}
        {message.groundingChunks && message.groundingChunks.length > 0 && (
          <div className="mt-3 pt-2 border-t border-zinc-800/80">
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 mb-2">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-semibold text-zinc-300">Grounding Sources</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {message.groundingChunks.map((chunk, idx) => {
                if (!chunk.web?.uri) return null;
                return (
                  <a
                    key={idx}
                    href={chunk.web.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800/70 hover:bg-zinc-750 border border-zinc-700/60 text-xs text-zinc-300 hover:text-zinc-100 transition-colors shadow-xs"
                  >
                    <Globe className="w-3 h-3 text-cyan-400/80 flex-shrink-0" />
                    <span className="truncate max-w-[220px]">
                      {chunk.web.title || new URL(chunk.web.uri).hostname}
                    </span>
                    <ExternalLink className="w-2.5 h-2.5 text-zinc-500" />
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* Message Action Toolbar */}
        {!message.isStreaming && (
          <div className="flex items-center gap-1 pt-1 opacity-80 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
            <button
              id={`btn-copy-msg-${message.id}`}
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
              title="Copy text"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 text-[11px]">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Copy</span>
                </>
              )}
            </button>

            {!isUser && (
              <button
                id={`btn-speak-msg-${message.id}`}
                type="button"
                onClick={handleSpeak}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors ${
                  isSpeaking
                    ? 'text-indigo-400 bg-indigo-950/60'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                }`}
                title={isSpeaking ? 'Stop reading' : 'Read aloud'}
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5 animate-pulse" />
                    <span className="text-[11px]">Stop</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Read</span>
                  </>
                )}
              </button>
            )}

            {!isUser && isLast && onRegenerate && (
              <button
                id={`btn-regenerate-msg-${message.id}`}
                type="button"
                onClick={onRegenerate}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                title="Regenerate response"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="text-[11px]">Regenerate</span>
              </button>
            )}

            {isUser && onEdit && (
              <button
                id={`btn-edit-msg-${message.id}`}
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                title="Edit message"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span className="text-[11px]">Edit</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
