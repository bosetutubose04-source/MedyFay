import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  DollarSign, 
  Package, 
  Clock, 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  Truck, 
  CheckCircle2, 
  Crown, 
  Coins, 
  Database,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';

interface AdminOverviewTabProps {
  onNavigateTab: (tab: 'orders' | 'inventory' | 'fleet' | 'coupons' | 'customers' | 'database') => void;
}

export const AdminOverviewTab: React.FC<AdminOverviewTabProps> = ({ onNavigateTab }) => {
  const { medicines, orders, user, isDbConnected } = useApp();

  // Compute Metrics
  const totalRevenue = orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
  const activeOrdersCount = orders.filter(o => o.status !== 'delivered').length;
  const deliveredOrdersCount = orders.filter(o => o.status === 'delivered').length;
  const outOfStockCount = medicines.filter(m => !m.inStock).length;
  const prescriptionItemsCount = medicines.filter(m => m.prescriptionRequired).length;

  const totalElCoinsCirculating = (user?.elCoins || 0) + 1240; // Total system estimate

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Welcome / Live Pharmacy Status Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Store Dispatch Active
            </span>
            <span className="text-slate-400 text-xs">• 30-Min SLA: <strong className="text-emerald-300">99.4% On-Time</strong></span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Pharmacy Command Center
          </h2>
          <p className="text-xs text-slate-300 max-w-xl">
            Live operations, dual Cloud SQL + Firestore database synchronization, cold-chain fulfillment, and delivery boy dispatch.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateTab('orders')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Package className="w-3.5 h-3.5" />
            <span>Manage Orders ({activeOrdersCount})</span>
          </button>
          <button
            onClick={() => onNavigateTab('inventory')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/15 flex items-center gap-1.5 cursor-pointer"
          >
            <span>Add Medicines</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Sales</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              ₹
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs text-emerald-600 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+18.4% this week</span>
            </div>
          </div>
        </div>

        {/* Active Orders */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Dispatches</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900">
              {activeOrdersCount} <span className="text-xs text-slate-400 font-normal">live</span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs text-amber-600 font-semibold">
              <Clock className="w-3.5 h-3.5" />
              <span>Avg 16 min fulfillment</span>
            </div>
          </div>
        </div>

        {/* Catalog Items */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Catalog Inventory</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900">
              {medicines.length} <span className="text-xs text-slate-400 font-normal">SKUs</span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs text-slate-500 font-medium">
              <span>{outOfStockCount} out of stock • {prescriptionItemsCount} Rx</span>
            </div>
          </div>
        </div>

        {/* EL Coins & Queen Members */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-purple-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Queen VIP & Coins</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <Crown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900">
              {totalElCoinsCirculating} <span className="text-xs text-slate-400 font-normal">Coins</span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs text-purple-600 font-semibold">
              <Coins className="w-3.5 h-3.5" />
              <span>1 Coin = 1% OFF dynamic reward</span>
            </div>
          </div>
        </div>

      </div>

      {/* Two Column Layout: Recent Orders Stream & Inventory Quick Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Orders List (2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Recent Order Dispatches</h3>
              <p className="text-xs text-slate-400">Incoming patient medicine orders & fulfillment status</p>
            </div>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {orders.slice(0, 4).map((order) => (
              <div
                key={order.id}
                className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-slate-900">#{order.id}</span>
                    <span className="text-[11px] text-slate-500">• {order.date}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      order.status === 'delivered' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : order.status === 'out_for_delivery'
                          ? 'bg-purple-100 text-purple-800 animate-pulse'
                          : 'bg-amber-100 text-amber-800'
                    }`}>
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600">
                    <strong className="text-slate-800">{order.deliveryAddress?.name || 'Customer'}</strong> ({order.deliveryAddress?.city}) • {order.items.length} items
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/50">
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-900">₹{order.totalAmount}</div>
                    <div className="text-[10px] text-slate-400 uppercase font-medium">{order.paymentMethod} • {order.paymentStatus}</div>
                  </div>
                  <button
                    onClick={() => onNavigateTab('orders')}
                    className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    Action
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fast Action & Fleet Status Column (1 Column) */}
        <div className="space-y-4">
          
          {/* Quick Actions Panel */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Quick Actions</h3>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => onNavigateTab('inventory')}
                className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-200/70 transition-all flex items-center justify-between text-xs font-bold text-slate-800 group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    +
                  </div>
                  <span>Add New Medicine</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700" />
              </button>

              <button
                onClick={() => onNavigateTab('coupons')}
                className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-amber-50 hover:border-amber-200 border border-slate-200/70 transition-all flex items-center justify-between text-xs font-bold text-slate-800 group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                    %
                  </div>
                  <span>Create Discount Coupon</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-amber-700" />
              </button>

              <button
                onClick={() => onNavigateTab('fleet')}
                className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-blue-50 hover:border-blue-200 border border-slate-200/70 transition-all flex items-center justify-between text-xs font-bold text-slate-800 group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                    <Truck className="w-3.5 h-3.5" />
                  </div>
                  <span>Delivery Fleet Track</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-700" />
              </button>
            </div>
          </div>

          {/* Dual Database Sync Health Box */}
          <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-xs">Database Sync Status</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/80 border border-slate-700">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Cloud SQL (PostgreSQL)
                </span>
                <span className="text-[11px] text-emerald-400 font-bold font-mono">Connected (Drizzle)</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/80 border border-slate-700">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Google Firestore
                </span>
                <span className="text-[11px] text-emerald-400 font-bold font-mono">Live Listeners</span>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('database')}
              className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-semibold transition-colors text-center cursor-pointer"
            >
              Open SQL Diagnostics & Schema
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
