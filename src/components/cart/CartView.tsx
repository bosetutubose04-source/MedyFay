import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  Truck, 
  ShieldCheck, 
  AlertCircle, 
  MapPin, 
  Pill,
  Sparkles,
  Coins,
  Ticket,
  Check,
  X,
  Gift
} from 'lucide-react';
import { checkDeliveryAvailability } from '../../utils/deliveryValidation';
import { EL_COINS_RULES } from '../../data/medicines';
import { CartSafetyChecker } from './CartSafetyChecker';

export const CartView: React.FC = () => {
  const { 
    cart, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    subtotal, 
    deliveryFee, 
    discount, 
    couponDiscount,
    coinDiscount,
    total, 
    user, 
    setActiveView, 
    setLoginModalOpen, 
    isLoggedIn,
    availableCoupons,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    appliedCoins,
    setAppliedCoins,
    toggleRedeemAllCoins,
    willEarnCoins,
    coinsToEarn
  } = useApp();

  const [couponInput, setCouponInput] = useState('');
  const [showCoinSlider, setShowCoinSlider] = useState(false);

  const deliveryInfo = checkDeliveryAvailability(user?.city || 'Kolkata', subtotal);
  const hasPrescriptionItems = cart.some(item => item.medicine.prescriptionRequired);
  const freeDeliveryGap = Math.max(0, 500 - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / 500) * 100));

  const handleApplyCouponCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const ok = applyCoupon(couponInput.trim());
    if (ok) setCouponInput('');
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
          <ShoppingCart className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Your Cart is Empty</h2>
        <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
          Looks like you haven't added any medicines yet. Explore our genuine pharmacy catalogue and get them delivered to your doorstep.
        </p>
        <button
          onClick={() => setActiveView('home')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-colors cursor-pointer"
        >
          <Pill className="w-4 h-4" /> Browse Medicines
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 space-y-6">
      
      {/* Title & Clear Action */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Your Cart</h1>
          <p className="text-xs sm:text-sm text-slate-500">Review your medicines, apply loyalty coins, and checkout</p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear all
        </button>
      </div>

      {/* Free Delivery Bar & Coin Earning Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Free Delivery Progress */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-emerald-900 mb-2">
            <span className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-emerald-600" />
              {freeDeliveryGap === 0 ? (
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-amber-500" /> FREE Express Delivery Unlocked!
                </span>
              ) : (
                <span>Add <strong className="text-emerald-800 font-bold">₹{freeDeliveryGap}</strong> more for FREE Delivery</span>
              )}
            </span>
            <span className="text-emerald-700 font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full bg-emerald-200 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-600 h-full transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* EL Coin Earning Notice Banner */}
        <div className={`rounded-2xl p-4 border flex items-center gap-3 transition-colors ${
          willEarnCoins 
            ? 'bg-amber-50 border-amber-200 text-amber-900' 
            : 'bg-slate-50 border-slate-200 text-slate-700'
        }`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
            willEarnCoins ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-500'
          }`}>
            <Coins className="w-6 h-6" />
          </div>
          <div className="text-xs">
            {willEarnCoins ? (
              <>
                <div className="font-extrabold text-amber-900 flex items-center gap-1.5">
                  <Gift className="w-4 h-4 text-amber-600" /> You will earn +10 EL Coins on this order!
                </div>
                <p className="text-amber-700 mt-0.5">Order amount is above ₹500. 10 coins will be credited instantly upon confirmation.</p>
              </>
            ) : (
              <>
                <div className="font-bold text-slate-800">Earn 10 EL Coins on this order</div>
                <p className="text-slate-500 mt-0.5">Add items worth ₹{500 - subtotal} more to qualify for +10 EL loyalty coins.</p>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Cart Items List */}
        <div className="lg:col-span-2 space-y-5">
          <CartSafetyChecker />

          {hasPrescriptionItems && (
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Prescription Required:</strong> One or more items in your cart need doctor prescription verification.
              </div>
            </div>
          )}

          {/* Medicines List */}
          <div className="bg-white rounded-3xl border border-slate-200 divide-y divide-slate-100 shadow-xs overflow-hidden">
            {cart.map(({ medicine, quantity }) => (
              <div key={medicine.id} className="p-4 sm:p-5 flex items-center justify-between gap-4">
                {/* Image & Details */}
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <img
                    src={medicine.image}
                    alt={medicine.name}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-2xl bg-slate-100 shrink-0 border border-slate-100"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=700&auto=format&fit=crop&q=80';
                    }}
                  />
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 text-sm sm:text-base truncate">{medicine.name}</h4>
                    <p className="text-xs text-slate-500 font-mono truncate">{medicine.genericName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-bold text-slate-800">₹{medicine.price}</span>
                      {medicine.originalPrice && (
                        <span className="text-[11px] text-slate-400 line-through">₹{medicine.originalPrice}</span>
                      )}
                      <span className="text-[11px] text-slate-400">• {medicine.packSize}</span>
                    </div>
                  </div>
                </div>

                {/* Actions: Controls & Subtotal */}
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 shrink-0">
                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-xl p-1">
                    <button
                      onClick={() => updateQuantity(medicine.id, -1)}
                      className="w-7 h-7 rounded-lg bg-white text-slate-700 hover:bg-slate-200 flex items-center justify-center transition-colors shadow-xs cursor-pointer"
                      aria-label="Decrease"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-bold w-5 text-center text-slate-900">{quantity}</span>
                    <button
                      onClick={() => updateQuantity(medicine.id, 1)}
                      className="w-7 h-7 rounded-lg bg-white text-slate-700 hover:bg-slate-200 flex items-center justify-center transition-colors shadow-xs cursor-pointer"
                      aria-label="Increase"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Line total & remove */}
                  <div className="text-right min-w-[70px]">
                    <div className="text-sm font-extrabold text-slate-900">₹{medicine.price * quantity}</div>
                    <button
                      onClick={() => removeFromCart(medicine.id)}
                      className="text-[11px] text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Delivery Address Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Delivering to</div>
                <div className="text-sm font-bold text-slate-900">{user?.name || 'Customer'} - {user?.city}</div>
                <div className="text-xs text-slate-500 truncate max-w-sm">{user?.address}</div>
              </div>
            </div>
            <button
              onClick={() => {
                if (!isLoggedIn) setLoginModalOpen(true);
                else setActiveView('profile');
              }}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 transition-colors cursor-pointer"
            >
              Change
            </button>
          </div>
        </div>

        {/* Right 1 Col: Discounts, EL Coins & Checkout */}
        <div className="space-y-4">
          
          {/* EL Coins Redemption Card */}
          <div className="bg-gradient-to-br from-amber-500/10 via-amber-50/50 to-emerald-50/60 rounded-3xl border border-amber-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">EL Coins Loyalty</h4>
                  <span className="text-[11px] text-amber-700 font-semibold">
                    Balance: <strong>{user?.elCoins || 0} Coins</strong>
                  </span>
                </div>
              </div>
              
              {user && user.elCoins > 0 && (
                <button
                  type="button"
                  onClick={toggleRedeemAllCoins}
                  className={`text-xs font-bold px-3 py-1 rounded-xl transition-all cursor-pointer ${
                    appliedCoins > 0 
                      ? 'bg-rose-100 text-rose-700 hover:bg-rose-200' 
                      : 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs'
                  }`}
                >
                  {appliedCoins > 0 ? 'Remove Coins' : 'Use Coins'}
                </button>
              )}
            </div>

            {user && user.elCoins > 0 ? (
              <div className="space-y-2 pt-2 border-t border-amber-200/60 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Applied for Discount:</span>
                  <span className="font-extrabold text-amber-900">
                    {appliedCoins} Coins ({appliedCoins}% OFF)
                  </span>
                </div>

                {/* Coin slider for granular percentage redemption */}
                <div className="pt-1">
                  <input
                    type="range"
                    min={0}
                    max={Math.min(user.elCoins, EL_COINS_RULES.MAX_COIN_DISCOUNT_PERCENTAGE)}
                    value={appliedCoins}
                    onChange={(e) => setAppliedCoins(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-semibold mt-0.5">
                    <span>0% OFF</span>
                    <span>1 Coin = 1% OFF</span>
                    <span>Max {Math.min(user.elCoins, 50)}%</span>
                  </div>
                </div>

                {appliedCoins > 0 && (
                  <div className="p-2 bg-emerald-100/70 rounded-xl text-emerald-900 font-bold text-[11px] flex items-center justify-between">
                    <span>Savings from EL Coins:</span>
                    <span>-₹{coinDiscount}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-[11px] text-slate-500 pt-1">
                You have 0 EL Coins. Complete an order over ₹500 to earn 10 EL Coins!
              </p>
            )}
          </div>

          {/* Coupon Code Section */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Ticket className="w-4 h-4 text-emerald-600" /> Apply Coupon Code
            </h4>

            {appliedCoupon ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-emerald-900 block font-mono">
                    {appliedCoupon.code}
                  </span>
                  <span className="text-[11px] text-emerald-700">
                    Saved ₹{couponDiscount} ({appliedCoupon.title})
                  </span>
                </div>
                <button
                  onClick={removeCoupon}
                  className="p-1 rounded-lg text-rose-600 hover:bg-rose-100 transition-colors"
                  title="Remove coupon"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCouponCode} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter promo code"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs uppercase font-mono font-bold focus:outline-none focus:border-emerald-600"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Apply
                </button>
              </form>
            )}

            {/* Quick Coupon Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {availableCoupons.slice(0, 3).map((cp) => (
                <button
                  key={cp.code}
                  type="button"
                  onClick={() => applyCoupon(cp.code)}
                  className={`text-[10px] px-2 py-1 rounded-lg font-mono font-bold border transition-colors cursor-pointer ${
                    appliedCoupon?.code === cp.code 
                      ? 'bg-emerald-600 text-white border-emerald-600' 
                      : 'bg-slate-50 hover:bg-emerald-50 text-slate-700 border-slate-200 hover:border-emerald-300'
                  }`}
                >
                  {cp.code} ({cp.discountType === 'percentage' ? `${cp.discountValue}%` : `₹${cp.discountValue}`})
                </button>
              ))}
            </div>
          </div>

          {/* Bill Summary */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">
              Bill Summary
            </h3>

            <div className="space-y-2.5 text-xs sm:text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Item Total ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span className="font-semibold text-slate-900">₹{subtotal}</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span className="flex items-center gap-1">
                  Delivery Fee
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                    {deliveryInfo.estimatedTime}
                  </span>
                </span>
                {deliveryFee === 0 ? (
                  <span className="font-bold text-emerald-700 uppercase text-xs">FREE</span>
                ) : (
                  <span className="font-semibold text-slate-900">₹{deliveryFee}</span>
                )}
              </div>

              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Coupon Discount ({appliedCoupon?.code})</span>
                  <span>-₹{couponDiscount}</span>
                </div>
              )}

              {coinDiscount > 0 && (
                <div className="flex justify-between text-amber-700 font-semibold">
                  <span>EL Coins Discount ({appliedCoins} Coins = {appliedCoins}%)</span>
                  <span>-₹{coinDiscount}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>Govt Tax & Pharmacy Packaging</span>
                <span className="font-semibold text-slate-900">Included</span>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-between items-baseline">
                <div>
                  <span className="text-base font-extrabold text-slate-900 block">Total Amount</span>
                  <span className="text-[11px] text-emerald-700 font-medium">Safe & Secure Payment</span>
                </div>
                <span className="text-xl sm:text-2xl font-extrabold text-emerald-800">
                  ₹{total}
                </span>
              </div>
            </div>

            {/* Proceed to Payment button */}
            <button
              onClick={() => {
                if (!isLoggedIn) {
                  setLoginModalOpen(true);
                } else {
                  setActiveView('payment');
                }
              }}
              className="w-full mt-6 py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm sm:text-base shadow-md shadow-emerald-700/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Proceed to Payment</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Safety badge */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-3 text-slate-600 text-xs">
            <ShieldCheck className="w-8 h-8 text-emerald-600 shrink-0" />
            <div>
              <strong className="text-slate-800 block">MedyFay Assured Quality</strong>
              Direct from temperature-controlled licensed pharmacies with contactless sealed delivery.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
