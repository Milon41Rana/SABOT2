import React from 'react';
import { X, Download } from 'lucide-react';
import { MessageImage } from '../types';

interface ImageViewerModalProps {
  image: MessageImage | null;
  onClose: () => void;
}

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({ image, onClose }) => {
  if (!image) return null;

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = image.data;
    a.download = image.name || 'image.png';
    a.click();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm cursor-zoom-out"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-4xl max-h-[90vh] bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col cursor-default"
      >
        <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-950/80 border-b border-zinc-800 text-xs text-zinc-300">
          <span className="truncate max-w-[300px]">{image.name || 'Image Preview'}</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
              title="Download image"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="p-2 overflow-auto flex items-center justify-center bg-zinc-950">
          <img
            src={image.data}
            alt={image.name}
            className="max-w-full max-h-[80vh] object-contain rounded-lg"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    </div>
  );
};
