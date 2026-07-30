import TrustBadge from './TrustBadge';
'use client';

import { Star, MapPin, Briefcase, Phone, MessageSquare } from 'lucide-react';
import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';

interface WorkerCardProps {
  worker: {
    id: string;
    name: string;
    rating: number;
    experience: string;
    skills: string[];
    village: string;
    district: string;
  };
  onHireClick?: () => void;
  isHired?: boolean;
}

export default function WorkerCard({ worker, onHireClick, isHired = false }: WorkerCardProps) {
  const { t } = useApp();
  const [contactMode, setContactMode] = useState<string | null>(null);

  return (
    <div className="rounded-3xl border border-earth-150 dark:border-earth-900/35 bg-white dark:bg-[#111714] p-5 shadow-sm hover-card flex flex-col justify-between space-y-4">
      {/* Header and Avatar */}
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-2xl bg-primary-500/10 text-primary-500 flex items-center justify-center font-black text-sm shrink-0">
          {worker.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h4 className="text-sm font-black text-foreground truncate">{worker.name}</h4>
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-accent-50 dark:bg-amber-950/20 text-accent-700 dark:text-accent-500 font-bold text-[9px]">
              ★ {worker.rating}
            </span>
          </div>
          <p className="text-[10px] text-earth-400 font-bold mt-0.5 flex items-center gap-1">
            <Briefcase className="w-3 h-3 text-earth-300" />
            <span>{worker.experience} Exp</span>
          </p>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-1.5 text-xs text-earth-500 dark:text-earth-400 font-medium">
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-earth-400 shrink-0" />
          <span className="truncate">{worker.village}, {worker.district}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mt-1">
        {worker.rating >= 4.5 && <TrustBadge type="verified" customText={t('verified_worker') || 'Verified Worker'} />}
        {parseInt(worker.experience || '0') >= 3 && <TrustBadge type="trusted" customText={t('experienced_worker') || 'Experienced'} />}
        {worker.rating >= 4.7 && <TrustBadge type="top_rated" />}
      </div>

      {/* Skills list */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        {worker.skills.map((skill) => (
          <span
            key={skill}
            className="text-[9px] bg-earth-50 dark:bg-earth-900 border border-earth-200/50 dark:border-earth-850 px-2 py-0.5 rounded-md font-bold text-earth-650 dark:text-earth-350"
          >
            {skill}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="border-t border-earth-100 dark:border-earth-900/30 pt-3 flex items-center gap-2">
        {contactMode ? (
          <div className="flex-1 text-[10px] font-bold text-primary-500 bg-primary-50/50 dark:bg-primary-950/25 p-2 rounded-xl text-center border border-primary-500/10 animate-fade-in">
            {contactMode === 'call' ? 'Call: +91 94456 22019' : 'SMS details sent!'}
          </div>
        ) : (
          <div className="flex gap-1">
            <button
              onClick={() => setContactMode('call')}
              className="p-2 rounded-xl bg-earth-50 hover:bg-earth-100 dark:bg-earth-900 dark:hover:bg-earth-850 text-earth-600 dark:text-earth-400 border-0 cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setContactMode('sms')}
              className="p-2 rounded-xl bg-earth-50 hover:bg-earth-100 dark:bg-earth-900 dark:hover:bg-earth-850 text-earth-600 dark:text-earth-400 border-0 cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {onHireClick && (
          <button
            onClick={onHireClick}
            disabled={isHired}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs cursor-pointer border-0 shadow-sm transition-all ${
              isHired
                ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 cursor-default'
                : 'bg-primary-500 hover:bg-primary-600 text-white'
            }`}
          >
            {isHired ? '✓ Hired' : 'Hire'}
          </button>
        )}
      </div>
    </div>
  );
}
