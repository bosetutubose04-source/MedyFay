import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Coupon } from '../../types';
import { 
  Tag, 
  Plus, 
  Trash2, 
  Percent, 
  Calendar, 
  DollarSign, 
  Crown, 
  CheckCircle2, 
  Sparkles,
  X
} from 'lucide-react';

export const AdminCouponsTab: React.FC = () => {
  const { adminCoupons, addCoupon, deleteCoupon } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);

  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'flat'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(20);
  const [minOrderValue, setMinOrderValue] = useState<number>(399);
  const [description, setDescription] = useState('');
  const [expiryDate, setExpiryDate] = useState('31 Dec 2026');
  const [tag, setTag] = useState('Seasonal Offer');

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !title.trim()) return;

    const newCoupon: Coupon = {
      code: code.trim().toUpperCase(),
      title: title.trim(),
      discountType,
      discountValue: Number(discountValue) || 10,
      minOrderValue: Number(minOrderValue) || 0,
      description: description.trim() || `Get ${discountType === 'percentage' ? `${discountValue}% OFF` : `₹${discountValue} OFF`} on order`,
      expiryDate: expiryDate.trim() || '31 Dec 2026',
      tag: tag.trim() || undefined,
    };

    addCoupon(newCoupon);
    setShowAddModal(false);
    setCode('');
    setTitle('');
    setDescription('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-slate-900 text-base">Promotional Coupons & Deals</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Create and manage instant checkout discounts, cart rules, and VIP codes
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Coupon</span>
        </button>
      </div>

      {/* Coupons Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {adminCoupons.map((coupon) => (
          <div
            key={coupon.code}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-emerald-300 transition-all relative overflow-hidden flex flex-col justify-between"
          >
            {/* Tag / Badge */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="font-mono font-extrabold text-base text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl">
                {coupon.code}
              </span>
              {coupon.tag && (
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-extrabold uppercase">
                  {coupon.tag}
                </span>
              )}
            </div>

            <div className="space-y-2 mb-4">
              <h4 className="font-bold text-slate-900 text-sm">{coupon.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{coupon.description}</p>
              
              <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
                <span className="font-semibold text-emerald-700">
                  {coupon.discountType === 'percentage' ? `${coupon.discountValue}% Discount` : `₹${coupon.discountValue} Flat Discount`}
                </span>
                <span>Min cart: ₹{coupon.minOrderValue}</span>
                <span className="text-[11px] text-slate-400">Exp: {coupon.expiryDate}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Active on Checkout
              </span>

              <button
                onClick={() => deleteCoupon(coupon.code)}
                className="p-1.5 bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-700 rounded-lg transition-colors cursor-pointer"
                title="Delete Coupon"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Coupon Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Create Discount Promo Code</h3>
                <p className="text-xs text-slate-500">Configure instant discount parameters</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Coupon Code (Uppercase)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HEALTH30, FLASH50"
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Campaign Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 30% OFF on Express Orders"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={e => setDiscountType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Value {discountType === 'percentage' ? '(%)' : '(₹)'}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={discountValue}
                    onChange={e => setDiscountValue(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs font-bold text-emerald-800 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Min Order Cart (₹)</label>
                  <input
                    type="number"
                    value={minOrderValue}
                    onChange={e => setMinOrderValue(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Badge Tag</label>
                  <input
                    type="text"
                    placeholder="e.g. VIP Special, Hot"
                    value={tag}
                    onChange={e => setTag(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Expiry Date</label>
                <input
                  type="text"
                  placeholder="e.g. 31 Dec 2026"
                  value={expiryDate}
                  onChange={e => setExpiryDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Activate Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
