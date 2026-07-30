
import { useApp } from '@/context/AppContext';

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const { t } = useApp();

  const configs: Record<string, { label: string; bg: string; text: string; dot: string }> = {
    // Orders / Deliveries
    pending: { label: t('status_pending'), bg: 'bg-amber-50 dark:bg-amber-950/20', text: 'text-amber-800 dark:text-amber-400', dot: 'bg-amber-500' },
    accepted: { label: t('status_accepted'), bg: 'bg-blue-50 dark:bg-blue-950/20', text: 'text-blue-800 dark:text-blue-400', dot: 'bg-blue-500' },
    in_transit: { label: t('status_in_transit'), bg: 'bg-indigo-50 dark:bg-indigo-950/20', text: 'text-indigo-800 dark:text-indigo-400', dot: 'bg-indigo-500' },
    delivered: { label: t('status_delivered'), bg: 'bg-emerald-50 dark:bg-emerald-950/20', text: 'text-emerald-800 dark:text-emerald-400', dot: 'bg-emerald-500' },
    
    // Delivery Job Network specific
    available: { label: t('status_available'), bg: 'bg-rose-50 dark:bg-rose-950/20', text: 'text-rose-800 dark:text-rose-400', dot: 'bg-rose-500' },
    assigned: { label: t('status_assigned'), bg: 'bg-blue-50 dark:bg-blue-950/20', text: 'text-blue-800 dark:text-blue-400', dot: 'bg-blue-500' },
    
    // Labor System specific
    open: { label: t('status_open'), bg: 'bg-emerald-50 dark:bg-emerald-950/20', text: 'text-emerald-800 dark:text-emerald-400', dot: 'bg-emerald-500' },
    applied: { label: t('status_applied'), bg: 'bg-blue-50 dark:bg-blue-950/20', text: 'text-blue-800 dark:text-blue-400', dot: 'bg-blue-500' },
    filled: { label: t('status_filled'), bg: 'bg-stone-100 dark:bg-[#232a26]', text: 'text-stone-800 dark:text-stone-300', dot: 'bg-stone-500' },
  };

  const config = configs[status.toLowerCase()] || {
    label: status.toUpperCase(),
    bg: 'bg-stone-50 dark:bg-stone-900',
    text: 'text-stone-600 dark:text-stone-400',
    dot: 'bg-stone-400'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${config.bg} ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} shrink-0`} />
      <span>{config.label}</span>
    </span>
  );
}
