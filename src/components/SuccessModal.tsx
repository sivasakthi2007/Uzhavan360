'use client';

import { Check } from 'lucide-react';

interface SuccessModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  actionText?: string;
  onActionClick: () => void;
}

export default function SuccessModal({
  isOpen,
  title,
  description,
  actionText = 'Awesome',
  onActionClick
}: SuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div 
        className="fixed inset-0" 
        onClick={onActionClick}
      />
      <div className="relative bg-white dark:bg-[#111714] border border-earth-200 dark:border-primary-950/20 w-full max-w-sm rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center space-y-5 animate-slide-up">
        {/* Animated Check Container */}
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner relative">
          <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 animate-ping duration-1000" />
          <Check className="w-8 h-8 stroke-[3]" />
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-black text-foreground tracking-tight">{title}</h3>
          <p className="text-xs text-earth-500 dark:text-earth-400 leading-relaxed font-medium">
            {description}
          </p>
        </div>

        <button
          onClick={onActionClick}
          className="w-full h-11 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs shadow-md transition-all duration-200 cursor-pointer border-0"
        >
          {actionText}
        </button>
      </div>
    </div>
  );
}
