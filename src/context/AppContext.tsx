import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Medicine, 
  CartItem, 
  UserProfile, 
  Order, 
  ActiveView, 
  Category, 
  ToastMessage, 
  PaymentMethodType,
  Coupon,
  ElCoinHistory
} from '../types';
import { MEDICINES_DATA, AVAILABLE_COUPONS, EL_COINS_RULES } from '../data/medicines';
import { checkDeliveryAvailability } from '../utils/deliveryValidation';
import { 
  initAnonymousAuth, 
  seedMedicinesIfEmpty, 
  saveUserProfile, 
  createOrderInFirestore, 
  subscribeToOrders,
  updateOrderStatusInFirestore,
  saveMedicineToFirestore,
  deleteMedicineFromFirestore
} from '../lib/firebase';

interface AppContextType {
  // Auth & Profile
  user: UserProfile | null;
  isLoggedIn: boolean;
  loginModalOpen: boolean;
  setLoginModalOpen: (open: boolean) => void;
  login: (mobile: string, location: string, name?: string) => void;
  logout: () => void;
  updateLocation: (newLocation: string) => void;
  updateUserProfile: (profile: Partial<UserProfile>) => Promise<void>;

  // Catalog & Navigation
  medicines: Medicine[];
  selectedCategory: Category;
  setSelectedCategory: (cat: Category) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  selectedMedicine: Medicine | null;
  setSelectedMedicine: (med: Medicine | null) => void;

  // Admin Catalog & Orders CRUD
  addMedicine: (med: Medicine) => Promise<void>;
  updateMedicine: (id: string, updates: Partial<Medicine>) => Promise<void>;
  deleteMedicine: (id: string) => Promise<void>;
  updateSpecificOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  addCoupon: (coupon: Coupon) => void;
  deleteCoupon: (code: string) => void;
  adminCoupons: Coupon[];

  // Cart & Pricing
  cart: CartItem[];
  addToCart: (med: Medicine, qty?: number) => void;
  removeFromCart: (medId: string) => void;
  updateQuantity: (medId: string, delta: number) => void;
  clearCart: () => void;
  getItemQuantity: (medId: string) => number;
  cartItemCount: number;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  couponDiscount: number;
  coinDiscount: number;
  total: number;

  // Coupons & EL Coins
  availableCoupons: Coupon[];
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  appliedCoins: number;
  setAppliedCoins: (coins: number) => void;
  toggleRedeemAllCoins: () => void;
  willEarnCoins: boolean;
  coinsToEarn: number;

  // Orders
  orders: Order[];
  activeOrder: Order | null;
  setActiveOrder: (order: Order | null) => void;
  placeOrder: (paymentMethod: PaymentMethodType) => Promise<Order>;
  advanceOrderStatus: (orderId: string) => Promise<void>;

  // AI Features State & Modals
  prescriptionModalOpen: boolean;
  setPrescriptionModalOpen: (open: boolean) => void;
  drMedyChatOpen: boolean;
  setDrMedyChatOpen: (open: boolean) => void;
  openDrMedyWithPrompt: (prompt: string) => void;
  pendingAiPrompt: string;
  clearPendingAiPrompt: () => void;

