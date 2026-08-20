import React, { useState, useRef, useEffect, DragEvent, ClipboardEvent } from 'react';
import {
  Send,
  Square,
  Globe,
  ImageIcon,
  Mic,
  MicOff,
  X,
  Sparkles,
} from 'lucide-react';
import { MessageImage } from '../types';

interface ChatInputProps {
  onSendMessage: (text: string, images: MessageImage[]) => void;
  onStopGeneration: () => void;
  isStreaming: boolean;
  useSearch: boolean;
  onToggleSearch: () => void;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onStopGeneration,
  isStreaming,
  useSearch,
  onToggleSearch,
  placeholder = 'Ask anything or type a prompt...',
}) => {
  const [text, setText] = useState('');
  const [images, setImages] = useState<MessageImage[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 180)}px`;
    }
  }, [text]);

  // Clean up speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleFileProcess = (files: FileList | File[]) => {
    const validImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const fileArray = Array.from(files);

    fileArray.forEach((file) => {
      if (!validImageTypes.includes(file.type)) return;
      if (file.size > 10 * 1024 * 1024) {
        alert('Image must be under 10MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          setImages((prev) => [
            ...prev,
            {
              id: Math.random().toString(36).substring(2, 9),
              data: result,
              name: file.name,
              mimeType: file.type,
              size: file.size,
            },
          ]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    const pastedFiles: File[] = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) pastedFiles.push(blob);
      }
    }

    if (pastedFiles.length > 0) {
      e.preventDefault();
      handleFileProcess(pastedFiles);
    }
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleToggleVoice = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Voice recognition is not supported in this browser.');
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsRecording(true);
      recognition.onend = () => setIsRecording(false);
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to start voice recognition:', err);
      setIsRecording(false);
    }
  };

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed && images.length === 0) return;
    if (isStreaming) return;

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    }

    onSendMessage(trimmed, images);
    setText('');
    setImages([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const hasContent = text.trim().length > 0 || images.length > 0;

  return (
    <div
      id="chat-input-container"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative w-full rounded-2xl bg-zinc-900 border transition-all shadow-xl ${
        isDragging
          ? 'border-indigo-500 ring-2 ring-indigo-500/30 bg-indigo-950/20'
          : 'border-zinc-800 hover:border-zinc-700 focus-within:border-zinc-600 focus-within:ring-1 focus-within:ring-zinc-600'
      }`}
    >
      {/* Attached Images Preview Row */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 pb-0">
          {images.map((img) => (
            <div
              key={img.id}
              className="relative group rounded-xl overflow-hidden border border-zinc-700 bg-zinc-800 w-16 h-16 shadow-xs"
            >
              <img
                src={img.data}
                alt={img.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <button
                type="button"
                onClick={() => removeImage(img.id)}
                className="absolute top-1 right-1 p-0.5 rounded-full bg-zinc-900/80 text-zinc-300 hover:text-white hover:bg-rose-600 transition-colors"
                title="Remove image"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main Textarea */}
      <div className="px-4 pt-3">
        <textarea
          id="chat-textarea"
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={placeholder}
          rows={1}
          className="w-full bg-transparent text-sm md:text-[15px] text-zinc-100 placeholder-zinc-500 focus:outline-none resize-none leading-relaxed max-h-[180px]"
        />
      </div>

      {/* Input Action Controls Bar */}
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-1.5">
          {/* Add Image Button */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files) handleFileProcess(e.target.files);
              e.target.value = '';
            }}
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className="hidden"
          />
          <button
            id="btn-attach-image"
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            title="Attach image (JPEG, PNG, WEBP)"
          >
            <ImageIcon className="w-4 h-4 text-zinc-400" />
            <span className="hidden sm:inline">Image</span>
          </button>

          {/* Web Search Grounding Toggle Button */}
          <button
            id="btn-toggle-search"
            type="button"
            onClick={onToggleSearch}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              useSearch
                ? 'bg-cyan-950/80 border border-cyan-700/60 text-cyan-300 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
            title="Toggle Google Search grounding for real-time web results"
          >
            <Globe className={`w-4 h-4 ${useSearch ? 'text-cyan-400 animate-pulse' : 'text-zinc-400'}`} />
            <span className="hidden sm:inline">Web Search</span>
            {useSearch && (
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block ml-0.5" />
            )}
          </button>

          {/* Voice Input Button */}
          <button
            id="btn-voice-dictate"
            type="button"
            onClick={handleToggleVoice}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              isRecording
                ? 'bg-rose-950/80 border border-rose-700/60 text-rose-300 shadow-xs animate-pulse'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
            title={isRecording ? 'Stop listening' : 'Voice dictation'}
          >
            {isRecording ? (
              <>
                <MicOff className="w-4 h-4 text-rose-400" />
                <span className="hidden sm:inline text-rose-300">Listening...</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 text-zinc-400" />
                <span className="hidden sm:inline">Voice</span>
              </>
            )}
          </button>
        </div>

        {/* Send / Stop Generation Button */}
        <div className="flex items-center gap-2">
          {isStreaming ? (
            <button
              id="btn-stop-stream"
              type="button"
              onClick={onStopGeneration}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-200 text-xs font-medium border border-zinc-700 shadow-sm transition-all"
              title="Stop response generation"
            >
              <Square className="w-3.5 h-3.5 fill-current text-rose-400" />
              <span>Stop</span>
            </button>
          ) : (
            <button
              id="btn-send-message"
              type="button"
              onClick={handleSubmit}
              disabled={!hasContent}
              className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all ${
                hasContent
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 active:scale-95'
                  : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
              }`}
              title="Send message (Enter)"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
