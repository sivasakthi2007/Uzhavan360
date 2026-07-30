'use client';

import React from 'react';
import { ShieldCheck, Star, MapPin, Sparkles, Flame, CheckCircle } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export type TrustBadgeType = 'verified' | 'recommended' | 'nearby' | 'top_rated' | 'trusted' | 'new';

interface TrustBadgeProps {
  type: TrustBadgeType;
  customText?: string;
}

export default function TrustBadge({ type, customText }: TrustBadgeProps) {
  const { t } = useApp();

  const configs: Record<TrustBadgeType, { label: string; icon: React.ReactNode; className: string }> = {
    verified: {
      label: customText || t('badge_verified') || 'Verified',
      icon: <ShieldCheck className="w-3 h-3 text-emerald-500 fill-emerald-500/10 shrink-0" />,
      className: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-450 border border-emerald-500/10'
    },
    recommended: {
      label: customText || t('badge_recommended') || 'Recommended',
      icon: <Sparkles className="w-3 h-3 text-blue-500 shrink-0" />,
      className: 'bg-blue-50 dark:bg-blue-950/20 text-blue-800 dark:text-blue-400 border border-blue-500/10'
    },
    nearby: {
      label: customText || t('badge_nearby') || 'Nearby',
      icon: <MapPin className="w-3 h-3 text-primary-500 shrink-0" />,
      className: 'bg-primary-50 dark:bg-primary-950/20 text-primary-800 dark:text-primary-400 border border-primary-500/10'
    },
    top_rated: {
      label: customText || t('badge_top_rated') || 'Top Rated',
      icon: <Star className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />,
      className: 'bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-450 border border-amber-500/10'
    },
    trusted: {
      label: customText || t('badge_trusted') || 'Trusted',
      icon: <CheckCircle className="w-3 h-3 text-purple-500 shrink-0" />,
      className: 'bg-purple-50 dark:bg-purple-950/20 text-purple-800 dark:text-purple-400 border border-purple-500/10'
    },
    new: {
      label: customText || t('badge_new') || 'New',
      icon: <Flame className="w-3 h-3 text-rose-500 fill-rose-500/10 shrink-0" />,
      className: 'bg-rose-50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-400 border border-rose-500/10'
    }
  };

  const config = configs[type];

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider transition-all duration-200 hover:scale-102 ${config.className}`}>
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
}
