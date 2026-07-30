'use client';

import { LucideIcon } from 'lucide-react';

interface StatisticsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  changeType?: 'up' | 'down' | 'neutral';
  color?: 'emerald' | 'blue' | 'amber' | 'stone';
  description?: string;
}

export default function StatisticsCard({
  title,
  value,
  icon: Icon,
  change,
  changeType = 'neutral',
  color = 'emerald',
  description
}: StatisticsCardProps) {
  const colors = {
    emerald: {
      bg: 'bg-emerald-500/10 dark:bg-emerald-950/20',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-500/10'
    },
    blue: {
      bg: 'bg-blue-500/10 dark:bg-blue-950/20',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-500/10'
    },
    amber: {
      bg: 'bg-amber-500/10 dark:bg-amber-950/20',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-500/10'
    },
    stone: {
      bg: 'bg-stone-500/10 dark:bg-stone-950/20',
      text: 'text-stone-600 dark:text-stone-400',
      border: 'border-stone-500/10'
    }
  };

  const currentColors = colors[color];

  return (
    <div className="rounded-3xl border border-[#e6eae7] dark:border-primary-950/20 bg-white dark:bg-[#111714] p-5 shadow-sm hover-card flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-earth-400 dark:text-earth-500 uppercase tracking-widest block">
            {title}
          </span>
          <span className="text-2xl font-black text-foreground tracking-tight block">
            {value}
          </span>
        </div>
        <div className={`p-2.5 rounded-xl ${currentColors.bg} ${currentColors.text} shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(change || description) && (
        <div className="mt-4 pt-3 border-t border-earth-100 dark:border-earth-900/30 flex items-center justify-between text-[11px] font-semibold">
          {change && (
            <span
              className={
                changeType === 'up'
                  ? 'text-primary-600 dark:text-primary-400 font-bold'
                  : changeType === 'down'
                  ? 'text-red-500 font-bold'
                  : 'text-earth-500'
              }
            >
              {change}
            </span>
          )}
          {description && (
            <span className="text-earth-400 dark:text-earth-500 truncate font-medium">
              {description}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
