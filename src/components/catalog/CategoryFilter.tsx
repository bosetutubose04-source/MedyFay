import React from 'react';
import { useApp } from '../../context/AppContext';
import { CATEGORIES } from '../../data/medicines';
import { 
  LayoutGrid, 
  Flame, 
  ShieldAlert, 
  Sparkles, 
  Activity, 
  Utensils, 
  Smile, 
  Cross 
} from 'lucide-react';
import { Category } from '../../types';

export const CategoryFilter: React.FC = () => {
  const { selectedCategory, setSelectedCategory, setSearchQuery, medicines } = useApp();

  const getCategoryIcon = (id: Category) => {
    switch (id) {
      case 'All': return <LayoutGrid className="w-4 h-4" />;
      case 'Pain & Fever': return <Flame className="w-4 h-4 text-orange-500" />;
      case 'Antibiotics': return <ShieldAlert className="w-4 h-4 text-red-500" />;
      case 'Vitamins & Supplements': return <Sparkles className="w-4 h-4 text-amber-500" />;
      case 'Diabetes & Heart': return <Activity className="w-4 h-4 text-emerald-600" />;
      case 'Digestion & Acidity': return <Utensils className="w-4 h-4 text-blue-500" />;
      case 'Skin & Hair': return <Smile className="w-4 h-4 text-purple-500" />;
      case 'First Aid & Devices': return <Cross className="w-4 h-4 text-rose-500" />;
      default: return <LayoutGrid className="w-4 h-4" />;
    }
  };

  const getCategoryCount = (catId: Category) => {
    if (catId === 'All') return medicines.length;
    return medicines.filter(m => m.category === catId).length;
  };

  return (
    <div className="w-full overflow-x-auto no-scrollbar py-1">
      <div className="flex items-center gap-2.5 min-w-max pb-1">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const count = getCategoryCount(cat.id);
          return (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setSearchQuery('');
              }}
              className={`group flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'bg-emerald-800 text-white shadow-md shadow-emerald-950/20 ring-2 ring-emerald-700/30'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/90 hover:border-emerald-300 shadow-2xs'
              }`}
            >
              <span className={`transition-transform duration-200 group-hover:scale-110 ${isSelected ? 'text-white' : ''}`}>
                {getCategoryIcon(cat.id)}
              </span>
              <span>{cat.label}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ml-0.5 ${
                isSelected 
                  ? 'bg-emerald-950/60 text-emerald-200' 
                  : 'bg-slate-100 text-slate-500 group-hover:bg-emerald-100 group-hover:text-emerald-800'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

