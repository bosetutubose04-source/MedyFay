import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Package, 
  LogOut, 
  Edit3, 
  Check, 
  ShieldCheck, 
  Headphones, 
  FileText, 
  Save, 
  X, 
  PhoneCall, 
  Coins, 
  Ticket, 
  Upload, 
  Camera, 
  Trash2, 
  Copy, 
  Sparkles, 
  TrendingUp, 
  ArrowRight, 
  Gift, 
  CheckCircle2, 
  Clock, 
  Truck, 
  RefreshCw, 
  FastForward, 
  Crown, 
  Zap, 
  Percent, 
  HeartHandshake, 
  Award,
  Database,
  LayoutDashboard
} from 'lucide-react';
import { 
  POPULAR_LOCATIONS, 
  HELPLINE_NUMBER, 
  HELPLINE_FORMATTED, 
  AVAILABLE_COUPONS, 
  AVATAR_PRESETS 
} from '../../data/medicines';
import { Order } from '../../types';
import { DeliveryLiveMap } from '../orders/DeliveryLiveMap';

type ProfileTab = 'queen' | 'orders' | 'rewards' | 'settings';

export const UserProfileView: React.FC = () => {
  const { 
    user, 
    logout, 
    updateUserProfile, 
    orders, 
    addToast, 
    setLoginModalOpen, 
    isDbConnected, 
    applyCoupon, 
    appliedCoupon, 
    setActiveView, 
    addToCart, 
    advanceOrderStatus,
    setPrescriptionModalOpen
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [activeTab, setActiveTab] = useState<ProfileTab>('queen');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    mobile: user?.mobile || '',
    email: user?.email || '',
    address: user?.address || '',
    city: user?.city || '',
    pincode: user?.pincode || '700001',
    avatar: user?.avatar || '',
  });

  const [isSaving, setIsSaving] = useState(false);

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">You are not logged in</h2>
        <p className="text-slate-500 text-xs sm:text-sm mb-6">
          Log in with your mobile number to view your Queen Membership, orders, and EL Coins.
        </p>
        <button
          onClick={() => setLoginModalOpen(true)}
          className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
        >
          Login to MedyFay
        </button>
      </div>
    );
  }

  // Handle Photo File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      addToast('Image size should be under 2MB', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Url = event.target?.result as string;
      if (base64Url) {
        setFormData(prev => ({ ...prev, avatar: base64Url }));
        await updateUserProfile({ avatar: base64Url });
        setShowAvatarPicker(false);
        addToast('Profile photo updated successfully!', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPresetAvatar = async (url: string) => {
    setFormData(prev => ({ ...prev, avatar: url }));
    await updateUserProfile({ avatar: url });
    setShowAvatarPicker(false);
    addToast('Avatar updated!', 'success');
  };

  const handleRemovePhoto = async () => {
    setFormData(prev => ({ ...prev, avatar: '' }));
    await updateUserProfile({ avatar: '' });
    setShowAvatarPicker(false);
    addToast('Profile photo removed', 'info');
  };

  const handleStartEdit = () => {
    setFormData({
      name: user.name,
      mobile: user.mobile,
      email: user.email,
      address: user.address,
      city: user.city,
      pincode: user.pincode || '700001',
      avatar: user.avatar || '',
    });
    setIsEditingProfile(true);
    setActiveTab('settings');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      addToast('Please enter your full name', 'warning');
      return;
    }
    if (!formData.mobile.trim()) {
      addToast('Please enter your valid phone number', 'warning');
      return;
    }

    setIsSaving(true);
    try {
      await updateUserProfile({
        name: formData.name.trim(),
        mobile: formData.mobile.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
        city: formData.city.trim() || user.city,
        pincode: formData.pincode.trim(),
        avatar: formData.avatar,
      });
      setIsEditingProfile(false);
      addToast('Profile updated successfully!', 'success');
    } catch {
      addToast('Failed to update profile. Please try again.', 'warning');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    addToast(`Coupon code ${code} copied!`, 'success');
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleApplyCouponFromProfile = (code: string) => {
    const success = applyCoupon(code);
    if (success) {
      setActiveView('cart');
    }
  };

  const handleReorder = (order: Order) => {
    order.items.forEach(item => {
      addToCart(item.medicine, item.quantity);
    });
    addToast('Items added to cart from previous order!', 'success');
    setActiveView('cart');
  };

  const isQueen = user.isQueenMember ?? true;
  const queenSavings = user.queenSavings ?? 1480;

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 space-y-6">
      
      {/* Hidden file input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        accept="image/*" 
        className="hidden" 
      />

      {/* Profile Top Banner Card with Queen Identity */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 -top-12 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        
        {/* User Info & Avatar */}
        <div className="flex items-center gap-5 text-center sm:text-left flex-col sm:flex-row z-10">
          
          {/* Avatar with Upload Trigger */}
          <div className="relative group">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white/10 backdrop-blur-md border-2 border-emerald-400/30 overflow-hidden flex items-center justify-center text-3xl sm:text-4xl font-extrabold text-white shadow-xl relative">
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <span className="text-emerald-200">{user.name[0]?.toUpperCase() || 'U'}</span>
              )}

              {/* Hover overlay for quick photo change */}
              <button 
                onClick={() => setShowAvatarPicker(true)}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold cursor-pointer"
                title="Change photo"
              >
                <Camera className="w-5 h-5 mb-1" />
                Change
              </button>
            </div>

            {/* Quick Camera Action Badge */}
            <button
              onClick={() => setShowAvatarPicker(true)}
              className="absolute -bottom-2 -right-2 p-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl shadow-lg border-2 border-emerald-950 transition-transform active:scale-95 cursor-pointer"
              title="Upload / Change Profile Photo"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          <div>
            <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{user.name}</h1>
              
              {/* Queen VIP Badge */}
              <span className="bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 text-[11px] font-black px-2.5 py-0.5 rounded-full border border-amber-300 shadow-xs flex items-center gap-1">
                <Crown className="w-3.5 h-3.5 fill-slate-950" /> Queen VIP Member
              </span>

              {isDbConnected && (
                <span className="bg-white/10 text-emerald-200 text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Database className="w-3 h-3" /> Firestore & SQL Live
                </span>
              )}
            </div>

            <p className="text-emerald-200 text-xs sm:text-sm mt-1.5 flex items-center gap-3 justify-center sm:justify-start flex-wrap">
              <span>{user.mobile}</span>
              <span>•</span>
              <span>{user.email}</span>
            </p>

            <div className="flex items-center gap-4 text-xs text-emerald-200/80 mt-2.5 justify-center sm:justify-start flex-wrap">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Member since {user.memberSince}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Package className="w-3.5 h-3.5" /> {orders.length} Orders Placed
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-amber-300 font-bold">
                <Coins className="w-3.5 h-3.5" /> {user.elCoins || 0} EL Coins
              </span>
            </div>
          </div>
        </div>

        {/* Right CTA Actions */}
        <div className="flex flex-row md:flex-col gap-2.5 z-10 shrink-0 w-full sm:w-auto justify-center">
          <button
            onClick={() => setActiveView('admin')}
            className="px-4 py-2 rounded-xl bg-slate-900/90 text-white hover:bg-slate-900 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md border border-white/20 cursor-pointer"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-emerald-400" /> Admin Console
          </button>
          <button
            onClick={() => {
              setActiveTab('settings');
              handleStartEdit();
            }}
            className="px-4 py-2 rounded-xl bg-white text-emerald-950 hover:bg-emerald-50 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-emerald-700" /> Edit Details
          </button>
          <button
            onClick={logout}
            className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-600 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border border-rose-500/30 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </div>

      {/* Profile Navigation Tabs (Queen Club, Orders, EL Coins, Settings) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-slate-200">
        <button
          onClick={() => setActiveTab('queen')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'queen'
              ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md shadow-amber-500/20 scale-[1.02]'
              : 'bg-white hover:bg-amber-50 text-slate-700 border border-slate-200/80 hover:border-amber-300'
          }`}
        >
          <Crown className={`w-4 h-4 ${activeTab === 'queen' ? 'fill-slate-950' : 'text-amber-500'}`} />
          <span>Queen Royalty Club</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
            activeTab === 'queen' ? 'bg-slate-950 text-amber-300' : 'bg-amber-100 text-amber-800'
          }`}>
            VIP
          </span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'orders'
              ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20 scale-[1.02]'
              : 'bg-white hover:bg-emerald-50 text-slate-700 border border-slate-200/80 hover:border-emerald-300'
          }`}
        >
          <Package className={`w-4 h-4 ${activeTab === 'orders' ? 'text-white' : 'text-emerald-600'}`} />
          <span>My Orders & Tracking</span>
          {orders.length > 0 && (
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
              activeTab === 'orders' ? 'bg-emerald-900 text-white' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {orders.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('rewards')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'rewards'
              ? 'bg-emerald-700 text-white shadow-md scale-[1.02]'
              : 'bg-white hover:bg-emerald-50 text-slate-700 border border-slate-200/80 hover:border-emerald-300'
          }`}
        >
          <Coins className={`w-4 h-4 ${activeTab === 'rewards' ? 'text-white' : 'text-amber-500'}`} />
          <span>EL Coins & Coupons</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-amber-100 text-amber-800">
            {user.elCoins || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'settings'
              ? 'bg-emerald-700 text-white shadow-md scale-[1.02]'
              : 'bg-white hover:bg-emerald-50 text-slate-700 border border-slate-200/80 hover:border-emerald-300'
          }`}
        >
          <MapPin className={`w-4 h-4 ${activeTab === 'settings' ? 'text-white' : 'text-emerald-600'}`} />
          <span>Delivery Address & Settings</span>
        </button>
      </div>

      {/* Avatar / Photo Upload Modal Sheet */}
      {showAvatarPicker && (
        <div className="bg-white rounded-3xl border-2 border-emerald-500/30 p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Camera className="w-5 h-5 text-emerald-600" /> Upload or Change Profile Photo
              </h3>
              <p className="text-xs text-slate-500">Choose a photo from your device or pick a preset avatar</p>
            </div>
            <button
              onClick={() => setShowAvatarPicker(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Upload from Device */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-dashed border-emerald-300 text-center flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">Upload from Device</h4>
                <p className="text-[11px] text-slate-500">Supports JPG, PNG, WEBP (Max 2MB)</p>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" /> Choose Image File
              </button>
              {user.avatar && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="text-[11px] text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 mt-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" /> Remove current photo
                </button>
              )}
            </div>

            {/* Choose from Avatars */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 mb-2">Or Select a Ready-made Avatar</h4>
              <div className="grid grid-cols-3 gap-2.5">
                {AVATAR_PRESETS.map((preset, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSelectPresetAvatar(preset)}
                    className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all cursor-pointer ${
                      user.avatar === preset ? 'border-emerald-600 scale-105 shadow-md' : 'border-slate-200 hover:border-emerald-400'
                    }`}
                  >
                    <img src={preset} alt={`Avatar ${index + 1}`} className="w-full h-full object-cover" />
                    {user.avatar === preset && (
                      <div className="absolute inset-0 bg-emerald-600/30 flex items-center justify-center text-white">
                        <Check className="w-4 h-4 bg-emerald-600 rounded-full p-0.5" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: THE QUEEN SECTION (MedyFay Queen Club & Royalty Membership) */}
      {/* ========================================================================= */}
      {activeTab === 'queen' && (
        <div className="space-y-6">
          
          {/* Queen Club Hero Pass Card */}
          <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-amber-300/40">
            <div className="absolute -right-8 -bottom-8 w-60 h-60 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute left-1/4 -top-10 w-48 h-48 bg-yellow-300/20 rounded-full blur-xl pointer-events-none" />

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center shadow-lg shrink-0">
                  <Crown className="w-9 h-9 fill-yellow-200 text-yellow-100" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-slate-950/80 text-amber-300 text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-amber-400/40">
                      MedyFay Queen Club
                    </span>
                    <span className="bg-white/20 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                      Membership ID: MF-Q{user.mobile?.slice(-4) || '8921'}
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black mt-1 tracking-tight text-white">
                    {user.name}'s Queen Membership
                  </h2>
                  <p className="text-amber-100 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
                    You are enjoying top-tier healthcare privileges: guaranteed lowest prices, express 15-minute rider dispatch, and 2x EL Coin rewards.
                  </p>
                </div>
              </div>

              {/* Total Savings Counter */}
              <div className="bg-slate-950/80 backdrop-blur-md rounded-2xl p-4 border border-amber-400/30 text-right w-full md:w-auto shrink-0 shadow-lg">
                <span className="text-[10px] text-amber-300 font-extrabold uppercase tracking-wider block">
                  Total Queen Savings
                </span>
                <span className="text-2xl sm:text-3xl font-black text-amber-400 mt-0.5 block">
                  ₹{queenSavings}
                </span>
                <span className="text-[11px] text-slate-300 font-medium">Saved this year on medicines</span>
              </div>
            </div>

            {/* Queen Card Footer Badges */}
            <div className="mt-6 pt-4 border-t border-white/20 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-4 text-amber-100 font-semibold">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" /> Status: Active VIP
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-amber-200" /> Renews: Dec 2026
                </span>
              </div>
              <button
                onClick={() => {
                  addToast('Queen Flat 15% discount automatically applied to your cart!', 'success');
                  setActiveView('home');
                }}
                className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-900 text-amber-300 font-extrabold text-xs shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" /> Use Queen Perks Now
              </button>
            </div>
          </div>

          {/* Queen Privileges Grid */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" /> Exclusive Queen Club Privileges
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  All benefits are permanently unlocked and active for your account
                </p>
              </div>
              <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                6 Active Perks
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* Perk 1 */}
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Percent className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Extra Flat 15% Savings</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                    Automatic additional discount applied on all prescription medicines & chronic refills.
                  </p>
                </div>
              </div>

              {/* Perk 2 */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Priority 15-Min Express Dispatch</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                    Queen orders are routed to the top of the pharmacy dispatch queue with dedicated riders.
                  </p>
                </div>
              </div>

              {/* Perk 3 */}
              <div className="p-4 rounded-2xl bg-yellow-50/60 border border-yellow-200/80 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-500 text-slate-950 flex items-center justify-center shrink-0 shadow-xs font-bold">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">2x Double EL Coins</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                    Earn double loyalty coins on all wellness orders and convert them directly to instant discounts.
                  </p>
                </div>
              </div>

              {/* Perk 4 */}
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Free Delivery Everywhere</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                    Zero delivery charge across Kolkata, Sylhet, and neighborhood hubs without minimum order values.
                  </p>
                </div>
              </div>

              {/* Perk 5 */}
              <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200/80 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Headphones className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">24x7 Priority Doctor Helpline</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                    Direct VIP phone line at <strong>{HELPLINE_FORMATTED}</strong> for instant dosage consults.
                  </p>
                </div>
              </div>

              {/* Perk 6 */}
              <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200/80 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Dedicated Pharmacist Manager</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                    Personal verification for hand-written doctor prescriptions and monthly refill reminders.
                  </p>
                </div>
              </div>

            </div>

            {/* Queen Quick Actions */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Queen Membership is protected by MedyFay 100% Genuine Medicine Guarantee.</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPrescriptionModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 cursor-pointer"
                >
                  Scan Doctor Prescription
                </button>
                <button
                  onClick={() => setActiveView('home')}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Shop with Queen Benefits
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MY ORDERS & LIVE TRACKING SECTION INSIDE PROFILE */}
      {/* ========================================================================= */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Package className="w-5 h-5 text-emerald-600" /> My Orders & Live Dispatch Tracking
                </h3>
                <p className="text-xs text-slate-500">Track current deliveries and view your complete medicine order history</p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${HELPLINE_NUMBER}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200"
                >
                  <Headphones className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Helpline: {HELPLINE_NUMBER}</span>
                </a>
                <button
                  onClick={() => setActiveView('home')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Order Medicines
                </button>
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="py-12 px-4 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <div className="w-14 h-14 mx-auto rounded-full bg-slate-200/80 text-slate-500 flex items-center justify-center mb-3">
                  <Package className="w-7 h-7" />
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-1">No Orders Placed Yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                  Browse our catalog for essential medicines like P650, Dolo, Pan-D, and enjoy 30-min delivery.
                </p>
                <button
                  onClick={() => setActiveView('home')}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  Browse Medicines
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order, idx) => {
                  const isLatest = idx === 0;

                  return (
                    <div 
                      key={order.id} 
                      className={`bg-white rounded-2xl border ${
                        isLatest ? 'border-emerald-500 shadow-md ring-1 ring-emerald-500/20' : 'border-slate-200 shadow-xs'
                      } overflow-hidden`}
                    >
                      {/* Order Header */}
                      <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                            <Package className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-slate-900 text-sm sm:text-base">Order #{order.id}</span>
                              {isLatest && (
                                <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                                  Live Delivery
                                </span>
                              )}
                              <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1">
                                <Crown className="w-3 h-3 fill-amber-700" /> Queen Order
                              </span>
                            </div>
                            <span className="text-xs text-slate-500">Placed on {order.date} • {order.items.length} items</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-xs text-slate-500">Total Paid</div>
                            <div className="text-sm font-extrabold text-slate-900">₹{order.totalAmount}</div>
                          </div>
                          <button
                            onClick={() => handleReorder(order)}
                            className="px-3 py-1.5 rounded-xl border border-slate-300 hover:border-emerald-600 bg-white text-slate-700 hover:text-emerald-700 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                          >
                            <RefreshCw className="w-3.5 h-3.5" /> Re-Order
                          </button>
                        </div>
                      </div>

                      {/* Status Timeline */}
                      <div className="p-4 sm:p-6 border-b border-slate-100">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live Delivery Status</h4>
                          {order.status !== 'delivered' && (
                            <button
                              onClick={() => advanceOrderStatus(order.id)}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                              title="Simulate next status update in database"
                            >
                              <FastForward className="w-3 h-3" /> Advance Status (Simulate Step)
                            </button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-4 gap-2 relative">
                          {/* Step 1: Confirmed */}
                          <div className="flex flex-col items-center text-center">
                            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold mb-1.5 z-10 shadow-xs">
                              <CheckCircle2 className="w-4 h-4" />
                            </div>
                            <span className="text-[11px] font-bold text-slate-800">Order Confirmed</span>
                            <span className="text-[10px] text-slate-400 mt-0.5">Verified by Pharmacist</span>
                          </div>

                          {/* Step 2: Packing */}
                          <div className="flex flex-col items-center text-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-1.5 z-10 shadow-xs ${
                              order.status === 'packing' || order.status === 'out_for_delivery' || order.status === 'delivered'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-200 text-slate-400'
                            }`}>
                              {order.status === 'packing' ? <Clock className="w-4 h-4 animate-spin" /> : <Package className="w-4 h-4" />}
                            </div>
                            <span className={`text-[11px] font-bold ${
                              order.status === 'packing' || order.status === 'out_for_delivery' || order.status === 'delivered'
                                ? 'text-slate-800'
                                : 'text-slate-400'
                            }`}>
                              Packed & Sealed
                            </span>
                            <span className="text-[10px] text-slate-400 mt-0.5">Tamper-Proof Box</span>
                          </div>

                          {/* Step 3: Out for delivery */}
                          <div className="flex flex-col items-center text-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-1.5 z-10 shadow-xs ${
                              order.status === 'out_for_delivery' || order.status === 'delivered'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-200 text-slate-400'
                            }`}>
                              <Truck className="w-4 h-4" />
                            </div>
                            <span className={`text-[11px] font-bold ${
                              order.status === 'out_for_delivery' || order.status === 'delivered'
                                ? 'text-slate-800'
                                : 'text-slate-400'
                            }`}>
                              Out for Delivery
                            </span>
                            <span className="text-[10px] text-slate-400 mt-0.5">Queen Express Rider</span>
                          </div>

                          {/* Step 4: Delivered */}
                          <div className="flex flex-col items-center text-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-1.5 z-10 shadow-xs ${
                              order.status === 'delivered'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-200 text-slate-400'
                            }`}>
                              <Check className="w-4 h-4" />
                            </div>
                            <span className={`text-[11px] font-bold ${
                              order.status === 'delivered' ? 'text-slate-800' : 'text-slate-400'
                            }`}>
                              Delivered
                            </span>
                            <span className="text-[10px] text-slate-400 mt-0.5">30-min Target Met</span>
                          </div>
                        </div>

                        {/* Live Delivery Partner Map and Telemetry */}
                        {isLatest && (
                          <div className="mt-6">
                            <DeliveryLiveMap order={order} />
                          </div>
                        )}
                      </div>

                      {/* Items List */}
                      <div className="p-4 sm:p-5">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Items in this order</h4>
                        <div className="divide-y divide-slate-100">
                          {order.items.map((item, itemIdx) => (
                            <div key={itemIdx} className="py-2.5 flex items-center justify-between text-xs">
                              <div className="flex items-center gap-3">
                                <img
                                  src={item.medicine.image}
                                  alt={item.medicine.name}
                                  className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
                                />
                                <div>
                                  <h5 className="font-bold text-slate-900">{item.medicine.name}</h5>
                                  <p className="text-slate-400 text-[11px]">{item.medicine.packSize} • Qty: {item.quantity}</p>
                                </div>
                              </div>
                              <span className="font-bold text-slate-900">₹{item.medicine.price * item.quantity}</span>
                            </div>
                          ))}
                        </div>

                        {/* Order Breakdown Footer */}
                        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                          <div className="text-slate-500 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Delivered to: <strong>{order.deliveryAddress.street}, {order.deliveryAddress.city}</strong></span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg font-bold">
                              Payment: {order.paymentMethod.toUpperCase()} ({order.paymentStatus === 'paid' ? 'Paid Online' : 'Pay on Delivery'})
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: EL COINS & COUPONS */}
      {/* ========================================================================= */}
      {activeTab === 'rewards' && (
        <div className="space-y-6">
          
          {/* EL Coin Hero Card */}
          <div className="bg-gradient-to-br from-amber-500/10 via-emerald-50 to-teal-50 rounded-3xl border border-amber-200/80 p-6 sm:p-7 shadow-sm relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-white flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
                  <Coins className="w-9 h-9" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                      MedyFay Loyalty Club
                    </span>
                    <span className="text-xs font-semibold text-slate-500">1 EL Coin = 1% Discount</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                    {user.elCoins || 0} <span className="text-base font-bold text-amber-600">EL Coins Available</span>
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Eligible for up to <strong className="text-emerald-700">{user.elCoins || 0}% discount</strong> on your medicine bills!
                  </p>
                </div>
              </div>

              {/* Rules Box */}
              <div className="bg-white/90 backdrop-blur-xs rounded-2xl p-4 border border-amber-200/80 shadow-xs space-y-2 text-xs w-full md:w-auto">
                <div className="flex items-center gap-2 text-slate-800 font-bold">
                  <Gift className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>How to Earn: <strong className="text-emerald-700">+10 EL Coins</strong> on every order above ₹500</span>
                </div>
                <div className="flex items-center gap-2 text-slate-800 font-bold">
                  <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>How to Redeem: Use 5 Coins for 5% OFF, 10 Coins for 10% OFF at Checkout</span>
                </div>
                <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Calculated automatically in Cart</span>
                  <button
                    onClick={() => setActiveView('cart')}
                    className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-0.5 cursor-pointer"
                  >
                    Go to Cart <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Coin History */}
            {user.coinHistory && user.coinHistory.length > 0 && (
              <div className="mt-5 pt-4 border-t border-amber-200/60">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Recent Coin Activity
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {user.coinHistory.slice(0, 4).map((ch) => (
                    <div key={ch.id} className="bg-white/80 rounded-xl p-2.5 border border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-slate-800 block">{ch.reason}</span>
                        <span className="text-[10px] text-slate-400">{ch.date}</span>
                      </div>
                      <span className={`font-bold px-2 py-0.5 rounded-lg text-xs ${
                        ch.type === 'earned' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {ch.type === 'earned' ? `+${ch.amount}` : `-${ch.amount}`} Coins
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Coupon Codes Section */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-emerald-600" /> Available Promo Coupon Codes
                </h3>
                <p className="text-xs text-slate-500">Apply any active coupon code to save instantly on your medicine bill</p>
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                {AVAILABLE_COUPONS.length} Active Promo Deals
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {AVAILABLE_COUPONS.map((coupon) => {
                const isApplied = appliedCoupon?.code === coupon.code;
                return (
                  <div 
                    key={coupon.code}
                    className={`relative rounded-2xl p-4 border transition-all ${
                      isApplied 
                        ? 'border-emerald-500 bg-emerald-50/50 shadow-xs' 
                        : 'border-slate-200 hover:border-emerald-300 bg-white'
                    }`}
                  >
                    {coupon.tag && (
                      <span className="absolute top-3 right-3 text-[10px] font-black tracking-wider uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">
                        {coupon.tag}
                      </span>
                    )}

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold">
                        <Ticket className="w-5 h-5" />
                      </div>
                      <div className="pr-16">
                        <h4 className="font-bold text-slate-900 text-sm">{coupon.title}</h4>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{coupon.description}</p>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2 font-medium">
                          <span>Min Order: ₹{coupon.minOrderValue}</span>
                          <span>•</span>
                          <span>Expires: {coupon.expiryDate}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-lg font-mono font-extrabold text-xs text-slate-800 tracking-wider">
                        <span>{coupon.code}</span>
                        <button 
                          onClick={() => handleCopyCoupon(coupon.code)}
                          className="text-slate-400 hover:text-emerald-700 ml-1 cursor-pointer"
                          title="Copy coupon code"
                        >
                          {copiedCode === coupon.code ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      <button
                        onClick={() => handleApplyCouponFromProfile(coupon.code)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                          isApplied 
                            ? 'bg-emerald-600 text-white' 
                            : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-600 hover:text-white'
                        }`}
                      >
                        {isApplied ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" /> Applied
                          </>
                        ) : (
                          <>
                            <span>Apply & Go to Cart</span>
                            <ArrowRight className="w-3 h-3" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: DELIVERY ADDRESS & PROFILE SETTINGS */}
      {/* ========================================================================= */}
      {activeTab === 'settings' && (
        <div>
          {isEditingProfile ? (
            <div className="bg-white rounded-3xl border border-emerald-200 p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Edit3 className="w-5 h-5 text-emerald-600" /> Edit Profile Details & Delivery Settings
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">Update your contact credentials and home delivery hub</p>
                </div>
                <button
                  onClick={() => setIsEditingProfile(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        placeholder="Enter your name"
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={formData.mobile}
                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                        required
                        placeholder="+91 98765 43210"
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="you@email.com"
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">City / Delivery Hub</label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="e.g. Kolkata, Sylhet"
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Quick Hub Selector */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">Quick select popular hub:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_LOCATIONS.map((loc) => (
                      <button
                        key={loc.city}
                        type="button"
                        onClick={() => setFormData({ 
                          ...formData, 
                          city: loc.city,
                          address: `${loc.hub}, ${loc.city}`
                        })}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                          formData.city === loc.city 
                            ? 'bg-emerald-600 text-white' 
                            : 'bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800'
                        }`}
                      >
                        {loc.city}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Complete Street Address & Landmark</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={3}
                    required
                    placeholder="House/Flat No., Apartment, Street name, Landmark, City, Pincode"
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    {isSaving ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>Save Profile Changes</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="px-4 py-2.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Address & Delivery Info Card */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-600" /> Primary Delivery Address
                  </h3>
                  <button
                    onClick={handleStartEdit}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="font-bold text-slate-800 text-sm flex items-center justify-between">
                    <span>{user.city} Delivery Hub</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">Active Zone</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{user.address}</p>
                  <div className="pt-2 border-t border-slate-200/60 flex items-center gap-2 text-[11px] text-emerald-700 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" /> Express 30-min delivery guaranteed
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Registered Mobile</span>
                    <span className="font-bold text-slate-800 mt-0.5 block">{user.mobile}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Email Address</span>
                    <span className="font-bold text-slate-800 mt-0.5 block truncate">{user.email}</span>
                  </div>
                </div>
              </div>

              {/* Quick Support & 24x7 Helpline */}
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl border border-emerald-200 p-5 shadow-xs">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                        <Headphones className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">24x7 Pharmacist Helpline</h4>
                        <p className="text-xs text-slate-500">Call anytime for prescription or Queen Club support</p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded-full">
                      Live
                    </span>
                  </div>

                  <div className="mt-4 p-3.5 bg-white rounded-2xl border border-emerald-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">Helpline Number</span>
                      <a 
                        href={`tel:${HELPLINE_NUMBER}`} 
                        className="text-base font-extrabold text-emerald-800 hover:text-emerald-900 flex items-center gap-1.5"
                      >
                        <PhoneCall className="w-4 h-4 text-emerald-600" />
                        <span>{HELPLINE_FORMATTED}</span>
                      </a>
                    </div>
                    <a
                      href={`tel:${HELPLINE_NUMBER}`}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1"
                    >
                      <Phone className="w-3.5 h-3.5" /> Call Now
                    </a>
                  </div>
                </div>

                {/* Prescription Upload Card */}
                <div className="bg-white rounded-3xl border border-slate-200 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-emerald-700 flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Upload Prescription (Rx)</h4>
                      <p className="text-xs text-slate-500">Upload doctor's prescription for quick verification</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setPrescriptionModalOpen(true)}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    Scan / Upload Doctor's Slip
                  </button>
                </div>
              </div>

            </div>
          )}
        </div>
      )}

    </div>
  );
};
