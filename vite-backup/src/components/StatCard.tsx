
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendType?: 'up' | 'down' | 'neutral';
  subtitle?: string;
  color?: 'emerald' | 'blue' | 'amber' | 'stone' | 'default';
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendType = 'neutral',
  subtitle,
  color = 'default'
}: StatCardProps) {
  const colorSchemes = {
    emerald: {
      bg: 'bg-emerald-50/50 dark:bg-emerald-950/20',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      borderColor: 'border-emerald-100 dark:border-emerald-950/50'
    },
    blue: {
      bg: 'bg-blue-50/50 dark:bg-blue-950/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
      borderColor: 'border-blue-100 dark:border-blue-950/50'
    },
    amber: {
      bg: 'bg-amber-50/50 dark:bg-amber-950/20',
      iconColor: 'text-amber-600 dark:text-amber-400',
      borderColor: 'border-amber-100 dark:border-amber-950/50'
    },
    stone: {
      bg: 'bg-stone-50/50 dark:bg-stone-950/20',
      iconColor: 'text-stone-600 dark:text-stone-400',
      borderColor: 'border-stone-100 dark:border-stone-950/50'
    },
    default: {
      bg: 'bg-white dark:bg-[#141816]',
      iconColor: 'text-earth-500 dark:text-earth-400',
      borderColor: 'border-[#e6eae7] dark:border-[#232a26]'
    }
  };

  const currentColors = colorSchemes[color];

  return (
    <div className={`p-6 rounded-2xl border ${currentColors.borderColor} ${color === 'default' ? 'bg-white dark:bg-[#141816] hover-card' : currentColors.bg} flex flex-col justify-between shadow-sm relative overflow-hidden transition-all duration-300`}>
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold text-earth-500 dark:text-earth-400 tracking-wide uppercase">
            {title}
          </span>
          <h3 className="text-2xl font-bold mt-1 tracking-tight text-foreground">
            {value}
          </h3>
        </div>
        <div className={`p-2.5 rounded-xl ${color === 'default' ? 'bg-earth-100 dark:bg-earth-900/60' : 'bg-white/80 dark:bg-black/20'} ${currentColors.iconColor} shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      
      {(trend || subtitle) && (
        <div className="mt-4 flex items-center justify-between text-xs border-t border-earth-100 dark:border-earth-900/20 pt-3">
          {trend && (
            <span className={`font-semibold flex items-center gap-1 ${
              trendType === 'up' ? 'text-primary-600 dark:text-primary-400' :
              trendType === 'down' ? 'text-red-500' :
              'text-earth-500 dark:text-earth-400'
            }`}>
              {trend}
            </span>
          )}
          {subtitle && (
            <span className="text-earth-400 font-mono text-[10px]">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
