'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarProps {
  availableDates: string[]; // e.g. ['2026-07-03', '2026-07-04']
  selectedStartDate?: string;
  selectedEndDate?: string;
  onDateRangeChange?: (start: string, end: string) => void;
  interactive?: boolean;
}

export default function Calendar({
  availableDates,
  selectedStartDate = '',
  selectedEndDate = '',
  onDateRangeChange,
  interactive = false
}: CalendarProps) {
  // Generate next 14 days starting today
  const days = React.useMemo(() => {
    const list = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dateString = d.toISOString().split('T')[0];
      const isAvailable = availableDates.includes(dateString);
      list.push({
        date: d,
        dateString,
        isAvailable,
        dayOfMonth: d.getDate(),
        dayOfWeek: d.toLocaleDateString('en-US', { weekday: 'short' }),
        month: d.toLocaleDateString('en-US', { month: 'short' })
      });
    }
    return list;
  }, [availableDates]);

  const handleDateClick = (dateString: string, isAvailable: boolean) => {
    if (!interactive || !onDateRangeChange) return;
    
    // If not available, we cannot select it
    if (!isAvailable) return;

    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
      // First click or reset: select start date
      onDateRangeChange(dateString, '');
    } else {
      // Second click: select end date
      const start = new Date(selectedStartDate);
      const clicked = new Date(dateString);

      if (clicked < start) {
        // If clicked date is before start, swap them or make it the new start
        onDateRangeChange(dateString, '');
      } else {
        // Validate if there are any unavailable dates in between
        let hasBlockedDate = false;
        const temp = new Date(start);
        while (temp <= clicked) {
          const tempStr = temp.toISOString().split('T')[0];
          if (!availableDates.includes(tempStr)) {
            hasBlockedDate = true;
            break;
          }
          temp.setDate(temp.getDate() + 1);
        }

        if (hasBlockedDate) {
          // If blocked date, reset and make clicked the new start
          onDateRangeChange(dateString, '');
        } else {
          onDateRangeChange(selectedStartDate, dateString);
        }
      }
    }
  };

  const getDayClass = (dateString: string, isAvailable: boolean) => {
    const isStart = selectedStartDate === dateString;
    const isEnd = selectedEndDate === dateString;
    const isInRange =
      selectedStartDate &&
      selectedEndDate &&
      new Date(dateString) > new Date(selectedStartDate) &&
      new Date(dateString) < new Date(selectedEndDate);

    if (isStart || isEnd) {
      return 'bg-primary-500 text-white font-bold ring-2 ring-primary-500/25';
    }
    if (isInRange) {
      return 'bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 font-bold';
    }
    if (!isAvailable) {
      return 'bg-stone-50 dark:bg-stone-900/30 text-earth-300 dark:text-earth-700 cursor-not-allowed line-through';
    }
    return 'bg-white hover:bg-earth-100/50 dark:bg-[#111714] dark:hover:bg-earth-900/40 text-foreground hover:scale-102';
  };

  return (
    <div className="rounded-3xl border border-[#e6eae7] dark:border-primary-950/20 bg-white dark:bg-[#111714] p-5 shadow-sm space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-black text-foreground uppercase tracking-wider">
          Availability — Next 14 Days
        </span>
        <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider text-earth-400">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/30" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-stone-100 dark:bg-stone-900 border border-earth-200 dark:border-primary-950/20" />
            <span>Booked</span>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const isSelected = selectedStartDate === day.dateString || selectedEndDate === day.dateString;
          const isAvailable = day.isAvailable;
          
          return (
            <button
              key={day.dateString}
              type="button"
              disabled={interactive ? !isAvailable : true}
              onClick={() => handleDateClick(day.dateString, isAvailable)}
              className={`p-3 rounded-2xl flex flex-col items-center justify-center border border-earth-150 dark:border-earth-900/30 text-center transition-all duration-200 ${
                interactive && isAvailable ? 'cursor-pointer' : ''
              } ${getDayClass(day.dateString, isAvailable)}`}
            >
              <span className="text-[8px] font-bold uppercase tracking-wider block opacity-70">
                {day.dayOfWeek}
              </span>
              <span className="text-sm font-black mt-1 block">
                {day.dayOfMonth}
              </span>
              <span className="text-[8px] font-bold uppercase tracking-widest block opacity-70 mt-0.5">
                {day.month}
              </span>
            </button>
          );
        })}
      </div>

      {interactive && selectedStartDate && (
        <div className="pt-2 border-t border-earth-100 dark:border-earth-900/30 text-xs font-semibold text-earth-500 dark:text-earth-400 flex items-center justify-between">
          <span>Selected Period:</span>
          <span className="text-foreground font-bold">
            {selectedStartDate} {selectedEndDate ? `to ${selectedEndDate}` : '(Select End Date)'}
          </span>
        </div>
      )}
    </div>
  );
}
