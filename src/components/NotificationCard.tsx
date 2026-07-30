'use client';

import { LucideIcon, Bell, CheckCircle, Wrench, Hammer, Briefcase } from 'lucide-react';

export interface NotificationItem {
  id: string;
  text: string;
  time: string;
  type: 'booking' | 'job' | 'system' | 'reminder';
  read?: boolean;
}

interface NotificationCardProps {
  notification: NotificationItem;
  onMarkRead?: (id: string) => void;
}

export default function NotificationCard({ notification, onMarkRead }: NotificationCardProps) {
  const getIcon = () => {
    switch (notification.type) {
      case 'booking':
        return Wrench;
      case 'job':
        return Briefcase;
      case 'reminder':
        return Bell;
      default:
        return CheckCircle;
    }
  };

  const getColorClass = () => {
    switch (notification.type) {
      case 'booking':
        return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400';
      case 'job':
        return 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400';
      case 'reminder':
        return 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400';
      default:
        return 'bg-stone-50 text-stone-600 dark:bg-[#232a26] dark:text-stone-300';
    }
  };

  const Icon = getIcon();

  return (
    <div
      className={`p-4 rounded-2xl border transition-all duration-300 flex items-start gap-3 bg-white dark:bg-[#111714] ${
        notification.read
          ? 'border-earth-150 dark:border-earth-900/20 opacity-80'
          : 'border-primary-500/20 shadow-xs ring-1 ring-primary-500/5'
      }`}
    >
      <div className={`p-2 rounded-xl ${getColorClass()} shrink-0`}>
        <Icon className="w-4.5 h-4.5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-foreground leading-relaxed">
          {notification.text}
        </p>
        <span className="text-[10px] text-earth-400 font-mono block mt-1">
          {notification.time}
        </span>
      </div>

      {!notification.read && onMarkRead && (
        <button
          onClick={() => onMarkRead(notification.id)}
          className="text-[9px] font-bold uppercase tracking-wider text-primary-500 hover:text-primary-650 cursor-pointer border-0 bg-transparent shrink-0"
        >
          Mark read
        </button>
      )}
    </div>
  );
}
