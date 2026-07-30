'use client';

import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search...'
}: SearchBarProps) {
  return (
    <div className="relative w-full">
      <Search className="w-4 h-4 text-earth-450 dark:text-earth-550 absolute left-3.5 top-3.5" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-11 pl-10 pr-10 bg-earth-50/50 dark:bg-earth-950/20 border border-earth-200 dark:border-earth-800 rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:border-primary-500 placeholder-earth-450"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3.5 top-3.5 text-earth-450 hover:text-foreground cursor-pointer border-0 bg-transparent"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
