'use client';

import React, { useEffect } from 'react';
import { Sparkles, CheckCircle, Info } from 'lucide-react';

interface ToastProps {
  message: string | null;
  onClear: () => void;
}

export function Toast({ message, onClear }: ToastProps) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClear();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [message, onClear]);

  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-200">
      <div className="bg-slate-800 border border-slate-700 text-slate-100 text-xs font-medium px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 max-w-md">
        <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
        <span className="leading-snug">{message}</span>
      </div>
    </div>
  );
}
