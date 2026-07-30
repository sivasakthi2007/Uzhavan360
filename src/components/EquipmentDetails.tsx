'use client';

import React, { useState } from 'react';
import { RentalItem, useApp } from '@/context/AppContext';
import { X, Phone, MessageSquare, ShieldAlert, Star, ShieldCheck, MapPin, Truck, ChevronRight, Clock } from 'lucide-react';
import Calendar from './Calendar';
import RatingCard from './RatingCard';
import EquipmentCard from './EquipmentCard';

interface EquipmentDetailsProps {
  itemId: string;
  onClose: () => void;
  onBookNow: (itemId: string, startDate: string, endDate: string) => void;
}

export default function EquipmentDetails({
  itemId,
  onClose,
  onBookNow
}: EquipmentDetailsProps) {
  const { rentalItems, addReviewToEquipment, userName } = useApp();
  
  // Local state for booking period selection
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [contactMode, setContactMode] = useState<string | null>(null);

  const item = rentalItems.find(r => r.id === itemId);

  if (!item) return null;

  // Calculate booking details if dates are selected
  const totalDays = React.useMemo(() => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  }, [startDate, endDate]);

  const totalCost = totalDays * item.pricePerDay;

  // Filter similar items
  const similarItems = rentalItems
    .filter(r => r.id !== item.id && (r.equipmentType === item.equipmentType || r.category === item.category))
    .slice(0, 3);

  const handleBookingSubmit = () => {
    if (!startDate || !endDate) return;
    onBookNow(item.id, startDate, endDate);
  };

  const handleReviewSubmit = (rating: number, comment: string) => {
    addReviewToEquipment(item.id, rating, comment);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/85 backdrop-blur-xs flex justify-end animate-fade-in">
      {/* Click outside backdrop */}
      <div className="fixed inset-0 cursor-pointer" onClick={onClose} />

      {/* Slide-over Content container */}
      <div className="relative w-full max-w-2xl bg-[#fafbfa] dark:bg-[#111613] h-full flex flex-col shadow-2xl animate-slide-up md:animate-fade-in md:rounded-l-3xl overflow-hidden z-10">
        
        {/* Header */}
        <div className="h-16 px-6 border-b border-earth-150 dark:border-earth-900/40 bg-white dark:bg-[#111714] flex items-center justify-between sticky top-0 z-20">
          <div>
            <span className="text-[10px] font-bold text-primary-500 uppercase tracking-widest block">
              Equipment Specifications
            </span>
            <h3 className="text-sm font-black text-foreground uppercase tracking-wider truncate max-w-sm">
              {item.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-earth-500 hover:text-foreground hover:bg-earth-100 dark:hover:bg-earth-900 rounded-xl cursor-pointer border-0 bg-transparent"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-28">
          
          {/* Main Image */}
          <div className="relative h-64 md:h-80 rounded-3xl overflow-hidden bg-earth-100 dark:bg-earth-900 shadow-inner">
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover"
            />
            {item.status === 'rented' && (
              <div className="absolute inset-0 bg-black/55 backdrop-blur-xs flex items-center justify-center">
                <span className="px-5 py-2.5 rounded-xl border border-red-500/20 bg-red-950/80 text-red-400 font-bold text-xs uppercase tracking-widest">
                  Currently Rented
                </span>
              </div>
            )}
          </div>

          {/* Core Info Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-3">
              <h1 className="text-xl font-black text-foreground leading-tight tracking-tight">
                {item.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-earth-500 dark:text-earth-400">
                <span className="flex items-center gap-1.5 bg-earth-100 dark:bg-earth-900 px-3 py-1 rounded-full">
                  <MapPin className="w-3.5 h-3.5 text-primary-500" />
                  <span>{item.village}, {item.district}</span>
                </span>
                <span className="flex items-center gap-1 bg-accent-50 dark:bg-amber-950/20 text-accent-700 dark:text-amber-400 px-3 py-1 rounded-full">
                  <Star className="w-3 h-3 fill-accent-500 text-accent-500" />
                  <span>{item.ownerRating} ({item.reviewCount} Reviews)</span>
                </span>
              </div>
              <p className="text-xs text-earth-500 dark:text-earth-400 leading-relaxed font-semibold pt-2">
                {item.description}
              </p>
            </div>

            {/* Owner Details Card */}
            <div className="p-4 rounded-3xl border border-earth-150 dark:border-earth-900/30 bg-white dark:bg-[#111714] flex flex-col justify-between shadow-xs">
              <div className="space-y-1">
                <span className="text-[9px] text-earth-400 font-bold uppercase tracking-wider block">Equipment Owner</span>
                <span className="text-xs font-black text-foreground block">{item.vendorName}</span>
                <span className="text-[10px] text-earth-400 block font-semibold">★ Verified Operator</span>
              </div>
              
              <div className="pt-3 mt-3 border-t border-earth-100 dark:border-earth-900/20">
                {contactMode ? (
                  <div className="text-[11px] font-black text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/20 p-2.5 rounded-xl border border-primary-500/10 text-center animate-fade-in">
                    {contactMode === 'call' ? 'Call: +91 94432 10980' : 'Message: Support request sent!'}
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setContactMode('call')}
                      className="flex-1 py-2 px-2.5 rounded-xl bg-earth-100 dark:bg-earth-900 hover:bg-earth-200 dark:hover:bg-earth-850 text-earth-700 dark:text-earth-300 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer border-0"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Call</span>
                    </button>
                    <button
                      onClick={() => setContactMode('chat')}
                      className="flex-1 py-2 px-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs flex items-center justify-center gap-1 cursor-pointer border-0"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>Chat</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Specifications Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-foreground uppercase tracking-widest">
              Technical Specifications
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(item.specs).map(([key, value]) => (
                <div key={key} className="p-3 bg-white dark:bg-[#111714] border border-earth-150 dark:border-earth-900/35 rounded-2xl flex items-center justify-between text-xs">
                  <span className="text-earth-400 font-bold">{key}</span>
                  <span className="font-black text-foreground">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-foreground uppercase tracking-widest">
              Rental Charges
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 shadow-xs flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[9px] text-earth-400 font-bold block uppercase tracking-wider">Daily Lease</span>
                  <span className="text-lg font-black text-foreground font-mono">₹{item.pricePerDay}<span className="text-xs font-semibold text-earth-400">/day</span></span>
                </div>
              </div>

              <div className="p-4 rounded-3xl bg-blue-500/5 border border-blue-500/10 shadow-xs flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[9px] text-earth-400 font-bold block uppercase tracking-wider">Hourly Lease</span>
                  <span className="text-lg font-black text-foreground font-mono">₹{item.pricePerHour}<span className="text-xs font-semibold text-earth-400">/hr</span></span>
                </div>
              </div>
            </div>
          </div>

          {/* Availability Calendar */}
          <div className="space-y-3">
            <Calendar
              availableDates={item.availableDates}
              selectedStartDate={startDate}
              selectedEndDate={endDate}
              onDateRangeChange={(start, end) => {
                setStartDate(start);
                setEndDate(end);
              }}
              interactive={item.status === 'available'}
            />
          </div>

          {/* Reviews Rating Section */}
          <div className="space-y-3">
            <RatingCard
              averageRating={item.ownerRating}
              reviewCount={item.reviewCount}
              reviews={item.reviews}
              onSubmitReview={handleReviewSubmit}
            />
          </div>

          {/* Similar Equipment recommendations */}
          {similarItems.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-xs font-black text-foreground uppercase tracking-widest">
                Similar Equipment Nearby
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {similarItems.map((sim) => (
                  <EquipmentCard
                    key={sim.id}
                    item={sim}
                    onViewClick={() => {
                      // Click switches detailed item ID
                      setStartDate('');
                      setEndDate('');
                      setContactMode(null);
                      // Set search queries accordingly or just load
                      // Since we are parent component, we can let user browse it
                      // By reloading this component on another itemId
                      window.location.hash = sim.id; // simulation trick or just load
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sticky bottom booking Action bar */}
        {item.status === 'available' && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-earth-150 dark:border-earth-900/40 bg-white/95 dark:bg-[#111714]/95 backdrop-blur-md flex items-center justify-between gap-4 z-20 shadow-lg">
            <div className="min-w-0">
              {totalDays > 0 ? (
                <div>
                  <span className="text-[10px] text-earth-400 font-bold block uppercase tracking-wider">
                    Total for {totalDays} Day{totalDays > 1 ? 's' : ''}
                  </span>
                  <span className="text-xl font-black text-primary-600 dark:text-primary-400 font-mono">
                    ₹{totalCost.toLocaleString()}
                  </span>
                </div>
              ) : (
                <div>
                  <span className="text-[10px] text-earth-400 font-bold block uppercase tracking-wider">
                    Select Dates Above
                  </span>
                  <span className="text-xs font-semibold text-earth-500 dark:text-earth-400">
                    To compute total lease
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={handleBookingSubmit}
              disabled={!startDate || !endDate}
              className={`px-8 py-3 rounded-2xl font-bold text-sm shadow-md transition-all duration-200 cursor-pointer border-0 flex items-center gap-2 ${
                !startDate || !endDate
                  ? 'bg-earth-100 dark:bg-earth-900/40 text-earth-400 cursor-not-allowed'
                  : 'bg-primary-500 hover:bg-primary-600 text-white hover:scale-102'
              }`}
            >
              <span>Confirm Lease</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
