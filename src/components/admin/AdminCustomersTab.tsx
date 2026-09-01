import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserProfile } from '../../types';
import { 
  Users, 
  Search, 
  Crown, 
  Coins, 
  Phone, 
  MapPin, 
  Calendar, 
  Plus, 
  CheckCircle2, 
  Sparkles,
  ShieldCheck,
  Edit2
} from 'lucide-react';

const MOCK_REGISTERED_USERS: UserProfile[] = [
  {
    name: 'Rohan Bose',
    mobile: '+91 98765 43210',
    email: 'rohan.bose@medyfay.com',
    address: 'Flat 4B, Greenwood Heights, Salt Lake Sector V',
    city: 'Kolkata',
    pincode: '700091',
    memberSince: 'Aug 2024',
    ordersCount: 5,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    elCoins: 25,
    isQueenMember: true,
    queenTier: 'Emerald VIP',
    queenExpiry: '26 Aug 2027',
    queenSavings: 1480,
  },
  {
    name: 'Ananya Sen',
    mobile: '+91 98311 55443',
    email: 'ananya.sen@gmail.com',
    address: '12B Ballygunge Circular Road',
    city: 'Kolkata',
    pincode: '700019',
    memberSince: 'Sep 2024',
    ordersCount: 8,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
    elCoins: 40,
    isQueenMember: true,
    queenTier: 'Emerald VIP',
    queenExpiry: '15 Oct 2027',
    queenSavings: 2350,
  },
  {
    name: 'Dr. Debabrata Roy',
    mobile: '+91 98302 77889',
    email: 'dr.roy@medyfay.com',
    address: 'Block CF-18, Action Area 1, New Town',
    city: 'Kolkata',
    pincode: '700156',
    memberSince: 'Jul 2024',
    ordersCount: 12,
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80',
    elCoins: 65,
    isQueenMember: true,
    queenTier: 'Diamond Royal',
    queenExpiry: '01 Jan 2028',
    queenSavings: 4920,
  },
  {
    name: 'Tanima Mukherjee',
    mobile: '+91 98333 11224',
    email: 'tanima.m@yahoo.com',
    address: 'Shibpur Road, Mandirtala',
    city: 'Howrah',
    pincode: '711102',
    memberSince: 'Nov 2024',
    ordersCount: 3,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
    elCoins: 15,
    isQueenMember: false,
  },
];

export const AdminCustomersTab: React.FC = () => {
  const { user, updateUserProfile, addToast } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [customerList, setCustomerList] = useState<UserProfile[]>(() => {
    if (user) {
      const exists = MOCK_REGISTERED_USERS.some(u => u.mobile === user.mobile);
      if (!exists) {
        return [user, ...MOCK_REGISTERED_USERS];
      }
    }
    return MOCK_REGISTERED_USERS;
  });

  const [selectedCustomer, setSelectedCustomer] = useState<UserProfile | null>(null);
  const [coinsAdjustment, setCoinsAdjustment] = useState<number>(10);
  const [adjustmentReason, setAdjustmentReason] = useState('Loyalty Promotional Reward');

  const filteredCustomers = customerList.filter(c => {
    const q = searchQuery.toLowerCase().trim();
    return !q ||
      c.name.toLowerCase().includes(q) ||
      c.mobile.includes(q) ||
      c.city.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q);
  });

  const handleGrantCoins = (customer: UserProfile) => {
    const updatedCoins = (customer.elCoins || 0) + coinsAdjustment;
    setCustomerList(prev => prev.map(c => c.mobile === customer.mobile ? { ...c, elCoins: updatedCoins } : c));
    
    if (user && user.mobile === customer.mobile) {
      updateUserProfile({ elCoins: updatedCoins });
    }

    addToast(`Credited +${coinsAdjustment} EL Coins to ${customer.name}!`, 'success');
    setSelectedCustomer(null);
  };

  const handleToggleQueenVip = (customer: UserProfile) => {
    const newStatus = !customer.isQueenMember;
    setCustomerList(prev => prev.map(c => c.mobile === customer.mobile ? {
      ...c,
      isQueenMember: newStatus,
      queenTier: newStatus ? 'Emerald VIP' : undefined,
      queenExpiry: newStatus ? '26 Aug 2027' : undefined
    } : c));

    if (user && user.mobile === customer.mobile) {
      updateUserProfile({
        isQueenMember: newStatus,
        queenTier: newStatus ? 'Emerald VIP' : undefined,
        queenExpiry: newStatus ? '26 Aug 2027' : undefined
      });
    }

    addToast(`${customer.name} Queen VIP status set to: ${newStatus ? 'ACTIVE' : 'INACTIVE'}`, 'info');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header & Search */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-slate-900 text-base">Customer & Queen VIP Registry</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage customer wallets, EL Coin reward allocations & Queen VIP memberships
          </p>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer name, mobile, city..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-slate-50/50"
          />
        </div>
      </div>

      {/* Customers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCustomers.map(customer => (
          <div
            key={customer.mobile}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-emerald-300 transition-all space-y-4"
          >
            {/* Top row: Avatar & Profile */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={customer.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'}
                    alt={customer.name}
                    className="w-12 h-12 rounded-2xl object-cover border border-slate-200"
                  />
                  {customer.isQueenMember && (
                    <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-slate-950 p-1 rounded-full ring-2 ring-white shadow-xs">
                      <Crown className="w-3 h-3 fill-slate-950" />
                    </span>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-sm">{customer.name}</span>
                    {customer.isQueenMember && (
                      <span className="px-2 py-0.2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-[10px] font-black rounded-full uppercase tracking-wider">
                        Queen VIP
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 font-medium">{customer.email}</div>
                </div>
              </div>

              {/* Coins badge */}
              <div className="text-right">
                <div className="flex items-center gap-1 text-amber-900 font-extrabold text-xs px-2.5 py-1 bg-amber-50 rounded-xl border border-amber-200/80">
                  <Coins className="w-3.5 h-3.5 text-amber-600" />
                  <span>{customer.elCoins || 0} Coins</span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">1 Coin = 1% OFF</span>
              </div>
            </div>

            {/* Address & City */}
            <div className="space-y-1 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200/70">
              <div className="flex items-center gap-1.5 font-medium text-slate-800">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{customer.mobile}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-500">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{customer.address}, {customer.city}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200/50">
                <span>Joined: {customer.memberSince}</span>
                <span>{customer.ordersCount} lifetime orders</span>
              </div>
            </div>

            {/* Admin Actions */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => setSelectedCustomer(customer)}
                className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Coins className="w-3.5 h-3.5 text-amber-600" />
                <span>Adjust EL Coins</span>
              </button>

              <button
                onClick={() => handleToggleQueenVip(customer)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                  customer.isQueenMember
                    ? 'bg-rose-50 hover:bg-rose-100 text-rose-800'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
                }`}
              >
                <Crown className="w-3.5 h-3.5" />
                <span>{customer.isQueenMember ? 'Revoke VIP' : 'Gift Queen VIP'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Adjust Coins Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Adjust EL Coins Wallet</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Credit bonus reward coins to <strong>{selectedCustomer.name}</strong>
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Coins to Add</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={coinsAdjustment}
                  onChange={e => setCoinsAdjustment(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs font-bold text-amber-900 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reason / Note</label>
                <input
                  type="text"
                  value={adjustmentReason}
                  onChange={e => setAdjustmentReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCustomer(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleGrantCoins(selectedCustomer)}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-md cursor-pointer"
                >
                  Credit Coins
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
