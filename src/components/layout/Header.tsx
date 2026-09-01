import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Pill, 
  MapPin, 
  Search, 
  ShoppingCart, 
  User, 
  ChevronDown, 
  Clock, 
  ShieldCheck, 
  FileText,
  Sparkles,
  Package,
  PhoneCall,
  Coins,
  Bot,
  Crown,
  LayoutDashboard,
  Check,
  Navigation
} from 'lucide-react';
import { POPULAR_LOCATIONS, HELPLINE_NUMBER, HELPLINE_FORMATTED } from '../../data/medicines';
import { SearchBar } from './SearchBar';

export const Header: React.FC = () => {
  const { 
    user, 
    isLoggedIn, 
    setLoginModalOpen, 
    cartItemCount, 
    activeView, 
    setActiveView, 
    searchQuery, 
    setSearchQuery,
    updateLocation,
    setPrescriptionModalOpen,
    setDrMedyChatOpen,
    addToast
  } = useApp();

  const [locationDropdown, setLocationDropdown] = useState(false);
  const [customLocation, setCustomLocation] = useState('');
  const locationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
        setLocationDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLocationSelect = (city: string) => {
    updateLocation(city);
    setLocationDropdown(false);
    addToast(`Delivery hub set to ${city}`, 'info');
  };

  const handleCustomLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customLocation.trim()) {
      updateLocation(customLocation.trim());
      setCustomLocation('');
      setLocationDropdown(false);
      addToast(`Delivery hub updated to ${customLocation.trim()}`, 'info');
    }
  };

  const handleDetectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          updateLocation('Salt Lake, Kolkata');
          setLocationDropdown(false);
          addToast('Detected nearest express hub: Salt Lake, Kolkata', 'success');
        },
        () => {
          updateLocation('Kolkata');
          setLocationDropdown(false);
          addToast('Defaulting to central hub: Kolkata', 'info');
        }
      );
    } else {
      updateLocation('Kolkata');
      setLocationDropdown(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top micro-bar for guarantees & delivery notice */}
      <div className="bg-slate-900 text-slate-200 text-xs px-4 py-1.5 hidden sm:flex justify-between items-center border-b border-slate-800">
        <div className="flex items-center gap-4 text-[11px] font-medium">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" /> 100% Genuine Pharmacy Certified
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-emerald-400" /> 30-Minute Doorstep Dispatch
          </span>
          <a 
            href={`tel:${HELPLINE_NUMBER}`} 
            className="flex items-center gap-1.5 text-emerald-300 hover:text-white font-bold transition-colors bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded-lg"
            title="Call MedyFay 24x7 Helpline"
          >
            <PhoneCall className="w-3 h-3 text-emerald-400 animate-pulse" /> 24x7 Helpline: {HELPLINE_NUMBER}
          </a>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-amber-300 font-semibold flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" /> Free Delivery on orders ₹500+
          </span>
          <button 
            onClick={() => setPrescriptionModalOpen(true)}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-2.5 py-0.5 rounded-md transition-colors cursor-pointer shadow-2xs"
          >
            <Sparkles className="w-3 h-3 text-amber-200" /> AI Rx Scan
          </button>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3 sm:gap-6">
          
          {/* Logo & Location group */}
          <div className="flex items-center gap-3 sm:gap-5 shrink-0">
            {/* Logo */}
            <button 
              onClick={() => {
                setActiveView('home');
                setSearchQuery('');
              }}
              className="flex items-center gap-2.5 group text-left focus:outline-none cursor-pointer"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-all duration-200">
                <Pill className="w-5 h-5 sm:w-6 sm:h-6 transform -rotate-45" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                    Medy<span className="text-emerald-700">Fay</span>
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-900 font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider hidden sm:inline-block">
                    Pharmacy
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-medium block -mt-0.5 hidden sm:block">
                  Doorstep Express Delivery
                </span>
              </div>
            </button>

            {/* Location selector pill */}
            <div ref={locationRef} className="relative">
              <button 
                onClick={() => setLocationDropdown(!locationDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 sm:py-2 bg-slate-50 hover:bg-slate-100/90 text-slate-800 rounded-xl text-xs font-semibold border border-slate-200 transition-all cursor-pointer hover:border-emerald-300"
              >
                <div className="w-5 h-5 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <MapPin className="w-3 h-3" />
                </div>
                <div className="text-left max-w-[90px] sm:max-w-[130px] truncate">
                  <span className="block text-[9px] text-slate-400 font-semibold uppercase leading-none">Deliver to</span>
                  <span className="font-bold text-slate-900 truncate block text-xs">{user?.city || 'Kolkata'}</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>

              {/* Location dropdown */}
              {locationDropdown && (
                <div className="absolute left-0 mt-2 w-80 bg-white rounded-3xl shadow-2xl border border-slate-200/90 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Select Delivery Hub</span>
                    <button
                      onClick={handleDetectLocation}
                      className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer bg-emerald-50 px-2 py-0.5 rounded-lg"
                    >
                      <Navigation className="w-3 h-3" /> Locate Me
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-56 overflow-y-auto custom-scrollbar pr-1">
                    {POPULAR_LOCATIONS.map((loc) => {
                      const isCurrent = (user?.city || 'Kolkata') === loc.city;
                      return (
                        <button
                          key={loc.city}
                          onClick={() => handleLocationSelect(loc.city)}
                          className={`w-full text-left px-3 py-2.5 rounded-2xl text-xs flex items-center justify-between transition-all cursor-pointer ${
                            isCurrent
                              ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200' 
                              : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                          }`}
                        >
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{loc.city}</span>
                              {isCurrent && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                            </div>
                            <div className="text-[10px] text-slate-500 font-medium">{loc.state} • {loc.deliveryTime}</div>
                          </div>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-extrabold">Express</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom location input */}
                  <form onSubmit={handleCustomLocationSubmit} className="mt-3 pt-3 border-t border-slate-100">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1.5">Enter Custom Area / Pin:</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. Salt Lake Sector V, Sylhet Sadar"
                        value={customLocation}
                        onChange={(e) => setCustomLocation(e.target.value)}
                        className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white font-medium"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 transition-colors cursor-pointer"
                      >
                        Set
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>

          {/* Search bar (Center/Expanded on Desktop) */}
          <div className="flex-1 max-w-xl mx-3 hidden md:block">
            <SearchBar variant="desktop" />
          </div>

          {/* Right Navigation CTA items */}
          <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
            {/* Store / Home button */}
            <button
              onClick={() => setActiveView('home')}
              className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeView === 'home'
                  ? 'bg-emerald-50 text-emerald-800 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Pill className="w-4 h-4" />
              <span className="hidden sm:inline">Medicines</span>
            </button>

            {/* AI Rx Scanner Navigation CTA */}
            <button
              onClick={() => setPrescriptionModalOpen(true)}
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 transition-colors cursor-pointer"
              title="Upload prescription image and let Gemini Vision AI extract medicines"
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>AI Rx Scan</span>
            </button>

            {/* Dr. Medy AI Assistant Navigation CTA */}
            <button
              onClick={() => setDrMedyChatOpen(true)}
              className="hidden xl:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200/80 transition-colors cursor-pointer"
              title="Chat with Dr. Medy AI Clinical Pharmacist"
            >
              <Bot className="w-4 h-4 text-teal-600" />
              <span>Dr. Medy AI</span>
            </button>

            {/* Orders list button */}
            <button
              onClick={() => setActiveView('orders')}
              className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeView === 'orders'
                  ? 'bg-emerald-50 text-emerald-800 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Orders</span>
            </button>

            {/* Admin Console button */}
            <button
              onClick={() => setActiveView('admin')}
              className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeView === 'admin'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title="Open MedyFay Admin Control Console"
            >
              <LayoutDashboard className="w-4 h-4 text-emerald-600" />
              <span className="hidden lg:inline">Admin</span>
            </button>

            {/* Cart Button with bounce badge */}
            <button
              onClick={() => setActiveView('cart')}
              className={`relative px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeView === 'cart'
                  ? 'bg-emerald-700 text-white shadow-lg shadow-emerald-800/20'
                  : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Cart</span>
              {cartItemCount > 0 && (
                <span className={`inline-flex items-center justify-center text-xs font-black px-1.5 py-0.5 rounded-full ${
                  activeView === 'cart' ? 'bg-white text-emerald-900' : 'bg-emerald-700 text-white'
                }`}>
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* User Profile / Login */}
            {isLoggedIn ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* EL Coins Quick Pill */}
                <button
                  onClick={() => setActiveView('profile')}
                  className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-black transition-colors cursor-pointer shadow-2xs"
                  title="Your EL Coins Balance (1 Coin = 1% OFF)"
                >
                  <Coins className="w-3.5 h-3.5 text-amber-600" />
                  <span>{user?.elCoins || 0} Coins</span>
                </button>

                <button
                  onClick={() => setActiveView('profile')}
                  className={`p-1.5 sm:px-3 sm:py-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                    activeView === 'profile'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200'
                  }`}
                  title={`${user?.name} - Queen VIP Member`}
                >
                  <div className="relative">
                    <div className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-bold uppercase overflow-hidden shrink-0 border border-emerald-500/30">
                      {user?.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <span>{user?.name ? user.name[0] : 'U'}</span>
                      )}
                    </div>
                    <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-950 p-0.5 rounded-full ring-1 ring-white">
                      <Crown className="w-2.5 h-2.5 fill-slate-950" />
                    </span>
                  </div>
                  <span className="hidden md:inline font-bold max-w-[100px] truncate">{user?.name}</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setLoginModalOpen(true)}
                className="px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-bold bg-emerald-700 hover:bg-emerald-800 text-white transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <User className="w-4 h-4" />
                <span>Login</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Search input bar */}
        <div className="pb-3 md:hidden">
          <SearchBar variant="mobile" />
        </div>
      </div>
    </header>
  );
};

