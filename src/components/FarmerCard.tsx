'use client';

import { Star, MapPin, Phone, MessageSquare, Briefcase } from 'lucide-react';
import React, { useState } from 'react';

interface FarmerCardProps {
  farmer: {
    id: string;
    name: string;
    rating: number;
    village: string;
    district: string;
    activeJobsCount: number;
  };
}

export default function FarmerCard({ farmer }: FarmerCardProps) {
  const [contactMode, setContactMode] = useState<string | null>(null);

  return (
    <div className="rounded-3xl border border-earth-150 dark:border-earth-900/35 bg-white dark:bg-[#111714] p-5 shadow-sm hover-card flex flex-col justify-between space-y-4">
      {/* Header and Avatar */}
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-sm shrink-0">
          {farmer.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h4 className="text-sm font-black text-foreground truncate">{farmer.name}</h4>
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-accent-50 dark:bg-amber-950/20 text-accent-700 dark:text-accent-500 font-bold text-[9px]">
              ★ {farmer.rating}
            </span>
          </div>
          <p className="text-[10px] text-earth-400 font-bold mt-0.5 flex items-center gap-1">
            <Briefcase className="w-3 h-3 text-earth-300" />
            <span>{farmer.activeJobsCount} Active Jobs</span>
          </p>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-1.5 text-xs text-earth-500 dark:text-earth-400 font-medium">
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-earth-400 shrink-0" />
          <span className="truncate">{farmer.village}, {farmer.district}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="border-t border-earth-100 dark:border-earth-900/30 pt-3 flex items-center justify-between gap-4">
        {contactMode ? (
          <div className="flex-1 text-[10px] font-bold text-primary-500 bg-primary-50/50 dark:bg-primary-950/25 p-2 rounded-xl text-center border border-primary-500/10 animate-fade-in">
            {contactMode === 'call' ? 'Call: +91 95833 00812' : 'Message thread initiated!'}
          </div>
        ) : (
          <div className="flex gap-1.5 w-full">
            <button
              onClick={() => setContactMode('call')}
              className="flex-1 py-2 px-3 rounded-xl bg-earth-50 hover:bg-earth-100 dark:bg-earth-900 dark:hover:bg-earth-850 text-earth-700 dark:text-earth-300 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer border-0"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Farmer</span>
            </button>
            <button
              onClick={() => setContactMode('message')}
              className="flex-1 py-2 px-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs flex items-center justify-center gap-1 cursor-pointer border-0 shadow-sm"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Message</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
