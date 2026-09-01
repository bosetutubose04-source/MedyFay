import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Package, 
  CheckCircle2, 
  Clock, 
  Truck, 
  MapPin, 
  Phone, 
  RefreshCw, 
  ArrowRight, 
  ShieldCheck,
  Building2,
  Database,
  FastForward,
  Headphones,
  Coins,
  Ticket
} from 'lucide-react';
import { Order } from '../../types';
import { HELPLINE_NUMBER, HELPLINE_FORMATTED } from '../../data/medicines';
import { DeliveryLiveMap } from './DeliveryLiveMap';

export const OrderTrackingView: React.FC = () => {
  const { orders, setActiveView, addToCart, addToast, advanceOrderStatus, isDbConnected } = useApp();

  const handleReorder = (order: Order) => {
    order.items.forEach(item => {
      addToCart(item.medicine, item.quantity);
    });
    addToast('Items added to cart from previous order!', 'success');
    setActiveView('cart');
  };

  if (orders.length === 0) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-4">
          <Package className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">No Past Orders Found</h2>
        <p className="text-slate-500 text-xs sm:text-sm mb-6">
          You haven't placed any medicine orders yet.
        </p>
        <button
          onClick={() => setActiveView('home')}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Your Orders & Live Tracking</h1>
            {isDbConnected && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <Database className="w-3 h-3 text-emerald-600" /> Firestore Live Sync
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500">Track current deliveries and view order history with real-time updates</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`tel:${HELPLINE_NUMBER}`}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition-colors"
            title="Call Order Support"
          >
            <Headphones className="w-3.5 h-3.5 text-emerald-600" />
            <span>Support: {HELPLINE_NUMBER}</span>
          </a>
          <button
            onClick={() => setActiveView('home')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <span>Order More</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {orders.map((order, idx) => {
          const isLatest = idx === 0;

          return (
            <div 
              key={order.id} 
              className={`bg-white rounded-2xl border ${isLatest ? 'border-emerald-500 shadow-md ring-1 ring-emerald-500/20' : 'border-slate-200 shadow-xs'} overflow-hidden`}
            >
              {/* Order Top Bar */}
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
                          Active Delivery
                        </span>
                      )}
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
                    className="px-3 py-1.5 rounded-xl border border-slate-300 hover:border-emerald-600 bg-white text-slate-700 hover:text-emerald-700 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Re-Order
                  </button>
                </div>
              </div>

              {/* Status Timeline */}
              <div className="p-4 sm:p-6 border-b border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Delivery Status</h4>
                  {order.status !== 'delivered' && (
                    <button
                      onClick={() => advanceOrderStatus(order.id)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg transition-colors"
                      title="Simulate next status update in Firestore database"
                    >
                      <FastForward className="w-3 h-3" /> Advance Status (Simulate Delivery)
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
                    <span className="text-[9px] text-slate-400">Verified by Pharmacist</span>
                  </div>

                  {/* Step 2: Packing */}
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-8 h-8 rounded-full ${order.status === 'packing' || order.status === 'out_for_delivery' || order.status === 'delivered' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'} flex items-center justify-center text-xs font-bold mb-1.5 z-10 shadow-xs`}>
                      <Building2 className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-800">Sealed & Packed</span>
                    <span className="text-[9px] text-slate-400">Quality Checked</span>
                  </div>

                  {/* Step 3: Out for delivery */}
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-8 h-8 rounded-full ${order.status === 'out_for_delivery' || order.status === 'delivered' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'} flex items-center justify-center text-xs font-bold mb-1.5 z-10 shadow-xs`}>
                      <Truck className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-800">Out for Delivery</span>
                    <span className="text-[9px] text-slate-400">{order.estimatedDelivery}</span>
                  </div>

                  {/* Step 4: Delivered */}
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-8 h-8 rounded-full ${order.status === 'delivered' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'} flex items-center justify-center text-xs font-bold mb-1.5 z-10 shadow-xs`}>
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-800">Delivered</span>
                    <span className="text-[9px] text-slate-400">Contactless Handover</span>
                  </div>
                </div>

                {/* Live Delivery Partner Map & Telemetry (For Active Order) */}
                {isLatest && (
                  <div className="mt-6">
                    <DeliveryLiveMap order={order} />
                  </div>
                )}
              </div>

              {/* Items in order */}
              <div className="p-4 sm:p-6">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Items in this Package</h4>
                <div className="divide-y divide-slate-100">
                  {order.items.map((item, i) => (
                    <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <img 
                          src={item.medicine.image} 
                          alt={item.medicine.name} 
                          referrerPolicy="no-referrer"
                          className="w-8 h-8 rounded-md object-cover bg-slate-100" 
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=700&auto=format&fit=crop&q=80';
                          }}
                        />
                        <div>
                          <span className="font-bold text-slate-800">{item.medicine.name}</span>
                          <span className="text-slate-400 block font-mono">{item.medicine.packSize}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-600 font-medium">Qty: {item.quantity} × ₹{item.medicine.price}</span>
                        <div className="font-bold text-slate-900">₹{item.quantity * item.medicine.price}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Loyalty & Promo summary */}
                {((order.elCoinsEarned && order.elCoinsEarned > 0) || (order.elCoinsRedeemed && order.elCoinsRedeemed > 0) || order.couponCode) && (
                  <div className="mt-3 p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      {order.elCoinsEarned && order.elCoinsEarned > 0 ? (
                        <span className="inline-flex items-center gap-1 font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md text-[11px]">
                          <Coins className="w-3.5 h-3.5 text-amber-600" /> +{order.elCoinsEarned} EL Coins Earned
                        </span>
                      ) : null}
                      {order.elCoinsRedeemed && order.elCoinsRedeemed > 0 ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md text-[11px]">
                          <Coins className="w-3.5 h-3.5 text-emerald-600" /> {order.elCoinsRedeemed} Coins Redeemed (-₹{order.coinDiscount})
                        </span>
                      ) : null}
                    </div>

                    {order.couponCode && (
                      <span className="inline-flex items-center gap-1 font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200 text-[11px]">
                        <Ticket className="w-3.5 h-3.5 text-emerald-600" /> {order.couponCode} (-₹{order.couponDiscount || order.discount})
                      </span>
                    )}
                  </div>
                )}

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Delivering to: <strong className="text-slate-700">{order.deliveryAddress.street}, {order.deliveryAddress.city}</strong></span>
                  </div>
                  <span className="font-semibold capitalize">Payment: {order.paymentMethod.toUpperCase()} ({order.paymentStatus})</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

