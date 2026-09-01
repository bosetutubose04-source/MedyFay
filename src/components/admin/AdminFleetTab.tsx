import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Truck, 
  MapPin, 
  Phone, 
  MessageSquare, 
  Zap, 
  BatteryMedium, 
  CheckCircle2, 
  Clock, 
  Plus, 
  ShieldAlert, 
  Radio, 
  AlertCircle,
  User
} from 'lucide-react';

interface DeliveryRider {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  vehicleNo: string;
  battery: number;
  status: 'on_route' | 'idle_at_hub' | 'pickup' | 'offline';
  currentOrderId?: string;
  location: string;
  completedToday: number;
  rating: number;
  avatar: string;
}

const INITIAL_RIDERS: DeliveryRider[] = [
  {
    id: 'RDR-101',
    name: 'Ramesh Kumar',
    phone: '+91 98301 22334',
    vehicle: 'Ather 450X Gen 3 (EV)',
    vehicleNo: 'WB 06 H 4921',
    battery: 88,
    status: 'on_route',
    currentOrderId: 'MED-89421',
    location: 'Park Street Flyover, Kolkata',
    completedToday: 14,
    rating: 4.9,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'RDR-102',
    name: 'Amit Sen',
    phone: '+91 98310 99881',
    vehicle: 'TVS iQube Electric',
    vehicleNo: 'WB 02 AC 7810',
    battery: 94,
    status: 'idle_at_hub',
    location: 'Central Salt Lake Hub Standby',
    completedToday: 9,
    rating: 4.85,
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'RDR-103',
    name: 'Priya Das',
    phone: '+91 98322 44556',
    vehicle: 'Honda Activa 6G Hybrid',
    vehicleNo: 'WB 20 AK 3012',
    battery: 79,
    status: 'pickup',
    currentOrderId: 'MED-94102',
    location: 'New Town Action Area 1',
    completedToday: 11,
    rating: 4.95,
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'RDR-104',
    name: 'Bikash Roy',
    phone: '+91 98344 11223',
    vehicle: 'Ola S1 Pro Gen 2',
    vehicleNo: 'WB 04 BE 9011',
    battery: 65,
    status: 'on_route',
    currentOrderId: 'MED-89302',
    location: 'Gariahat Market Crossing',
    completedToday: 16,
    rating: 4.9,
    avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&auto=format&fit=crop&q=80',
  },
];

export const AdminFleetTab: React.FC = () => {
  const { addToast } = useApp();
  const [riders, setRiders] = useState<DeliveryRider[]>(INITIAL_RIDERS);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddRiderModal, setShowAddRiderModal] = useState(false);
  const [newRiderName, setNewRiderName] = useState('');
  const [newRiderPhone, setNewRiderPhone] = useState('');
  const [newRiderVehicle, setNewRiderVehicle] = useState('Ather 450X EV');

  const filteredRiders = riders.filter(r => {
    if (statusFilter === 'all') return true;
    return r.status === statusFilter;
  });

  const handleSendPing = (riderName: string) => {
    addToast(`Telemetry priority ping dispatched to ${riderName}`, 'info');
  };

  const handleAddRider = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRiderName.trim() || !newRiderPhone.trim()) return;

    const newRider: DeliveryRider = {
      id: `RDR-${Math.floor(100 + Math.random() * 900)}`,
      name: newRiderName.trim(),
      phone: newRiderPhone.trim(),
      vehicle: newRiderVehicle,
      vehicleNo: `WB ${Math.floor(10 + Math.random() * 89)} E ${Math.floor(1000 + Math.random() * 8999)}`,
      battery: 100,
      status: 'idle_at_hub',
      location: 'Central Salt Lake Hub Standby',
      completedToday: 0,
      rating: 5.0,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
    };

    setRiders([newRider, ...riders]);
    setShowAddRiderModal(false);
    setNewRiderName('');
    setNewRiderPhone('');
    addToast(`Delivery Partner ${newRider.name} onboarded!`, 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Fleet Overview Top Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-slate-900 text-base">Active Delivery Fleet</h3>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Telemetry
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor GPS positions, EV battery levels, active dispatch orders & rider ratings
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-white"
          >
            <option value="all">All Riders ({riders.length})</option>
            <option value="on_route">On Route (Active Delivery)</option>
            <option value="idle_at_hub">Standby at Hub</option>
            <option value="pickup">Pharmacy Packing Pickup</option>
          </select>

          <button
            onClick={() => setShowAddRiderModal(true)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Onboard Rider</span>
          </button>
        </div>
      </div>

      {/* Fleet Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRiders.map(rider => (
          <div
            key={rider.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-emerald-300 transition-all space-y-4"
          >
            {/* Header: Rider Info & Status */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={rider.avatar}
                  alt={rider.name}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-sm">{rider.name}</span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 font-mono px-1.5 py-0.5 rounded font-bold">
                      {rider.id}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 font-medium">{rider.vehicle} • {rider.vehicleNo}</div>
                </div>
              </div>

              {/* Status Badge */}
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                rider.status === 'on_route'
                  ? 'bg-purple-100 text-purple-800 animate-pulse'
                  : rider.status === 'pickup'
                    ? 'bg-amber-100 text-amber-900'
                    : 'bg-emerald-100 text-emerald-800'
              }`}>
                {rider.status.replace(/_/g, ' ')}
              </span>
            </div>

            {/* Metrics: Location, Battery, Deliveries */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">EV Battery</span>
                <div className="flex items-center gap-1 font-bold text-slate-800 mt-0.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>{rider.battery}%</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Today</span>
                <div className="font-bold text-slate-800 mt-0.5">
                  {rider.completedToday} orders
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Rating</span>
                <div className="font-bold text-emerald-700 mt-0.5">
                  ★ {rider.rating}
                </div>
              </div>
            </div>

            {/* Current Order or Standby Position */}
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate"><strong>Location:</strong> {rider.location}</span>
            </div>

            {rider.currentOrderId && (
              <div className="flex items-center justify-between text-xs px-3 py-1.5 bg-purple-50 rounded-lg border border-purple-200 text-purple-900 font-medium">
                <span>Active Delivery: <strong>#{rider.currentOrderId}</strong></span>
                <span className="text-[11px] font-bold text-purple-700">Live GPS Connected</span>
              </div>
            )}

            {/* Actions */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
              <a
                href={`tel:${rider.phone.replace(/\s+/g, '')}`}
                className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span>Call Rider</span>
              </a>

              <a
                href={`https://wa.me/${rider.phone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp</span>
              </a>

              <button
                onClick={() => handleSendPing(rider.name)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                title="Send GPS Telemetry Ping"
              >
                <Radio className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Onboard Rider Modal */}
      {showAddRiderModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Onboard Delivery Partner</h3>
              <p className="text-xs text-slate-500">Register active rider for 30-minute neighborhood dispatch</p>
            </div>

            <form onSubmit={handleAddRider} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Rider Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Subhashish Roy"
                  value={newRiderName}
                  onChange={e => setNewRiderName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Contact (+91)</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 98300 12345"
                  value={newRiderPhone}
                  onChange={e => setNewRiderPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Vehicle</label>
                <select
                  value={newRiderVehicle}
                  onChange={e => setNewRiderVehicle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-white"
                >
                  <option value="Ather 450X Gen 3 (EV)">Ather 450X Gen 3 (EV)</option>
                  <option value="TVS iQube Electric">TVS iQube Electric</option>
                  <option value="Ola S1 Pro Gen 2">Ola S1 Pro Gen 2</option>
                  <option value="Honda Activa 6G">Honda Activa 6G</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddRiderModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Complete Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
