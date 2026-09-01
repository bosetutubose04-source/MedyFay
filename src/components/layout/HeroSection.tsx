import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Sparkles, 
  Bot, 
  ShieldCheck, 
  Clock, 
  Zap, 
  Search, 
  CheckCircle2, 
  ThermometerSnowflake, 
  Upload, 
  Truck, 
  Star, 
  ChevronRight,
  Pill,
  Award,
  Crown
} from 'lucide-react';

const QUICK_TAGS = [
  { name: 'Paracetamol 650', cat: 'Fever & Pain' },
  { name: 'Pan-D Gas Relief', cat: 'Acidity' },
  { name: 'Azithromycin 500', cat: 'Antibiotics' },
  { name: 'Telmisartan 40', cat: 'Cardiac' },
  { name: 'Vitamin C + Zinc', cat: 'Immunity' }
];

export const HeroSection: React.FC = () => {
  const { 
    setPrescriptionModalOpen, 
    setDrMedyChatOpen, 
    setSearchQuery, 
    user,
    setActiveView 
  } = useApp();

  return (
    <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white shadow-2xl border border-emerald-900/30">
      {/* Dynamic Background Lighting Effects */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
      
      {/* Decorative Grid Mesh Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0596690a_1px,transparent_1px),linear-gradient(to_bottom,#0596690a_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-40" />

      <div className="relative z-10 p-6 sm:p-10 lg:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* LEFT HERO COLUMN (Main Value Proposition & CTAs) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Top Live Status Pill */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-900/70 border border-emerald-500/30 text-emerald-300 text-xs font-bold backdrop-blur-md shadow-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="tracking-wide">Express Delivery in {user?.city || 'Kolkata'} & Metro Hubs</span>
              </div>

              <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold">
                <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>30-Minute Guarantee</span>
              </div>
            </div>

            {/* Impact Headline */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-black tracking-tight text-white leading-[1.12]">
                Your Trusted <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200">Online Pharmacy</span> & 30-Min Medicine Delivery.
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl font-normal">
                100% genuine pharmaceutical inventory verified by licensed druggists. Cold-chain storage, AI prescription reading, and doorstep delivery in minutes.
              </p>
            </div>

            {/* AI Action Launchers */}
            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <button
                onClick={() => setPrescriptionModalOpen(true)}
                className="group relative px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-emerald-950/40 transition-all flex items-center gap-3 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="w-6 h-6 rounded-lg bg-slate-950/10 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-slate-950" />
                </div>
                <span>Scan Prescription with AI</span>
                <ChevronRight className="w-4 h-4 text-slate-950 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => setDrMedyChatOpen(true)}
                className="px-6 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-100 font-bold text-xs sm:text-sm border border-slate-700/80 hover:border-emerald-500/40 backdrop-blur-md transition-all flex items-center gap-2.5 cursor-pointer shadow-lg hover:scale-[1.02] active:scale-[0.98]"
              >
                <Bot className="w-4 h-4 text-teal-400" />
                <span>Ask Dr. Medy (AI Pharmacist)</span>
              </button>
            </div>

            {/* Quick Medicine Salt Chips */}
            <div className="pt-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Search className="w-3 h-3 text-emerald-400" /> Popular Quick Search:
              </div>
              <div className="flex flex-wrap gap-2">
                {QUICK_TAGS.map((tag) => (
                  <button
                    key={tag.name}
                    onClick={() => setSearchQuery(tag.name.split(' ')[0])}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-emerald-950/80 border border-slate-800 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-200 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                  >
                    <Pill className="w-3 h-3 text-emerald-400" />
                    <span>{tag.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Verification & Trust Metric Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <div className="text-xs font-black text-white">100% Genuine</div>
                  <div className="text-[10px] text-slate-400">Licensed Batch Certified</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center shrink-0">
                  <ThermometerSnowflake className="w-4 h-4 text-teal-400" />
                </div>
                <div>
                  <div className="text-xs font-black text-white">Cold-Chain 4-8°C</div>
                  <div className="text-[10px] text-slate-400">Insulated Transport</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 col-span-2 sm:col-span-1">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                </div>
                <div>
                  <div className="text-xs font-black text-white">4.9 / 5 Rating</div>
                  <div className="text-[10px] text-slate-400">25,000+ Happy Patients</div>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT HERO COLUMN (Interactive Live Dispatch Widget & AI Scanner Card) */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Real-Time Express Dispatch Hub Card */}
            <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-5 backdrop-blur-xl shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-white">Live Hub Dispatch</h3>
                    <p className="text-[10px] text-slate-400">{user?.city || 'Kolkata Central'} Express Hub #04</p>
                  </div>
                </div>
                <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Active Now
                </span>
              </div>

              {/* Progress Stage Tracker */}
              <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/80 space-y-2.5">
                <div className="flex justify-between text-xs font-bold text-slate-300">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <Clock className="w-3.5 h-3.5" /> Average Delivery SLA:
                  </span>
                  <span className="text-white font-extrabold">24 Mins</span>
                </div>
                
                {/* Progress bar */}
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="w-3/4 h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full animate-pulse"></div>
                </div>

                <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                  <span className="text-emerald-400 font-semibold">1. Hub Picking</span>
                  <span className="text-emerald-400 font-semibold">2. Pharmacist Verification</span>
                  <span className="text-slate-300">3. Doorstep Handover</span>
                </div>
              </div>

              {/* Interactive Drag/Click Upload Dropzone */}
              <div 
                onClick={() => setPrescriptionModalOpen(true)}
                className="group border-2 border-dashed border-emerald-500/30 hover:border-emerald-400 bg-emerald-950/20 hover:bg-emerald-900/30 p-4 rounded-2xl transition-all cursor-pointer flex items-center gap-4 text-left"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 group-hover:bg-emerald-500/30 text-emerald-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-white group-hover:text-emerald-300 transition-colors">
                      Upload Doctor's Prescription
                    </span>
                    <span className="bg-emerald-400 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded">
                      AI OCR
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    Drop doctor note / Rx photo to auto-generate cart
                  </p>
                </div>
              </div>

              {/* VIP Membership Banner Widget */}
              <div 
                onClick={() => setActiveView('profile')}
                className="bg-gradient-to-r from-amber-950/40 via-amber-900/30 to-amber-950/40 border border-amber-500/30 p-3 rounded-2xl flex items-center justify-between cursor-pointer hover:border-amber-400 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
                    <Crown className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-amber-200">Queen VIP Membership</span>
                    <p className="text-[10px] text-amber-300/80">Earn 5% EL Coins on every order</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-amber-300 underline">View</span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
