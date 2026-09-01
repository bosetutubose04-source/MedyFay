import React from 'react';
import { Medicine } from '../../types';
import { useApp } from '../../context/AppContext';
import { Plus, Minus, Star, Shield, Info, CheckCircle2, Sparkles } from 'lucide-react';

interface MedicineCardProps {
  medicine: Medicine;
}

export const MedicineCard: React.FC<MedicineCardProps> = ({ medicine }) => {
  const { getItemQuantity, addToCart, updateQuantity, setSelectedMedicine } = useApp();
  const quantity = getItemQuantity(medicine.id);

  const discountPercent = medicine.originalPrice 
    ? Math.round(((medicine.originalPrice - medicine.price) / medicine.originalPrice) * 100) 
    : 0;

  return (
    <div className="group bg-white rounded-3xl border border-slate-200/90 hover:border-emerald-500/60 shadow-2xs hover:shadow-xl hover:shadow-emerald-950/5 transition-all duration-300 flex flex-col overflow-hidden relative">
      {/* Top Image area */}
      <div 
        className="relative h-48 bg-slate-50/80 overflow-hidden cursor-pointer flex items-center justify-center p-3" 
        onClick={() => setSelectedMedicine(medicine)}
      >
        <img
          src={medicine.image}
          alt={medicine.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            // Safe fallback image if external link expires
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=700&auto=format&fit=crop&q=80';
          }}
        />
        
        {/* Prescription badge */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {medicine.prescriptionRequired ? (
            <span className="bg-rose-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-lg shadow-sm flex items-center gap-1">
              <Shield className="w-3 h-3 fill-rose-200 text-rose-600" /> Rx Required
            </span>
          ) : (
            <span className="bg-emerald-700 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-lg shadow-sm flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-300" /> OTC Safe
            </span>
          )}
        </div>

        {/* Discount badge */}
        {discountPercent > 0 && (
          <span className="absolute top-3 right-3 bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-lg shadow-sm">
            {discountPercent}% OFF
          </span>
        )}

        {/* Quick info button on hover */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedMedicine(medicine);
          }}
          className="absolute bottom-3 right-3 p-2 rounded-xl bg-white/95 text-slate-700 hover:text-emerald-800 hover:bg-emerald-50 shadow-md backdrop-blur-xs transition-all cursor-pointer opacity-90 group-hover:opacity-100"
          title="View Composition, Dosage & Uses"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>

      {/* Card Content Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between bg-white">
        <div>
          {/* Rating, Manufacturer & Pack Size */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span className="font-semibold text-slate-600 text-[11px] truncate max-w-[120px]">
              {medicine.manufacturer || medicine.packSize}
            </span>
            <div className="flex items-center gap-1 text-amber-500 font-bold bg-amber-50 px-1.5 py-0.5 rounded-md text-[11px]">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{medicine.rating.toFixed(1)}</span>
              <span className="text-slate-400 font-normal">({medicine.reviewCount})</span>
            </div>
          </div>

          {/* Medicine Name */}
          <h3 
            onClick={() => setSelectedMedicine(medicine)}
            className="font-extrabold text-slate-900 text-sm sm:text-base line-clamp-1 group-hover:text-emerald-700 transition-colors cursor-pointer"
          >
            {medicine.name}
          </h3>

          {/* Generic / Composition Salt */}
          <p className="text-[11px] text-slate-500 line-clamp-1 mb-2 font-mono bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 mt-1">
            {medicine.genericName}
          </p>

          {/* Uses tag */}
          <div className="flex flex-wrap gap-1 mb-3">
            {medicine.uses.slice(0, 2).map((use, idx) => (
              <span key={idx} className="bg-emerald-50/70 text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded-md border border-emerald-100">
                {use}
              </span>
            ))}
          </div>
        </div>

        {/* Price and Cart Controls */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg sm:text-xl font-black text-slate-900">₹{medicine.price}</span>
              {medicine.originalPrice && (
                <span className="text-xs text-slate-400 line-through">₹{medicine.originalPrice}</span>
              )}
            </div>
            <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              <span>In Stock • Express 30m</span>
            </div>
          </div>

          {/* Add or Counter */}
          {quantity === 0 ? (
            <button
              onClick={() => addToCart(medicine)}
              className="px-4 py-2 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs transition-all duration-200 flex items-center gap-1.5 shadow-sm hover:shadow-md cursor-pointer active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          ) : (
            <div className="flex items-center bg-emerald-50 border border-emerald-300 rounded-2xl p-0.5 shadow-2xs">
              <button
                onClick={() => updateQuantity(medicine.id, -1)}
                className="w-7 h-7 rounded-xl bg-white hover:bg-emerald-100 text-emerald-900 font-bold flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                title="Decrease quantity"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-8 text-center text-xs font-black text-emerald-950">{quantity}</span>
              <button
                onClick={() => updateQuantity(medicine.id, 1)}
                className="w-7 h-7 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                title="Increase quantity"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
