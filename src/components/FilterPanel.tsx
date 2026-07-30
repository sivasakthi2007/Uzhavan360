'use client';

import React from 'react';
import { Filter, X, RefreshCw } from 'lucide-react';

interface FilterOption {
  id: string;
  label: string;
}

interface FilterPanelProps {
  categories: FilterOption[];
  selectedCategory: string;
  onCategoryChange: (id: string) => void;
  
  districts?: string[];
  selectedDistrict?: string;
  onDistrictChange?: (val: string) => void;
  
  rangeLabel?: string;
  rangeMin?: number;
  rangeMax?: number;
  rangeValue?: number;
  onRangeValueChange?: (val: number) => void;
  
  onReset: () => void;
  isOpen?: boolean;
}

export default function FilterPanel({
  categories,
  selectedCategory,
  onCategoryChange,
  districts = [],
  selectedDistrict = 'all',
  onDistrictChange,
  rangeLabel,
  rangeMin = 0,
  rangeMax = 1000,
  rangeValue = 0,
  onRangeValueChange,
  onReset,
  isOpen = true
}: FilterPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="bg-white dark:bg-[#111714] p-5 rounded-3xl border border-[#e6eae7] dark:border-primary-950/20 shadow-sm space-y-5 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-black text-xs text-foreground uppercase tracking-wider">
          <Filter className="w-4 h-4 text-primary-500" />
          <span>Advanced Filter Panel</span>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-[10px] font-bold text-earth-450 hover:text-primary-500 cursor-pointer border-0 bg-transparent uppercase tracking-wider transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Filters</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-1">
        {/* Category filtering */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-earth-450 block">
            Category
          </label>
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => onCategoryChange(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    isSelected
                      ? 'bg-primary-500 border-primary-500 text-white shadow-sm font-black'
                      : 'bg-transparent border-earth-200 dark:border-earth-800 text-earth-600 dark:text-earth-400 hover:border-primary-500/40 hover:text-foreground'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Location filtering */}
        {districts.length > 0 && onDistrictChange && (
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-earth-450 block">
              District Location
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => onDistrictChange(e.target.value)}
              className="w-full h-11 px-3 bg-earth-50/50 dark:bg-earth-950/20 border border-earth-200 dark:border-earth-800 rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:border-primary-500 appearance-none cursor-pointer"
            >
              <option value="all">All Districts</option>
              {districts.map((dist) => (
                <option key={dist} value={dist}>
                  {dist}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Value Slider Range */}
        {rangeLabel && onRangeValueChange && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-earth-450">
              <span>{rangeLabel}</span>
              <span className="text-foreground font-black font-mono">₹{rangeValue}</span>
            </div>
            <input
              type="range"
              min={rangeMin}
              max={rangeMax}
              step={Math.round((rangeMax - rangeMin) / 20)}
              value={rangeValue}
              onChange={(e) => onRangeValueChange(Number(e.target.value))}
              className="w-full h-1.5 bg-earth-200 dark:bg-[#26332a] rounded-lg appearance-none cursor-pointer accent-primary-500"
            />
            <div className="flex justify-between text-[9px] font-bold text-earth-400 font-mono">
              <span>Min: ₹{rangeMin}</span>
              <span>Max: ₹{rangeMax}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
