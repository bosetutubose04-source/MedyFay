import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  LayoutDashboard, 
  Package, 
  Pill, 
  Truck, 
  Tag, 
  Users, 
  Database, 
  ArrowLeft, 
  ShieldCheck, 
  Sparkles,
  Bell,
  Search,
  CheckCircle2,
  Store
} from 'lucide-react';
import { AdminOverviewTab } from './AdminOverviewTab';
import { AdminOrdersTab } from './AdminOrdersTab';
import { AdminInventoryTab } from './AdminInventoryTab';
import { AdminFleetTab } from './AdminFleetTab';
import { AdminCouponsTab } from './AdminCouponsTab';
import { AdminCustomersTab } from './AdminCustomersTab';
import { AdminDatabaseTab } from './AdminDatabaseTab';

type AdminTab = 'overview' | 'orders' | 'inventory' | 'fleet' | 'coupons' | 'customers' | 'database';

interface AdminNavItem {
  id: AdminTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  badgeColor?: string;
}

export const AdminDashboardView: React.FC = () => {
  const { setActiveView, orders, medicines } = useApp();
  const [currentTab, setCurrentTab] = useState<AdminTab>('overview');

  const activeOrdersCount = orders.filter(o => o.status !== 'delivered').length;
  const outOfStockCount = medicines.filter(m => !m.inStock).length;

  const NAV_ITEMS: AdminNavItem[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders & Dispatch', icon: Package, badge: activeOrdersCount > 0 ? activeOrdersCount : undefined, badgeColor: 'bg-amber-500 text-slate-950' },
    { id: 'inventory', label: 'Medicine Catalog', icon: Pill, badge: outOfStockCount > 0 ? `${outOfStockCount} out` : undefined, badgeColor: 'bg-rose-500 text-white' },
    { id: 'fleet', label: 'Delivery Fleet', icon: Truck },
    { id: 'coupons', label: 'Coupons & Deals', icon: Tag },
    { id: 'customers', label: 'Customers & VIP', icon: Users },
    { id: 'database', label: 'Dual-DB Diagnostics', icon: Database },
  ];

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-100/70 pb-16">
      
      {/* Admin Top Navigation Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-16 sm:top-20 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-4">
            
            {/* Left: Admin Title & Back to Store */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveView('home')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                title="Return to Customer Store"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Storefront</span>
              </button>

              <div className="h-5 w-px bg-slate-200" />

              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-800 text-emerald-100 flex items-center justify-center font-extrabold text-xs">
                  A
                </div>
                <div>
                  <h1 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-tight">
                    MedyFay Admin Console
                  </h1>
                  <span className="text-[10px] text-emerald-700 font-bold block -mt-0.5">
                    Super Admin Access
                  </span>
                </div>
              </div>
            </div>

            {/* Right: DB Status & Live Store link */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Cloud SQL + Firestore Synced</span>
              </div>

              <button
                onClick={() => setActiveView('home')}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Store className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">View Live Store</span>
              </button>
            </div>

          </div>

          {/* Sub-tab Navigation Links (Scrollable on mobile) */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-2 -mb-px border-t border-slate-100">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id as AdminTab)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

        </div>
      </div>

      {/* Main Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'overview' && (
          <AdminOverviewTab onNavigateTab={(tab) => setCurrentTab(tab as AdminTab)} />
        )}
        {currentTab === 'orders' && <AdminOrdersTab />}
        {currentTab === 'inventory' && <AdminInventoryTab />}
        {currentTab === 'fleet' && <AdminFleetTab />}
        {currentTab === 'coupons' && <AdminCouponsTab />}
        {currentTab === 'customers' && <AdminCustomersTab />}
        {currentTab === 'database' && <AdminDatabaseTab />}
      </div>

    </div>
  );
};
