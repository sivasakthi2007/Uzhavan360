'use client';

import { useApp } from '@/context/AppContext';

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const { t } = useApp();

  const configs: Record<string, { label: string; bg: string; text: string; dot: string }> = {
    // Products
    available: { label: t('status_available') || 'Available', bg: 'bg-emerald-50 dark:bg-emerald-950/20', text: 'text-emerald-850 dark:text-emerald-400', dot: 'bg-emerald-500' },
    sold: { label: t('status_sold') || 'Sold', bg: 'bg-red-50 dark:bg-red-950/20', text: 'text-red-800 dark:text-red-400', dot: 'bg-red-500' },
    pending: { label: t('status_pending') || 'Pending', bg: 'bg-amber-50 dark:bg-amber-950/20', text: 'text-amber-800 dark:text-amber-400', dot: 'bg-amber-500' },
    
    // Equipment
    booked: { label: t('status_booked') || 'Booked', bg: 'bg-blue-50 dark:bg-blue-950/20', text: 'text-blue-800 dark:text-blue-400', dot: 'bg-blue-500' },
    rented: { label: t('status_booked') || 'Booked', bg: 'bg-blue-50 dark:bg-blue-950/20', text: 'text-blue-800 dark:text-blue-400', dot: 'bg-blue-500' },
    maintenance: { label: t('status_maintenance') || 'Under Maintenance', bg: 'bg-amber-50 dark:bg-amber-950/20', text: 'text-amber-850 dark:text-amber-450', dot: 'bg-amber-550' },
    
    // Jobs
    open: { label: t('status_open') || 'Open', bg: 'bg-emerald-50 dark:bg-emerald-950/20', text: 'text-emerald-800 dark:text-emerald-400', dot: 'bg-emerald-500' },
    active: { label: t('status_active') || 'Active', bg: 'bg-blue-50 dark:bg-blue-950/20', text: 'text-blue-800 dark:text-blue-400', dot: 'bg-blue-500' },
    applied: { label: t('status_applied') || 'Applied', bg: 'bg-blue-50 dark:bg-blue-950/20', text: 'text-blue-800 dark:text-blue-400', dot: 'bg-blue-500' },
    accepted: { label: t('status_accepted') || 'Accepted', bg: 'bg-indigo-50 dark:bg-indigo-950/20', text: 'text-indigo-800 dark:text-indigo-400', dot: 'bg-indigo-500' },
    ongoing: { label: t('status_active') || 'Active', bg: 'bg-blue-50 dark:bg-blue-950/20', text: 'text-blue-800 dark:text-blue-400', dot: 'bg-blue-500' },
    in_progress: { label: t('status_active') || 'Active', bg: 'bg-blue-50 dark:bg-blue-950/20', text: 'text-blue-800 dark:text-blue-400', dot: 'bg-blue-500' },
    closed: { label: t('status_closed') || 'Closed', bg: 'bg-stone-100 dark:bg-[#232a26]', text: 'text-stone-850 dark:text-stone-300', dot: 'bg-stone-500' },
    completed: { label: t('status_completed') || 'Completed', bg: 'bg-emerald-50 dark:bg-emerald-950/20', text: 'text-emerald-800 dark:text-emerald-400', dot: 'bg-emerald-500' },
    cancelled: { label: t('status_cancelled') || 'Cancelled', bg: 'bg-red-50 dark:bg-red-950/20', text: 'text-red-800 dark:text-red-400', dot: 'bg-red-500' },
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
