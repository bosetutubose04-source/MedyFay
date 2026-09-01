import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Phone, MapPin, User, ShieldCheck, ArrowRight } from 'lucide-react';
import { POPULAR_LOCATIONS } from '../../data/medicines';
import { motion, AnimatePresence } from 'motion/react';

export const LoginModal: React.FC = () => {
  const { loginModalOpen, setLoginModalOpen, login } = useApp();

  const [mobile, setMobile] = useState('');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('Kolkata');
  const [countryCode, setCountryCode] = useState('+91');

  if (!loginModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobile.trim() || mobile.replace(/\D/g, '').length < 8) {
      alert('Please enter a valid mobile number.');
      return;
    }
    const fullNumber = `${countryCode} ${mobile.trim()}`;
    login(fullNumber, location, name || undefined);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-700 to-emerald-900 p-6 text-white relative">
            <button
              onClick={() => setLoginModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-extrabold">Welcome to MedyFay</h2>
            <p className="text-emerald-100 text-xs mt-1">
              Your trusted partner for 30-minute doorstep medicine delivery
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mobile Number <span className="text-rose-500">*</span>
              </label>
              <div className="flex gap-2">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="px-2.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-500"
                >
                  <option value="+91">🇮🇳 +91</option>
                  <option value="+880">🇧🇩 +880</option>
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+44">🇬🇧 +44</option>
                </select>
                <div className="relative flex-1">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    placeholder="98765 43210"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name (Optional)</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. Rohan Bose"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Delivery Location / City */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Primary Delivery Hub / City <span className="text-rose-500">*</span>
              </label>
              <div className="relative mb-2">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Salt Lake, Kolkata or Sylhet Sadar"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              {/* Quick city chips */}
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_LOCATIONS.map((loc) => (
                  <button
                    key={loc.city}
                    type="button"
                    onClick={() => setLocation(loc.city)}
                    className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                      location === loc.city
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {loc.city}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Continue to MedyFay</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center">
              <span className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> By logging in, you agree to MedyFay Healthcare Terms
              </span>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
