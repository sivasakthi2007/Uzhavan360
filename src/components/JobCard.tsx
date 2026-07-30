import TrustBadge from './TrustBadge';
'use client';

import { LaborJob, useApp } from '@/context/AppContext';
import { MapPin, Calendar, Clock, UserCheck } from 'lucide-react';
import StatusBadge from './StatusBadge';

interface JobCardProps {
  job: LaborJob;
  onActionClick?: () => void;
  actionText?: string;
  isActionDisabled?: boolean;
}

export default function JobCard({
  job,
  onActionClick,
  actionText,
  isActionDisabled = false
}: JobCardProps) {
  const { t } = useApp();
  
  return (
    <div className="rounded-2xl border border-[#e6eae7] dark:border-primary-950/20 bg-white dark:bg-[#111714] p-5 shadow-sm hover-card flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-bold uppercase tracking-wider bg-stone-50 dark:bg-[#232a26] text-stone-700 dark:text-stone-300 px-2 py-0.5 rounded">
            {t('farm_workforce') || 'Farm Workforce'}
          </span>
          <StatusBadge status={job.status} />
        </div>

        <div className="flex flex-wrap gap-1 mb-2">
          {job.isVerifiedEmployer && <TrustBadge type="verified" customText={t('verified_employer') || 'Verified Employer'} />}
          {job.isUrgent && <TrustBadge type="new" customText={t('urgent') || 'Urgent'} />}
          {job.farmerRating >= 4.7 && <TrustBadge type="top_rated" />}
          {job.distanceKm < 15 && <TrustBadge type="nearby" />}
        </div>
        <h4 className="text-base font-bold text-foreground truncate">{job.title}</h4>
        <p className="text-xs text-earth-400 mt-1 line-clamp-2 leading-relaxed">{job.description}</p>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 mt-4 text-xs text-earth-500 dark:text-earth-400">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-earth-400 shrink-0" />
            <span className="truncate">{job.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-earth-400 shrink-0" />
            <span>{t('starts') || 'Starts'}: {job.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-earth-400 shrink-0" />
            <span>{t('duration') || 'Duration'}: {job.duration}</span>
          </div>
          <div className="flex items-center gap-2">
            <UserCheck className="w-3.5 h-3.5 text-earth-400 shrink-0" />
            <span>{job.applicantsCount} {t('applicants_count') || 'Applicants'}</span>
          </div>
        </div>
      </div>

      {/* Footer Wage and CTA */}
      <div className="mt-5 border-t border-earth-100 dark:border-earth-900/40 pt-4 flex items-center justify-between gap-4">
        <div>
          <span className="text-[10px] text-earth-400 uppercase font-mono block">{t('daily_wage_rate') || 'Daily Wage Rate'}</span>
          <span className="text-lg font-black text-primary-600 dark:text-primary-400 flex items-center">
            ₹{job.wages} <span className="text-xs font-normal text-earth-400 ml-1">{t('day_unit') || '/ day'}</span>
          </span>
        </div>

        {onActionClick && actionText && (
          <button
            onClick={onActionClick}
            disabled={isActionDisabled}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer border-0 ${
              isActionDisabled
                ? 'bg-earth-100 dark:bg-earth-900/40 text-earth-400 cursor-not-allowed'
                : 'bg-primary-500 hover:bg-primary-600 text-white shadow-sm hover:shadow-md'
            }`}
          >
            {actionText}
          </button>
        )}
      </div>
    </div>
  );
}
