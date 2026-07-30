
import { Search, MapPin, Grid } from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface FilterBarProps {
  searchPlaceholder: string;
  searchValue: string;
  onSearchChange: (val: string) => void;
  
  categories: { id: string; label: string }[];
  selectedCategory: string; // category id
  onCategoryChange: (id: string) => void;
  
  locations?: string[];
  selectedLocation?: string;
  onLocationChange?: (val: string) => void;
}

export default function FilterBar({
  searchPlaceholder,
  searchValue,
  onSearchChange,
  categories,
  selectedCategory,
  onCategoryChange,
  locations = [],
  selectedLocation = '',
  onLocationChange
}: FilterBarProps) {
  const { t } = useApp();

  return (
    <div className="space-y-4 bg-white dark:bg-[#141816] p-5 rounded-2xl border border-[#e6eae7] dark:border-[#232a26] shadow-sm mb-6">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-earth-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full h-11 pl-10 pr-4 bg-earth-50/50 dark:bg-earth-950/20 border border-earth-200 dark:border-earth-800 rounded-xl text-xs font-semibold text-foreground focus:ring-1 focus:ring-primary-500 placeholder-earth-400"
          />
        </div>

        {/* Location Dropdown */}
        {locations.length > 0 && onLocationChange && (
          <div className="relative w-full md:w-60">
            <MapPin className="w-4 h-4 text-earth-400 absolute left-3.5 top-3.5" />
            <select
              value={selectedLocation}
              onChange={(e) => onLocationChange(e.target.value)}
              className="w-full h-11 pl-10 pr-8 bg-earth-50/50 dark:bg-earth-950/20 border border-earth-200 dark:border-earth-800 rounded-xl text-xs font-semibold text-foreground focus:ring-1 focus:ring-primary-500 appearance-none cursor-pointer"
            >
              <option value="">{t('all_regions')}</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Category Tabs */}
      <div className="border-t border-earth-100 dark:border-earth-900/40 pt-4 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-earth-400 uppercase tracking-wider shrink-0 mr-2">
          <Grid className="w-3.5 h-3.5" />
          <span>{t('filter_label')}</span>
        </div>

        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer shrink-0 border ${
                isSelected
                  ? 'bg-primary-500 border-primary-500 text-white shadow-sm'
                  : 'bg-transparent border-earth-200 dark:border-earth-800 text-earth-600 dark:text-earth-400 hover:border-primary-500/40 hover:text-foreground'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
