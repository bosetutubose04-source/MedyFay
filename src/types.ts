export type Category = 
  | 'All'
  | 'Pain & Fever'
  | 'Antibiotics'
  | 'Vitamins & Supplements'
  | 'Diabetes & Heart'
  | 'Digestion & Acidity'
  | 'Skin & Hair'
  | 'First Aid & Devices';

export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  category: Category;
  price: number;
  originalPrice?: number;
  inStock: boolean;
  prescriptionRequired?: boolean;
  dosage: string;
  packSize: string;
  image: string;
  description: string;
  uses: string[];
  sideEffects?: string[];
  manufacturer: string;
  rating: number;
  reviewCount: number;
}

export interface CartItem {
  medicine: Medicine;
  quantity: number;
}

export interface Coupon {
  code: string;
  title: string;
  discountType: 'percentage' | 'flat';
  discountValue: number; // e.g. 15 for 15% or 50 for flat ₹50
  minOrderValue: number;
  description: string;
  expiryDate: string;
  tag?: string;
}

export interface ElCoinHistory {
  id: string;
  date: string;
  type: 'earned' | 'redeemed';
  amount: number;
  reason: string;
  orderId?: string;
}

export interface UserProfile {
  name: string;
  mobile: string;
  email: string;
  address: string;
  city: string;
  pincode: string;
  memberSince: string;
  ordersCount: number;
  avatar?: string;
  elCoins: number;
  coinHistory?: ElCoinHistory[];
  isQueenMember?: boolean;
  queenTier?: string;
  queenExpiry?: string;
  queenSavings?: number;
}

export type PaymentMethodType = 'card' | 'upi' | 'wallet' | 'netbanking' | 'cod';

export type OrderStatus = 'confirmed' | 'packing' | 'out_for_delivery' | 'delivered';

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  coinDiscount?: number;
  couponDiscount?: number;
  appliedCoupon?: string;
  elCoinsRedeemed?: number;
  elCoinsEarned?: number;
  totalAmount: number;
  paymentMethod: PaymentMethodType;
  paymentStatus: 'paid' | 'pending_cod';
  deliveryAddress: {
    name: string;
    mobile: string;
    street: string;
    city: string;
  };
  status: OrderStatus;
  estimatedDelivery: string;
}

export type ActiveView = 'home' | 'cart' | 'payment' | 'orders' | 'profile' | 'admin';

export interface ToastMessage {
  id: string;
  text: string;
  type?: 'success' | 'info' | 'warning';
}
