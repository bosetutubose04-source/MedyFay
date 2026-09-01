import React, { useRef, useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, X, Sparkles, TrendingUp, Pill, Clock } from 'lucide-react';

interface SearchBarProps {
  variant?: 'desktop' | 'mobile';
  className?: string;
}

const TRENDING_SEARCHES = [
  'Paracetamol 650',
  'Pan-D Acidity',
  'Azithromycin 500',
  'Telmisartan 40',
  'Vitamin C Zinc',
  'Cetirizine 10mg',
  'Volini Spray'
];

export const SearchBar: React.FC<SearchBarProps> = ({ variant = 'desktop', className = '' }) => {
  const { 
    searchQuery, 
    setSearchQuery, 
    activeView, 
    setActiveView 
  } = useApp();

  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (activeView !== 'home' && val.trim().length > 0) {
      setActiveView('home');
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    inputRef.current?.focus();
  };

  const handleSelectTrending = (term: string) => {
    setSearchQuery(term);
    setIsFocused(false);
    if (activeView !== 'home') {
      setActiveView('home');
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <div 
        className={`relative flex items-center bg-slate-50/90 hover:bg-white focus-within:bg-white border rounded-2xl transition-all duration-200 ${
          isFocused 
            ? 'border-emerald-600 ring-4 ring-emerald-500/10 shadow-lg shadow-emerald-950/5' 
            : 'border-slate-200/90 hover:border-slate-300 shadow-2xs'
        }`}
      >
        <div className="pl-3.5 pr-2 flex items-center pointer-events-none">
          <Search className={`w-4 h-4 transition-colors ${isFocused ? 'text-emerald-600' : 'text-slate-400'}`} />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          placeholder={
            variant === 'mobile'
              ? 'Search 15,000+ medicines, salts...'
              : 'Search genuine medicines, generic salts (e.g. Paracetamol, Pan-D, Azithromycin)...'
          }
          className="w-full py-2.5 sm:py-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none pr-3 font-medium"
        />

        {searchQuery ? (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 mr-2.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <div className="hidden sm:flex items-center mr-3 pointer-events-none">
            <span className="text-[10px] font-mono text-slate-400 bg-slate-200/60 px-1.5 py-0.5 rounded border border-slate-300/60">
              Ctrl+K
            </span>
          </div>
        )}
      </div>

      {/* Instant Trending / Quick Search Dropdown */}
      {isFocused && !searchQuery && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" /> Trending & Frequently Ordered
            </span>
            <span className="text-[11px] text-emerald-700 font-semibold">100% Genuine Certified</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {TRENDING_SEARCHES.map((item) => (
              <button
                key={item}
                onMouseDown={() => handleSelectTrending(item)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 text-xs font-semibold border border-slate-200/70 hover:border-emerald-200 transition-colors cursor-pointer"
              >
                <Pill className="w-3 h-3 text-emerald-600" />
                <span>{item}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

