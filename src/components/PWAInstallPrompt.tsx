import React, { useState, useEffect } from 'react';
import { Download, X, Sparkles, Smartphone, Check } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes('android-app://');

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
      console.log('[PWA] App successfully installed');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        console.log('[PWA] User accepted install prompt');
        setShowPrompt(false);
      } else {
        console.log('[PWA] User dismissed install prompt');
      }
    } catch (err) {
      console.error('[PWA] Install error', err);
    } finally {
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt || isInstalled || !deferredPrompt) {
    return null;
  }

  return (
    <div
      id="pwa-install-banner"
      className="fixed bottom-20 md:bottom-24 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50 bg-gradient-to-br from-zinc-900 via-zinc-900 to-indigo-950/80 border border-indigo-500/40 rounded-2xl p-3.5 shadow-2xl shadow-indigo-950/50 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="flex items-start gap-3">
        {/* App Icon */}
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 p-0.5 flex-shrink-0 shadow-md">
          <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center text-indigo-300">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        {/* Content text */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-zinc-100 flex items-center gap-1.5">
              <span>Gemini PWA অ্যাপ ইনস্টল করুন</span>
            </h3>
            <button
              id="btn-pwa-dismiss"
              type="button"
              onClick={handleDismiss}
              className="text-zinc-400 hover:text-zinc-200 p-1 rounded-md hover:bg-zinc-800 transition-colors"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
            দ্রুত ওপেন এবং অফলাইন অ্যাক্সেসের জন্য হোম স্ক্রিনে অ্যাপ হিসেবে যুক্ত করুন।
          </p>

          <div className="flex items-center gap-2 mt-2.5">
            <button
              id="btn-pwa-install"
              type="button"
              onClick={handleInstallClick}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-sm shadow-indigo-600/30 transition-all active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ইনস্টল করুন (Install)</span>
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-300 text-xs font-medium transition-colors"
            >
              পরে
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
