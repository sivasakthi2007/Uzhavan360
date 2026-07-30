
import { DeliveryJob, LaborJob, useApp } from '@/context/AppContext';
import { MapPin, Navigation, Calendar, Clock, UserCheck } from 'lucide-react';
import StatusBadge from './StatusBadge';

interface JobCardProps {
  type: 'delivery' | 'labor';
  job: DeliveryJob | LaborJob;
  onActionClick?: () => void;
  actionText?: string;
  isActionDisabled?: boolean;
}

export default function JobCard({
  type,
  job,
  onActionClick,
  actionText,
  isActionDisabled = false
}: JobCardProps) {
  const { t } = useApp();
  
  if (type === 'delivery') {
    const dJob = job as DeliveryJob;
    return (
      <div className="rounded-2xl border border-[#e6eae7] dark:border-[#232a26] bg-white dark:bg-[#141816] p-5 shadow-sm hover-card flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded">
              {t('route_dispatch')}
            </span>
            <StatusBadge status={dJob.status} />
          </div>

          <h4 className="text-base font-bold text-foreground mb-3 truncate">
            {dJob.quantity}{t('kg_unit')} {dJob.productName}
          </h4>

          {/* Transit Locations */}
          <div className="space-y-3.5 relative pl-4 border-l border-dashed border-earth-200 dark:border-earth-800 ml-2 py-1">
            <div className="relative">
              <span className="absolute -left-[20px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
              <p className="text-[10px] uppercase font-mono tracking-wider text-earth-400 -mb-0.5">{t('pickup')}</p>
              <p className="text-xs font-semibold text-foreground truncate">{dJob.pickupLocation}</p>
            </div>
            <div className="relative">
              <span className="absolute -left-[20px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-blue-500/20" />
              <p className="text-[10px] uppercase font-mono tracking-wider text-earth-400 -mb-0.5">{t('delivery_destination')}</p>
              <p className="text-xs font-semibold text-foreground truncate">{dJob.deliveryLocation}</p>
            </div>
          </div>
        </div>

        {/* Footer Earnings and CTA */}
        <div className="mt-5 border-t border-earth-100 dark:border-earth-900/40 pt-4 flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] text-earth-400 uppercase font-mono block">{t('delivery_payout')}</span>
            <span className="text-lg font-black text-primary-600 dark:text-primary-400 flex items-center">
              ₹{dJob.wage}
            </span>
          </div>

          {onActionClick && actionText && (
            <button
              onClick={onActionClick}
              disabled={isActionDisabled}
              className={`py-2 px-4 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 border-0 ${
                isActionDisabled
                  ? 'bg-earth-100 dark:bg-earth-900/40 text-earth-400 cursor-not-allowed'
                  : 'bg-primary-500 hover:bg-primary-600 text-white shadow-sm hover:shadow-md'
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>{actionText}</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // Labor job rendering
  const lJob = job as LaborJob;
  return (
    <div className="rounded-2xl border border-[#e6eae7] dark:border-[#232a26] bg-white dark:bg-[#141816] p-5 shadow-sm hover-card flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-bold uppercase tracking-wider bg-stone-50 dark:bg-[#232a26] text-stone-700 dark:text-stone-300 px-2 py-0.5 rounded">
            {t('farm_workforce')}
          </span>
          <StatusBadge status={lJob.status} />
        </div>

        <h4 className="text-base font-bold text-foreground truncate">{lJob.title}</h4>
        <p className="text-xs text-earth-400 mt-1 line-clamp-2 leading-relaxed">{lJob.description}</p>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 mt-4 text-xs text-earth-500 dark:text-earth-400">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-earth-400 shrink-0" />
            <span className="truncate">{lJob.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-earth-400 shrink-0" />
            <span>{t('starts')}: {lJob.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-earth-400 shrink-0" />
            <span>{t('duration')}: {lJob.duration}</span>
          </div>
          <div className="flex items-center gap-2">
            <UserCheck className="w-3.5 h-3.5 text-earth-400 shrink-0" />
            <span>{lJob.applicantsCount} {t('applicants_count')}</span>
          </div>
        </div>
      </div>

      {/* Footer Wage and CTA */}
      <div className="mt-5 border-t border-earth-100 dark:border-earth-900/40 pt-4 flex items-center justify-between gap-4">
        <div>
          <span className="text-[10px] text-earth-400 uppercase font-mono block">{t('daily_wage_rate')}</span>
          <span className="text-lg font-black text-primary-600 dark:text-primary-400 flex items-center">
            ₹{lJob.wages} <span className="text-xs font-normal text-earth-400 ml-1">{t('day_unit')}</span>
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
