import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { CategoryFilter } from './components/catalog/CategoryFilter';
import { MedicineCard } from './components/catalog/MedicineCard';
import { MedicineDetailModal } from './components/catalog/MedicineDetailModal';
import { CartView } from './components/cart/CartView';
import { PaymentSection } from './components/checkout/PaymentSection';
import { OrderTrackingView } from './components/orders/OrderTrackingModal';
import { UserProfileView } from './components/profile/UserProfileView';
import { AdminDashboardView } from './components/admin/AdminDashboardView';
import { LoginModal } from './components/auth/LoginModal';
import { ToastContainer } from './components/common/ToastContainer';
import { PrescriptionScannerModal } from './components/ai/PrescriptionScannerModal';
import { DrMedyAiChat } from './components/ai/DrMedyAiChat';
import { HeroSection } from './components/layout/HeroSection';
import { HELPLINE_NUMBER, HELPLINE_FORMATTED } from './data/medicines';
import { 
  ShieldCheck, 
  Clock, 
  Truck, 
  Award, 
  Search, 
  Sparkles, 
  Pill, 
  FileText, 
  PhoneCall, 
  Zap,
  ArrowRight,
  Bot,
  ScanLine,
  ArrowUpDown
} from 'lucide-react';

const MainContent: React.FC = () => {
  const { 
    medicines, 
    selectedCategory, 
    setSelectedCategory,
    searchQuery, 
    setSearchQuery, 
    activeView, 
    setActiveView,
    setPrescriptionModalOpen,
    setDrMedyChatOpen,
    addToast,
    user
  } = useApp();

  const [sortBy, setSortBy] = useState<'featured' | 'price_low' | 'price_high' | 'rating' | 'discount'>('featured');
  const [filterRx, setFilterRx] = useState<'all' | 'otc' | 'rx'>('all');

  // Filter medicines based on Category, Search Query, and Rx status
  const filteredMedicines = medicines.filter((med) => {
    const matchesCategory = selectedCategory === 'All' || med.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery = !query || 
      med.name.toLowerCase().includes(query) || 
      med.genericName.toLowerCase().includes(query) ||
      med.category.toLowerCase().includes(query) ||
      med.manufacturer.toLowerCase().includes(query) ||
      med.uses.some(u => u.toLowerCase().includes(query));

    const matchesRx = 
      filterRx === 'all' ? true : 
      filterRx === 'otc' ? !med.prescriptionRequired : 
      med.prescriptionRequired;

    return matchesCategory && matchesQuery && matchesRx;
  }).sort((a, b) => {
    if (sortBy === 'price_low') return a.price - b.price;
    if (sortBy === 'price_high') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'discount') {
      const discA = a.originalPrice ? (a.originalPrice - a.price) / a.originalPrice : 0;
      const discB = b.originalPrice ? (b.originalPrice - b.price) / b.originalPrice : 0;
      return discB - discA;
    }
    return 0; // featured default
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-emerald-200 selection:text-emerald-900 font-sans">
      <Header />

      <main className="flex-1">
        {/* VIEW 1: HOME / STORE */}
        {activeView === 'home' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
            
            {/* Redesigned Hero Section */}
            <HeroSection />

            {/* AI Features Spotlight Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div 
                onClick={() => setPrescriptionModalOpen(true)}
                className="bg-white hover:bg-emerald-50/40 p-4 sm:p-5 rounded-3xl border border-slate-200/90 hover:border-emerald-400 transition-all shadow-2xs hover:shadow-md group cursor-pointer flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-100/80 text-emerald-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <ScanLine className="w-6 h-6 text-emerald-700" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-extrabold text-slate-900 text-sm">AI Rx Vision OCR</h3>
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.2 rounded-md">Gemini</span>
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">Scan doctor handwriting to instant cart</p>
                </div>
              </div>

              <div 
                onClick={() => setDrMedyChatOpen(true)}
                className="bg-white hover:bg-teal-50/40 p-4 sm:p-5 rounded-3xl border border-slate-200/90 hover:border-teal-400 transition-all shadow-2xs hover:shadow-md group cursor-pointer flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-teal-100/80 text-teal-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Bot className="w-6 h-6 text-teal-700" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-extrabold text-slate-900 text-sm">Dr. Medy AI Chat</h3>
                    <span className="text-[9px] bg-teal-100 text-teal-800 font-extrabold px-1.5 py-0.2 rounded-md">24x7</span>
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">Dosages, generic salts & OTC guidance</p>
                </div>
              </div>

              <div 
                onClick={() => setActiveView('cart')}
                className="bg-white hover:bg-amber-50/40 p-4 sm:p-5 rounded-3xl border border-slate-200/90 hover:border-amber-400 transition-all shadow-2xs hover:shadow-md group cursor-pointer flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-100/80 text-amber-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-6 h-6 text-amber-700" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-extrabold text-slate-900 text-sm">Drug Safety Checker</h3>
                    <span className="text-[9px] bg-amber-100 text-amber-900 font-extrabold px-1.5 py-0.2 rounded-md">Safety</span>
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">Interaction alerts & diet timings in cart</p>
                </div>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <Pill className="w-5 h-5 text-emerald-700" />
                  <span>Browse by Category</span>
                </h2>
                {selectedCategory !== 'All' && (
                  <button 
                    onClick={() => setSelectedCategory('All')}
                    className="text-xs text-emerald-700 font-bold hover:underline cursor-pointer"
                  >
                    Reset filter
                  </button>
                )}
              </div>
              <CategoryFilter />
            </div>

            {/* Search active notification */}
            {searchQuery && (
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs">
                <span className="text-slate-800">
                  Showing results matching: <strong className="text-emerald-950 font-black">"{searchQuery}"</strong> ({filteredMedicines.length} found)
                </span>
                <button
                  onClick={() => setSearchQuery('')}
                  className="font-bold text-emerald-800 hover:text-emerald-950 underline cursor-pointer"
                >
                  Clear search
                </button>
              </div>
            )}

            {/* Medicine Grid Controls (Sort & Rx Filter) */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200/90 shadow-2xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <h2 className="text-base sm:text-lg font-black text-slate-900">
                    {searchQuery 
                      ? `Search Results (${filteredMedicines.length})` 
                      : selectedCategory === 'All' 
                        ? 'Popular & Essential Medicines' 
                        : `${selectedCategory} (${filteredMedicines.length})`}
                  </h2>
                </div>

                {/* Filter and Sort controls */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {/* OTC / Rx Filter */}
                  <div className="inline-flex bg-slate-100 p-1 rounded-xl">
                    <button
                      onClick={() => setFilterRx('all')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        filterRx === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setFilterRx('otc')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        filterRx === 'otc' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      OTC Safe
                    </button>
                    <button
                      onClick={() => setFilterRx('rx')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        filterRx === 'rx' ? 'bg-white text-rose-700 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Rx Required
                    </button>
                  </div>

                  {/* Sort Dropdown */}
                  <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200/60">
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
                    >
                      <option value="featured">Sort: Featured</option>
                      <option value="price_low">Price: Low to High</option>
                      <option value="price_high">Price: High to Low</option>
                      <option value="rating">Highest Rated</option>
                      <option value="discount">Biggest Discount</option>
                    </select>
                  </div>
                </div>
              </div>

              {filteredMedicines.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-sm">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">No medicines found</h3>
                  <p className="text-xs text-slate-500 mb-5">
                    We couldn't find any medicines matching your search or filters. You can scan your prescription or ask Dr. Medy for generic equivalents.
                  </p>
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('All');
                        setFilterRx('all');
                      }}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      View All Catalog
                    </button>
                    <button
                      onClick={() => setDrMedyChatOpen(true)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Ask Dr. Medy
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
                  {filteredMedicines.map((med) => (
                    <MedicineCard key={med.id} medicine={med} />
                  ))}
                </div>
              )}
            </div>

            {/* Value Props & Emergency Prescription Help Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-start gap-4">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">30-Min Fast Dispatch</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Live riders assigned immediately from the nearest verified neighborhood hub with cold-pack protection.
                  </p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-start gap-4">
                <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">100% Genuine Medicine</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Tamper-proof safety packaging directly from licensed pharmaceutical manufacturers & WHO-GMP certified distributors.
                  </p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-start gap-4">
                <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-slate-900 text-sm">Pharmacist Support</h4>
                    <a 
                      href={`tel:${HELPLINE_NUMBER}`} 
                      className="text-xs font-black text-emerald-700 hover:text-emerald-800 underline"
                    >
                      Call Helpline
                    </a>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Have dosage doubts? Our licensed pharmacists are available 24x7 at <strong className="text-slate-800">{HELPLINE_FORMATTED}</strong>.
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* VIEW 2: CART */}
        {activeView === 'cart' && <CartView />}

        {/* VIEW 3: PAYMENT / CHECKOUT */}
        {activeView === 'payment' && <PaymentSection />}

        {/* VIEW 4: ORDERS & TRACKING */}
        {activeView === 'orders' && <OrderTrackingView />}

        {/* VIEW 5: USER PROFILE */}
        {activeView === 'profile' && <UserProfileView />}

        {/* VIEW 6: ADMIN DASHBOARD */}
        {activeView === 'admin' && <AdminDashboardView />}
      </main>

      {/* Floating Dr. Medy Launcher Widget for instant access */}
      <button
        onClick={() => setDrMedyChatOpen(true)}
        className="fixed bottom-6 right-6 z-40 px-4 py-3 bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-600 hover:to-teal-700 text-white rounded-full shadow-2xl shadow-emerald-950/30 flex items-center gap-2.5 font-black text-xs sm:text-sm border border-emerald-400/40 hover:scale-105 transition-all cursor-pointer group"
        title="Ask Dr. Medy AI Pharmacist"
      >
        <div className="relative">
          <Bot className="w-5 h-5 text-emerald-200 group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping"></span>
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full"></span>
        </div>
        <span className="hidden sm:inline">Ask Dr. Medy (AI)</span>
      </button>

      {/* Global Modals & Overlays */}
      <MedicineDetailModal />
      <PrescriptionScannerModal />
      <DrMedyAiChat />
      <LoginModal />
      <ToastContainer />

      {/* Footer */}
      <footer className="mt-16 bg-slate-950 text-slate-400 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-900/40">
                  <Pill className="w-5 h-5 -rotate-45" />
                </div>
                <span className="text-xl font-black text-white tracking-tight">Medy<span className="text-emerald-400">Fay</span></span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Empowering quick, affordable, and licensed healthcare delivery directly to your door in 30 minutes.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Service Hubs</h4>
              <ul className="space-y-1.5 text-xs text-slate-400">
                <li>• Kolkata (Salt Lake, New Town, Park St)</li>
                <li>• Sylhet (Sadar, Zindabazar, Amberkhana)</li>
                <li>• Dhaka (Gulshan, Dhanmondi, Banani)</li>
                <li>• Mumbai & Bengaluru Metro Hubs</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Payment & Security</h4>
              <ul className="space-y-1.5 text-xs text-slate-400">
                <li>• Instant UPI & QR Pay</li>
                <li>• Credit / Debit Cards (Visa, RuPay)</li>
                <li>• Wallets & Net Banking</li>
                <li>• Cash on Delivery (COD)</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">24x7 Help & Contact</h4>
              <p className="text-xs text-slate-400 mb-2">
                Helpline / Support: <a href={`tel:${HELPLINE_NUMBER}`} className="text-emerald-400 font-bold hover:underline">{HELPLINE_FORMATTED}</a>
              </p>
              <p className="text-xs text-slate-400 mb-3">
                Email: <strong className="text-white">support@medyfay.com</strong>
              </p>
              <span className="inline-block bg-emerald-950 text-emerald-400 border border-emerald-800/80 px-2.5 py-1 rounded-lg text-[10px] font-bold">
                Licensed Chemist & Druggist Reg. #DL-94812
              </span>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px]">
            <span>© 2026 MedyFay Healthcare Technologies. All rights reserved.</span>
            <div className="flex items-center gap-4">
              <span>Always consult a qualified doctor before starting any medication.</span>
              <button
                onClick={() => setActiveView('admin')}
                className="text-emerald-400 hover:text-emerald-300 font-bold underline cursor-pointer"
              >
                Admin Console
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
