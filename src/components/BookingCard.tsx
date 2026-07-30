'use client';

import { RentalBooking, useApp } from '@/context/AppContext';
import { Calendar, IndianRupee, Clock, ArrowRight, Ban, Check, Play, CheckCircle } from 'lucide-react';
import StatusBadge from './StatusBadge';

interface BookingCardProps {
  booking: RentalBooking;
  isOwnerView?: boolean;
  onCancel?: (id: string) => void;
  onAccept?: (id: string) => void;
  onStart?: (id: string) => void;
  onComplete?: (id: string) => void;
}

export default function BookingCard({
  booking,
  isOwnerView = false,
  onCancel,
  onAccept,
  onStart,
  onComplete
}: BookingCardProps) {
  const { t } = useApp();

  const getStatusActions = () => {
    if (booking.status === 'pending') {
      return (
        <div className="flex gap-2">
          {onCancel && (
            <button
              onClick={() => onCancel(booking.id)}
              className="px-3 py-1.5 rounded-xl border border-red-500/20 hover:bg-red-500/5 text-red-500 text-xs font-bold flex items-center gap-1 cursor-pointer border-0"
            >
              <Ban className="w-3.5 h-3.5" />
              <span>{t('cancel') || 'Cancel'}</span>
            </button>
          )}
          {isOwnerView && onAccept && (
            <button
              onClick={() => onAccept(booking.id)}
              className="px-3 py-1.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold flex items-center gap-1 cursor-pointer border-0 shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{t('incoming_requests') || 'Accept Request'}</span>
            </button>
          )}
        </div>
      );
    }

    if (booking.status === 'accepted') {
      return (
        <div className="flex gap-2">
          {onCancel && !isOwnerView && (
            <button
              onClick={() => onCancel(booking.id)}
              className="px-3 py-1.5 rounded-xl border border-red-500/20 hover:bg-red-500/5 text-red-500 text-xs font-bold flex items-center gap-1 cursor-pointer border-0"
            >
              <Ban className="w-3.5 h-3.5" />
              <span>{t('cancel') || 'Cancel'}</span>
            </button>
          )}
          {isOwnerView && onStart && (
            <button
              onClick={() => onStart(booking.id)}
              className="px-3 py-1.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold flex items-center gap-1 cursor-pointer border-0 shadow-sm"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{t('verify_handover') || 'Handover Gear'}</span>
            </button>
          )}
        </div>
      );
    }

    if (booking.status === 'in_progress') {
      return (
        <div className="flex gap-2">
          {isOwnerView && onComplete && (
            <button
              onClick={() => onComplete(booking.id)}
              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1 cursor-pointer border-0 shadow-sm"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{t('mark_completed') || 'Mark Complete'}</span>
            </button>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="rounded-3xl border border-[#e6eae7] dark:border-primary-950/20 bg-white dark:bg-[#111714] p-5 shadow-sm space-y-4 hover:border-primary-500/25 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[9px] font-bold text-earth-450 dark:text-earth-500 uppercase tracking-widest block font-mono">
            {t('booking_id_label') || 'Booking ID'}: {booking.id}
          </span>
          <h4 className="text-base font-black text-foreground tracking-tight block mt-0.5">
            {booking.itemName}
          </h4>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      {/* Date Period Details */}
      <div className="flex items-center gap-2 p-3 bg-earth-50/50 dark:bg-earth-950/20 border border-earth-150 dark:border-earth-900/35 rounded-2xl text-xs font-semibold text-earth-500 dark:text-earth-400">
        <Calendar className="w-4 h-4 text-primary-500 shrink-0" />
        <span className="truncate">{booking.startDate}</span>
        <ArrowRight className="w-3.5 h-3.5 text-earth-300 dark:text-earth-700" />
        <span className="truncate">{booking.endDate}</span>
        <span className="text-[10px] text-earth-400 font-mono ml-auto bg-white dark:bg-earth-900 px-2 py-0.5 rounded-full border border-earth-200 dark:border-earth-850">
          {booking.totalDays} {t('days_unit') || 'Days'}
        </span>
      </div>

      {/* Booking Financial details */}
      <div className="flex items-center justify-between text-xs pt-1 border-t border-dashed border-earth-150 dark:border-earth-900/20">
        <div>
          <span className="text-[9px] text-earth-400 font-bold block uppercase tracking-wider">{t('lease_rate_label') || 'Lease Rate'}</span>
          <span className="text-xs font-black text-foreground font-mono">₹{booking.pricePerDay}/day</span>
        </div>
        <div className="text-right">
          <span className="text-[9px] text-earth-400 font-bold block uppercase tracking-wider">{t('total_cost') || 'Total Charge'}</span>
          <span className="text-sm font-black text-primary-600 dark:text-primary-400 font-mono">₹{booking.totalCost}</span>
        </div>
      </div>

      {/* Renter detail if Owner view */}
      {isOwnerView && (
        <div className="p-2.5 rounded-xl bg-earth-50/30 dark:bg-earth-950/10 border border-earth-100 dark:border-earth-900/20 flex items-center justify-between text-xs">
          <span className="text-earth-400 font-bold">{t('rented_by_label') || 'Rented by'}:</span>
          <span className="font-black text-foreground">{booking.renterName}</span>
        </div>
      )}

      {/* Status Actions */}
      <div className="flex justify-end pt-1">
        {getStatusActions()}
      </div>
    </div>
  );
}
