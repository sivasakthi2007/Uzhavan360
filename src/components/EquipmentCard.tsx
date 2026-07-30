'use client';
import TrustBadge from './TrustBadge';

import { RentalItem, useApp } from '@/context/AppContext';
import { MapPin, User, Star, Clock, Calendar } from 'lucide-react';

interface EquipmentCardProps {
  item: RentalItem;
  onBookClick?: (id: string) => void;
  onViewClick?: (id: string) => void;
}

export default function EquipmentCard({
  item,
  onBookClick,
  onViewClick
}: EquipmentCardProps) {
  const { t } = useApp();
  const isRented = item.status === 'rented';

  return (
    <div className="rounded-3xl border border-[#e6eae7] dark:border-primary-950/20 bg-white dark:bg-[#111714] overflow-hidden flex flex-col shadow-sm hover-card">
      {/* Machinery Image */}
      <div className="h-44 relative bg-earth-100 dark:bg-earth-900/60 overflow-hidden shrink-0">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        
        {/* Rating Badge */}
        <div className="absolute top-3 left-3">
          <span className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-white/90 dark:bg-[#111613]/90 text-foreground rounded-full shadow-sm">
            <Star className="w-3 h-3 fill-accent-500 text-accent-500 shrink-0" />
            <span>{item.ownerRating} ({item.reviewCount})</span>
          </span>
        </div>

        {/* Category Label */}
        <div className="absolute top-3 right-3">
          <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest bg-primary-500 text-white rounded-full">
            {item.equipmentType}
          </span>
        </div>

        {isRented && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center">
            <span className="px-4 py-1.5 rounded-xl border border-red-500/20 bg-red-950/80 text-red-400 font-bold text-xs uppercase tracking-widest">
              {t('rented_status')}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-wrap gap-1 mb-2">
              {item.isVerifiedOwner && <TrustBadge type="verified" customText={t('verified_owner') || 'Verified Owner'} />}
              {item.isRecommended && <TrustBadge type="recommended" />}
              {item.ownerRating >= 4.7 && <TrustBadge type="top_rated" />}
              {item.distanceKm < 15 && <TrustBadge type="nearby" />}
            </div>
            <h4 className="text-base font-black text-foreground tracking-tight line-clamp-1 leading-snug">
              {item.name}
            </h4>
          </div>

          <div className="space-y-1.5 text-xs text-earth-500 dark:text-earth-400 font-medium">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-earth-400 shrink-0" />
              <span className="truncate">{item.village}, {item.district}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-earth-400 shrink-0" />
              <span className="truncate">{t('owner_label') || 'Owner'}: {item.vendorName}</span>
            </div>
          </div>
        </div>

        {/* Pricing Table */}
        <div className="grid grid-cols-2 gap-2 p-3 bg-earth-50/50 dark:bg-earth-950/20 border border-earth-150 dark:border-earth-900/30 rounded-2xl">
          <div className="text-center border-r border-earth-200 dark:border-earth-850">
            <span className="text-[9px] text-earth-400 font-bold uppercase tracking-wider block">{t('daily_rate') || 'Daily Rate'}</span>
            <span className="text-sm font-black text-foreground font-mono mt-0.5 block">₹{item.pricePerDay}</span>
          </div>
          <div className="text-center">
            <span className="text-[9px] text-earth-400 font-bold uppercase tracking-wider block">{t('hourly_rate') || 'Hourly Rate'}</span>
            <span className="text-sm font-black text-foreground font-mono mt-0.5 block">₹{item.pricePerHour}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          {onViewClick && (
            <button
              onClick={() => onViewClick(item.id)}
              className="flex-1 py-2 px-3 rounded-xl border border-earth-250 dark:border-earth-800 text-earth-700 dark:text-earth-300 hover:bg-earth-50 dark:hover:bg-earth-900 font-bold text-xs cursor-pointer transition-all"
            >
              {t('details') || 'Details'}
            </button>
          )}
          {onBookClick && (
            <button
              onClick={() => onBookClick(item.id)}
              disabled={isRented}
              className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs cursor-pointer transition-all border-0 shadow-sm hover:shadow-md ${
                isRented
                  ? 'bg-earth-100 dark:bg-earth-900/40 text-earth-400 cursor-not-allowed'
                  : 'bg-primary-500 hover:bg-primary-600 text-white'
              }`}
            >
              {t('book_equipment') || 'Book Now'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
