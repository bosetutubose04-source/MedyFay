import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Order, OrderStatus } from '../../types';
import { 
  Package, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  Truck, 
  MapPin, 
  Phone, 
  ChevronRight, 
  FileText, 
  Printer, 
  ArrowRight,
  ShieldCheck,
  User,
  Crown,
  Sparkles
} from 'lucide-react';

export const AdminOrdersTab: React.FC = () => {
  const { orders, updateSpecificOrderStatus, addToast } = useApp();
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesStatus = selectedStatusFilter === 'all' || order.status === selectedStatusFilter;
    const q = orderSearchQuery.toLowerCase().trim();
    const matchesQuery = !q || 
      order.id.toLowerCase().includes(q) ||
      (order.deliveryAddress?.name && order.deliveryAddress.name.toLowerCase().includes(q)) ||
      (order.deliveryAddress?.mobile && order.deliveryAddress.mobile.includes(q)) ||
      (order.deliveryAddress?.city && order.deliveryAddress.city.toLowerCase().includes(q));
    return matchesStatus && matchesQuery;
  });

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    await updateSpecificOrderStatus(orderId, newStatus);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Controls & Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search orders by ID (#MED-...), customer name, mobile, city..."
            value={orderSearchQuery}
            onChange={e => setOrderSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 bg-slate-50/50"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { key: 'all', label: 'All Orders', count: orders.length },
            { key: 'confirmed', label: 'Confirmed', count: orders.filter(o => o.status === 'confirmed').length },
            { key: 'packing', label: 'Packing', count: orders.filter(o => o.status === 'packing').length },
            { key: 'out_for_delivery', label: 'Out for Delivery', count: orders.filter(o => o.status === 'out_for_delivery').length },
            { key: 'delivered', label: 'Delivered', count: orders.filter(o => o.status === 'delivered').length },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setSelectedStatusFilter(tab.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                selectedStatusFilter === tab.key
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                selectedStatusFilter === tab.key ? 'bg-slate-700 text-emerald-300' : 'bg-slate-200 text-slate-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

      </div>

      {/* Orders Grid / Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Package className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <h4 className="font-bold text-slate-800 text-sm">No orders match the selected filter</h4>
            <p className="text-xs text-slate-400 mt-1">Try resetting the status filter or clearing your search term.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredOrders.map(order => (
              <div
                key={order.id}
                className="p-4 sm:p-5 hover:bg-slate-50/80 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Left: Order ID, Customer, Address */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-extrabold text-sm text-slate-900">#{order.id}</span>
                    <span className="text-xs text-slate-400">• {order.date}</span>
                    
                    {/* Status Pill */}
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                      order.status === 'delivered'
                        ? 'bg-emerald-100 text-emerald-800'
                        : order.status === 'out_for_delivery'
                          ? 'bg-purple-100 text-purple-800 animate-pulse'
                          : order.status === 'packing'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-blue-100 text-blue-800'
                    }`}>
                      {order.status.replace(/_/g, ' ')}
                    </span>

                    <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                      {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                    </span>
                  </div>

                  {/* Customer Information */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                    <span className="flex items-center gap-1 font-semibold text-slate-900">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {order.deliveryAddress?.name || 'Customer'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {order.deliveryAddress?.mobile || '+91 98765 43210'}
                    </span>
                    <span className="flex items-center gap-1 text-slate-500 truncate max-w-xs">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {order.deliveryAddress?.street}, {order.deliveryAddress?.city}
                    </span>
                  </div>

                  {/* Items summary */}
                  <div className="text-[11px] text-slate-500 line-clamp-1">
                    Items: {order.items.map(it => `${it.medicine.name} (${it.quantity}x)`).join(', ')}
                  </div>
                </div>

                {/* Right: Payment, Pricing & Quick Dispatch Controls */}
                <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  
                  {/* Total & Payment Badge */}
                  <div className="text-left lg:text-right">
                    <div className="text-sm font-extrabold text-slate-900">
                      ₹{order.totalAmount}
                    </div>
                    <div className="text-[10px] text-slate-500 uppercase font-medium flex items-center gap-1">
                      <span>{order.paymentMethod}</span>
                      <span>•</span>
                      <span className={order.paymentStatus === 'paid' ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                        {order.paymentStatus}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1.5">
                    
                    {/* Status Advance Selector */}
                    <select
                      value={order.status}
                      onChange={e => handleStatusChange(order.id, e.target.value as OrderStatus)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 cursor-pointer"
                    >
                      <option value="confirmed">1. Confirmed</option>
                      <option value="packing">2. Packing</option>
                      <option value="out_for_delivery">3. Out for Delivery</option>
                      <option value="delivered">4. Delivered</option>
                    </select>

                    {/* View Details / Invoice */}
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowInvoiceModal(true);
                      }}
                      className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl transition-colors cursor-pointer"
                      title="View Invoice & Packaging Slip"
                    >
                      <FileText className="w-4 h-4" />
                    </button>

                  </div>

                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Invoice & Order Detail Modal */}
      {showInvoiceModal && selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-t-2xl">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>Order Invoice #{selectedOrder.id}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    selectedOrder.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {selectedOrder.status.replace(/_/g, ' ')}
                  </span>
                </h3>
                <p className="text-xs text-slate-500">MedyFay Pharmacy Licensed Fulfillment Slip</p>
              </div>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
              
              {/* Delivery Address & Customer Details */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">Deliver To</span>
                <div className="font-bold text-slate-900 text-sm">{selectedOrder.deliveryAddress?.name}</div>
                <div>{selectedOrder.deliveryAddress?.street}</div>
                <div>{selectedOrder.deliveryAddress?.city} • Contact: <strong>{selectedOrder.deliveryAddress?.mobile}</strong></div>
              </div>

              {/* Items List */}
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-2">Prescribed Medications</span>
                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-900">{item.medicine.name}</div>
                        <div className="text-[11px] text-slate-400">{item.medicine.packSize} • {item.medicine.genericName}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-800">{item.quantity} x ₹{item.medicine.price}</div>
                        <div className="text-[11px] text-emerald-700 font-bold">₹{item.quantity * item.medicine.price}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span>₹{selectedOrder.subtotal}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount / Promo</span>
                    <span>-₹{selectedOrder.discount}</span>
                  </div>
                )}
                {selectedOrder.coinDiscount && selectedOrder.coinDiscount > 0 && (
                  <div className="flex justify-between text-amber-600 font-medium">
                    <span>EL Coins Redeemed ({selectedOrder.elCoinsRedeemed} Coins)</span>
                    <span>-₹{selectedOrder.coinDiscount}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500">
                  <span>Delivery SLA Fee</span>
                  <span>{selectedOrder.deliveryFee === 0 ? 'FREE (Express 30-min)' : `₹${selectedOrder.deliveryFee}`}</span>
                </div>
                <div className="flex justify-between text-slate-900 font-extrabold text-sm pt-2 border-t border-slate-200">
                  <span>Total Amount</span>
                  <span>₹{selectedOrder.totalAmount}</span>
                </div>
              </div>

              {/* Print Action */}
              <div className="pt-3 flex gap-3">
                <button
                  onClick={() => {
                    addToast('Print packing label sent to dispatch thermal printer', 'success');
                  }}
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Packaging Label</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
