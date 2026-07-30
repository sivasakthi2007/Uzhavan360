'use client';

import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onActionClick?: () => void;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionText,
  onActionClick
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-3xl border border-dashed border-earth-200 dark:border-primary-950/20 bg-white dark:bg-[#111714] max-w-md mx-auto my-6 transition-all duration-300">
      <div className="p-4 rounded-full bg-primary-50 dark:bg-primary-950/20 text-primary-500 mb-4 animate-pulse-subtle">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-base font-black text-foreground tracking-tight">{title}</h3>
      <p className="text-xs text-earth-500 dark:text-earth-400 mt-2 max-w-xs leading-relaxed font-medium">
        {description}
      </p>
      {actionText && onActionClick && (
        <button
          onClick={onActionClick}
          className="mt-5 px-5 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs shadow-md transition-all duration-200 cursor-pointer border-0"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