  // Toasts & Sync
  isDbConnected: boolean;
  toasts: ToastMessage[];
  addToast: (text: string, type?: 'success' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: 'medyfay_user',
  CART: 'medyfay_cart',
  ORDERS: 'medyfay_orders',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial User
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        if (typeof parsed.elCoins !== 'number') {
          parsed.elCoins = 15; // default 15 welcome EL coins
        }
        return parsed;
      } catch { return null; }
    }
    return {
      name: 'Rohan Bose',
      mobile: '+91 98765 43210',
      email: 'rohan.bose@medyfay.com',
      address: 'Flat 4B, Greenwood Heights, Salt Lake Sector V',
      city: 'Kolkata',
      pincode: '700091',
      memberSince: 'August 2024',
      ordersCount: 2,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      elCoins: 25, // initial balance for easy testing
      coinHistory: [
        {
          id: 'ch-1',
          date: '10 Aug 2024',
          type: 'earned',
          amount: 15,
          reason: 'Welcome Signup Bonus'
        },
        {
          id: 'ch-2',
          date: '17 Aug 2024',
          type: 'earned',
          amount: 10,
          reason: 'Order #MED-89421 bonus (Order > ₹500)'
        }
      ]
    };
  });

  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [prescriptionModalOpen, setPrescriptionModalOpen] = useState(false);
  const [drMedyChatOpen, setDrMedyChatOpen] = useState(false);
  const [pendingAiPrompt, setPendingAiPrompt] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeView, setActiveView] = useState<ActiveView>('home');
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [medicines, setMedicines] = useState<Medicine[]>(MEDICINES_DATA);
  const [isDbConnected, setIsDbConnected] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Coupons & Coins State
  const [adminCoupons, setAdminCoupons] = useState<Coupon[]>(AVAILABLE_COUPONS);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [appliedCoins, setAppliedCoins] = useState<number>(0);

  // Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CART);
    if (saved) {
      try { return JSON.parse(saved); } catch { return []; }
    }
    return [
      { medicine: MEDICINES_DATA[0], quantity: 2 },
      { medicine: MEDICINES_DATA[2], quantity: 2 }, // amoxicillin 185*2 = 370
      { medicine: MEDICINES_DATA[7], quantity: 2 }, // evion 75*2 = 150 -> subtotal > 500
    ];
  });

  // Orders
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (saved) {
      try { return JSON.parse(saved); } catch { return []; }
    }
    return [
      {
        id: 'MED-89421',
        date: new Date(Date.now() - 86400000 * 3).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        items: [
          { medicine: MEDICINES_DATA[0], quantity: 2 },
          { medicine: MEDICINES_DATA[2], quantity: 2 },
          { medicine: MEDICINES_DATA[7], quantity: 1 }
        ],
        subtotal: 509,
        deliveryFee: 0,
        discount: 25,
        coinDiscount: 25,
        elCoinsRedeemed: 5,
        elCoinsEarned: 10,
        totalAmount: 484,
        paymentMethod: 'upi',
        paymentStatus: 'paid',
        deliveryAddress: {
          name: 'Rohan Bose',
          mobile: '+91 98765 43210',
          street: 'Flat 4B, Greenwood Heights, Salt Lake Sector V',
          city: 'Kolkata'
        },
        status: 'delivered',
        estimatedDelivery: 'Delivered on 17 Aug, 2:45 PM'
      }
    ];
  });

  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  // Initialize Firebase and seed Firestore database
  useEffect(() => {
    let unsubscribeOrders: (() => void) | null = null;

    const setupDatabase = async () => {
      try {
        await initAnonymousAuth();
        setIsDbConnected(true);

        // Fetch & seed medicines
        const fetchedMedicines = await seedMedicinesIfEmpty();
        if (fetchedMedicines && fetchedMedicines.length > 0) {
          setMedicines(fetchedMedicines);
        }

        // Subscribe to real-time orders from Firestore
        unsubscribeOrders = subscribeToOrders(user?.mobile, (firestoreOrders) => {
          if (firestoreOrders && firestoreOrders.length > 0) {
            setOrders(firestoreOrders);
          }
        });
      } catch (err) {
        console.warn('Firebase setup warning:', err);
      }
    };

    setupDatabase();

    return () => {
      if (unsubscribeOrders) {
        unsubscribeOrders();
      }
    };
  }, [user?.mobile]);

  // Sync to local storage
  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  const addToast = (text: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Auth actions
  const login = (mobile: string, location: string, name?: string) => {
    const newUser: UserProfile = {
      name: name || `Customer ${mobile.slice(-4)}`,
      mobile: mobile.startsWith('+') ? mobile : `+91 ${mobile}`,
      email: `${mobile.slice(-6)}@medyfay.com`,
      address: location,
      city: location.split(',')[0].trim() || location,
      pincode: '700001',
      memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      ordersCount: 0,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      elCoins: 20, // 20 free welcome coins
      coinHistory: [
        {
          id: `ch-${Date.now()}`,
          date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
          type: 'earned',
          amount: 20,
          reason: 'Welcome Signup Loyalty Bonus'
        }
      ]
    };
    setUser(newUser);
    setLoginModalOpen(false);
    
    // Save to Firestore
    saveUserProfile(newUser.mobile, newUser);

    // Save to SQL Database
    try {
      fetch('/api/sql/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      }).catch(e => console.warn('SQL user save error:', e));
    } catch (e) {
      console.warn('SQL user catch:', e);
    }

    addToast(`Welcome to MedyFay, ${newUser.name}! +20 EL Coins credited!`, 'success');
  };

  const logout = () => {
    setUser(null);
    setActiveView('home');
    setAppliedCoupon(null);
    setAppliedCoins(0);
    addToast('You have been logged out.', 'info');
  };

  const updateLocation = (newLocation: string) => {
    if (user) {
      const updated = {
        ...user,
        address: newLocation,
        city: newLocation.split(',')[0].trim() || newLocation,
      };
      setUser(updated);
      saveUserProfile(updated.mobile, updated);

      try {
        fetch('/api/sql/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated),
        }).catch(e => console.warn('SQL location update error:', e));
      } catch (e) {
        console.warn('SQL location catch:', e);
      }

      addToast(`Delivery location updated to ${newLocation}`, 'info');
    }
  };

  const updateUserProfile = async (updatedFields: Partial<UserProfile>) => {
    if (user) {
      const updated: UserProfile = {
        ...user,
        ...updatedFields,
      };
      setUser(updated);
      await saveUserProfile(updated.mobile, updated);

      try {
        fetch('/api/sql/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated),
        }).catch(e => console.warn('SQL profile sync error:', e));
      } catch (e) {
        console.warn('SQL profile sync catch:', e);
      }

      addToast('Profile updated successfully!', 'success');
    }
  };

  // Cart actions
  const addToCart = (med: Medicine, qty: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.medicine.id === med.id);
      if (existing) {
        return prev.map((item) =>
          item.medicine.id === med.id ? { ...item, quantity: item.quantity + qty } : item
        );
      }
      return [...prev, { medicine: med, quantity: qty }];
    });
    addToast(`Added ${med.name} to cart`, 'success');
  };

  const removeFromCart = (medId: string) => {
    setCart((prev) => prev.filter((item) => item.medicine.id !== medId));
  };

  const updateQuantity = (medId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.medicine.id === medId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
    setAppliedCoins(0);
  };

  const getItemQuantity = (medId: string): number => {
    const item = cart.find((i) => i.medicine.id === medId);
    return item ? item.quantity : 0;
  };

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.medicine.price * item.quantity, 0);

  // Delivery fee calculation
  const deliveryInfo = checkDeliveryAvailability(user?.city || 'Kolkata', subtotal);
  const deliveryFee = subtotal > 0 ? (subtotal >= 500 ? 0 : deliveryInfo.deliveryCharge) : 0;

  // Coupon Discount
  let couponDiscount = 0;
  if (appliedCoupon && subtotal >= appliedCoupon.minOrderValue) {
    if (appliedCoupon.discountType === 'percentage') {
      couponDiscount = Math.round((subtotal * appliedCoupon.discountValue) / 100);
    } else {
      couponDiscount = Math.min(appliedCoupon.discountValue, subtotal);
    }
  }

  // EL Coins Discount (1 coin = 1% discount)
  // Clamp applied coins to user's coin balance and max allowed percentage
  const maxCoinsAllowed = Math.min(user?.elCoins || 0, EL_COINS_RULES.MAX_COIN_DISCOUNT_PERCENTAGE);
  const safeAppliedCoins = Math.min(appliedCoins, maxCoinsAllowed);
  const coinDiscount = subtotal > 0 && safeAppliedCoins > 0 
    ? Math.round((subtotal * safeAppliedCoins) / 100) 
    : 0;

  const discount = couponDiscount + coinDiscount;
  const total = Math.max(0, subtotal + deliveryFee - discount);

  // Earning rule: Orders above RS 500 earn 10 EL Coins
  const willEarnCoins = subtotal >= EL_COINS_RULES.ORDER_MIN_AMOUNT_FOR_EARNING;
  const coinsToEarn = willEarnCoins ? EL_COINS_RULES.COINS_EARNED_PER_QUALIFYING_ORDER : 0;

  // Coupon Handlers
  const applyCoupon = (code: string): boolean => {
    const found = AVAILABLE_COUPONS.find(c => c.code.toUpperCase() === code.trim().toUpperCase());
    if (!found) {
      addToast(`Invalid coupon code "${code}"`, 'warning');
      return false;
    }
    if (subtotal < found.minOrderValue) {
      addToast(`Minimum order amount of ₹${found.minOrderValue} required for coupon ${found.code}`, 'warning');
      return false;
    }
    setAppliedCoupon(found);
    addToast(`Coupon "${found.code}" applied! You saved on this order.`, 'success');
    return true;
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    addToast('Coupon removed', 'info');
  };

  const toggleRedeemAllCoins = () => {
    if (!user || user.elCoins <= 0) {
      addToast('No EL Coins available to redeem', 'warning');
      return;
    }
    if (safeAppliedCoins > 0) {
      setAppliedCoins(0);
      addToast('EL Coins removed from discount', 'info');
    } else {
      const coinsToUse = Math.min(user.elCoins, 30); // use up to 30 coins for 30% off
      setAppliedCoins(coinsToUse);
      addToast(`Redeemed ${coinsToUse} EL Coins for ${coinsToUse}% discount!`, 'success');
    }
  };

  // Place order with Loyalty Earning & Coin Deduction
  const placeOrder = async (paymentMethod: PaymentMethodType): Promise<Order> => {
    const delivery = checkDeliveryAvailability(user?.city || 'Kolkata', subtotal);
    const orderId = `MED-${Math.floor(10000 + Math.random() * 90000)}`;

    const newOrder: Order = {
      id: orderId,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      items: [...cart],
      subtotal,
      deliveryFee,
      discount,
      coinDiscount,
      couponDiscount,
      appliedCoupon: appliedCoupon?.code,
      elCoinsRedeemed: safeAppliedCoins,
      elCoinsEarned: coinsToEarn,
      totalAmount: total,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending_cod' : 'paid',
      deliveryAddress: {
        name: user?.name || 'Customer',
        mobile: user?.mobile || '+91 9876543210',
        street: user?.address || 'Primary Residence',
        city: user?.city || 'Kolkata',
      },
      status: 'confirmed',
      estimatedDelivery: `${delivery.estimatedTime} (${new Date(Date.now() + 35 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
    };

    // Calculate new EL Coin balance for user
    let newCoinBalance = user?.elCoins || 0;
    const historyEntries: ElCoinHistory[] = [...(user?.coinHistory || [])];

    // Deduct redeemed coins
    if (safeAppliedCoins > 0) {
      newCoinBalance = Math.max(0, newCoinBalance - safeAppliedCoins);
      historyEntries.unshift({
        id: `ch-red-${Date.now()}`,
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        type: 'redeemed',
        amount: safeAppliedCoins,
        reason: `Redeemed for ${safeAppliedCoins}% discount on Order #${orderId}`,
        orderId
      });
    }

    // Award +10 EL Coins if order amount > ₹500
    if (coinsToEarn > 0) {
      newCoinBalance += coinsToEarn;
      historyEntries.unshift({
        id: `ch-earn-${Date.now()}`,
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        type: 'earned',
        amount: coinsToEarn,
        reason: `Order #${orderId} bonus (Order value > ₹500)`,
        orderId
      });
    }

    // Save order to Firestore & SQL & local state
    try {
      await createOrderInFirestore(newOrder, user?.mobile);
    } catch (e) {
      console.warn('Firestore order save error:', e);
    }

    // Save order to Cloud SQL server
    try {
      fetch('/api/sql/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newOrder,
          userMobile: user?.mobile || '',
          userName: user?.name || '',
          userId: user?.mobile || 'guest',
        }),
      }).catch(err => console.warn('SQL order sync error:', err));
    } catch (e) {
      console.warn('SQL order catch error:', e);
    }

    setOrders((prev) => [newOrder, ...prev]);

    if (user) {
      const updatedUser: UserProfile = {
        ...user,
        ordersCount: user.ordersCount + 1,
        elCoins: newCoinBalance,
        coinHistory: historyEntries
      };
      setUser(updatedUser);
      saveUserProfile(updatedUser.mobile, updatedUser);

      // Sync user profile with SQL
      try {
        fetch('/api/sql/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedUser),
        }).catch(err => console.warn('SQL user sync error:', err));
      } catch (e) {
        console.warn('SQL user catch error:', e);
      }
    }
    
    clearCart();
    setActiveOrder(newOrder);

    const bonusMsg = coinsToEarn > 0 ? ` +10 EL Coins added to your wallet!` : '';
    addToast(`Order #${newOrder.id} confirmed!${bonusMsg}`, 'success');
    return newOrder;
  };

  // Advance Order Status (for live tracking simulation)
  const advanceOrderStatus = async (orderId: string) => {
    const statusFlow: Order['status'][] = ['confirmed', 'packing', 'out_for_delivery', 'delivered'];
    const currentOrder = orders.find(o => o.id === orderId);
    if (!currentOrder) return;

    const currentIndex = statusFlow.indexOf(currentOrder.status);
    if (currentIndex < statusFlow.length - 1) {
      const nextStatus = statusFlow[currentIndex + 1];
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: nextStatus } : o));
      await updateOrderStatusInFirestore(orderId, nextStatus);
      addToast(`Order #${orderId} updated to ${nextStatus.replace(/_/g, ' ')}!`, 'info');
    }
  };

  // Admin: Update specific order status
  const updateSpecificOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    await updateOrderStatusInFirestore(orderId, newStatus);
    
    // Sync status with SQL
    try {
      fetch(`/api/sql/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      }).catch(err => console.warn('SQL status update sync error:', err));
    } catch (e) {
      console.warn('SQL status update catch error:', e);
    }
    
    addToast(`Order #${orderId} marked as ${newStatus.replace(/_/g, ' ')}`, 'success');
  };

  // Admin: Medicine CRUD
  const addMedicine = async (newMed: Medicine) => {
    setMedicines(prev => [newMed, ...prev]);
    await saveMedicineToFirestore(newMed);
    
    // Sync with SQL
    try {
      fetch('/api/sql/medicines/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMed)
      }).catch(err => console.warn('SQL medicine save error:', err));
    } catch (e) {
      console.warn('SQL medicine catch error:', e);
    }

    addToast(`Added ${newMed.name} to medicine catalog!`, 'success');
  };

  const updateMedicine = async (id: string, updates: Partial<Medicine>) => {
    let updatedMed: Medicine | null = null;
    setMedicines(prev => prev.map(m => {
      if (m.id === id) {
        updatedMed = { ...m, ...updates };
        return updatedMed;
      }
      return m;
    }));

    if (updatedMed) {
      await saveMedicineToFirestore(updatedMed);
      try {
        fetch('/api/sql/medicines/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedMed)
        }).catch(err => console.warn('SQL medicine update error:', err));
      } catch (e) {
        console.warn('SQL medicine update catch error:', e);
      }
      addToast(`Updated ${(updatedMed as Medicine).name} details!`, 'info');
    }
  };

  const deleteMedicine = async (id: string) => {
    const medToDelete = medicines.find(m => m.id === id);
    setMedicines(prev => prev.filter(m => m.id !== id));
    await deleteMedicineFromFirestore(id);
    try {
      fetch(`/api/sql/medicines/${id}`, {
        method: 'DELETE'
      }).catch(err => console.warn('SQL medicine delete error:', err));
    } catch (e) {
      console.warn('SQL medicine delete catch error:', e);
    }
    addToast(`Removed ${medToDelete?.name || 'Medicine'} from catalog`, 'warning');
  };

  // Admin: Coupon Management
  const addCoupon = (coupon: Coupon) => {
    setAdminCoupons(prev => [coupon, ...prev]);
    addToast(`Coupon ${coupon.code} activated!`, 'success');
  };

  const deleteCoupon = (code: string) => {
    setAdminCoupons(prev => prev.filter(c => c.code !== code));
    addToast(`Coupon ${code} removed`, 'info');
  };

  const openDrMedyWithPrompt = (prompt: string) => {
    setPendingAiPrompt(prompt);
    setDrMedyChatOpen(true);
  };

  const clearPendingAiPrompt = () => {
    setPendingAiPrompt('');
  };

  return (
    <AppContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        loginModalOpen,
        setLoginModalOpen,
        login,
        logout,
        updateLocation,
        updateUserProfile,
        medicines,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        activeView,
        setActiveView,
        selectedMedicine,
        setSelectedMedicine,
        addMedicine,
        updateMedicine,
        deleteMedicine,
        updateSpecificOrderStatus,
        adminCoupons,
        addCoupon,
        deleteCoupon,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getItemQuantity,
        cartItemCount,
        subtotal,
        deliveryFee,
        discount,
        couponDiscount,
        coinDiscount,
        total,
        availableCoupons: adminCoupons,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        appliedCoins: safeAppliedCoins,
        setAppliedCoins,
        toggleRedeemAllCoins,
        willEarnCoins,
        coinsToEarn,
        orders,
        activeOrder,
        setActiveOrder,
        placeOrder,
        advanceOrderStatus,
        prescriptionModalOpen,
        setPrescriptionModalOpen,
        drMedyChatOpen,
        setDrMedyChatOpen,
        openDrMedyWithPrompt,
        pendingAiPrompt,
        clearPendingAiPrompt,
        isDbConnected,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
