import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PaymentMethodType } from '../../types';
import { 
  CreditCard, 
  Smartphone, 
  Wallet, 
  Landmark, 
  Banknote, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  ArrowLeft,
  QrCode,
  MapPin,
  PhoneCall,
  Coins,
  Ticket,
  Gift
} from 'lucide-react';
import { checkDeliveryAvailability } from '../../utils/deliveryValidation';
import { HELPLINE_NUMBER, HELPLINE_FORMATTED } from '../../data/medicines';

export const PaymentSection: React.FC = () => {
  const { 
    cart, 
    total, 
    subtotal, 
    deliveryFee, 
    discount, 
    couponDiscount,
    coinDiscount,
    appliedCoupon,
    appliedCoins,
    willEarnCoins,
    coinsToEarn,
    user, 
    placeOrder, 
    setActiveView, 
    addToast 
  } = useApp();
  
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>('upi');
  const [isProcessing, setIsProcessing] = useState(false);

  // Form states for methods
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [selectedWallet, setSelectedWallet] = useState('PhonePe');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [walletMobile, setWalletMobile] = useState(user?.mobile || '');

  const deliveryInfo = checkDeliveryAvailability(user?.city || 'Kolkata', subtotal);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      addToast('Cart is empty, please select medicines first.', 'warning');
      setActiveView('home');
      return;
    }

    // Basic validations
    if (selectedMethod === 'upi' && !upiId.trim()) {
      addToast('Please enter a valid UPI ID (e.g. mobile@upi or name@okhdfcbank)', 'warning');
      return;
    }

    if (selectedMethod === 'card') {
      if (cardNumber.replace(/\s+/g, '').length < 16 || !cardExpiry || !cardCvv) {
        addToast('Please enter complete 16-digit card details, Expiry, and CVV.', 'warning');
        return;
      }
    }

    setIsProcessing(true);

    // Simulate payment gateway interaction
    setTimeout(async () => {
      try {
        const order = await placeOrder(selectedMethod);
        setIsProcessing(false);
        setActiveView('orders');
      } catch {
        setIsProcessing(false);
        addToast('Payment processing failed. Please try again.', 'warning');
      }
    }, 1200);
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6">
      {/* Back button */}
      <button
        onClick={() => setActiveView('cart')}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Cart
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Choose Payment Method</h1>
          <p className="text-xs sm:text-sm text-slate-500">100% Encrypted & Safe Healthcare Checkout</p>
        </div>
        <div className="flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-full">
          <Lock className="w-3.5 h-3.5" /> 256-Bit SSL
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Payment Methods */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Method selector grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {/* UPI */}
            <button
              type="button"
              onClick={() => setSelectedMethod('upi')}
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 ${
                selectedMethod === 'upi'
                  ? 'border-emerald-600 bg-emerald-50/50 shadow-md ring-2 ring-emerald-600/20'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <Smartphone className={`w-6 h-6 ${selectedMethod === 'upi' ? 'text-emerald-600' : 'text-slate-500'}`} />
              <div>
                <div className="font-bold text-xs sm:text-sm text-slate-900">UPI / QR Code</div>
                <div className="text-[10px] text-slate-500">GPay, PhonePe, Paytm</div>
              </div>
            </button>

            {/* Card */}
            <button
              type="button"
              onClick={() => setSelectedMethod('card')}
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 ${
                selectedMethod === 'card'
                  ? 'border-emerald-600 bg-emerald-50/50 shadow-md ring-2 ring-emerald-600/20'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <CreditCard className={`w-6 h-6 ${selectedMethod === 'card' ? 'text-emerald-600' : 'text-slate-500'}`} />
              <div>
                <div className="font-bold text-xs sm:text-sm text-slate-900">Credit / Debit Card</div>
                <div className="text-[10px] text-slate-500">Visa, Mastercard, RuPay</div>
              </div>
            </button>

            {/* Wallets */}
            <button
              type="button"
              onClick={() => setSelectedMethod('wallet')}
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 ${
                selectedMethod === 'wallet'
                  ? 'border-emerald-600 bg-emerald-50/50 shadow-md ring-2 ring-emerald-600/20'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <Wallet className={`w-6 h-6 ${selectedMethod === 'wallet' ? 'text-emerald-600' : 'text-slate-500'}`} />
              <div>
                <div className="font-bold text-xs sm:text-sm text-slate-900">Wallets</div>
                <div className="text-[10px] text-slate-500">Paytm, Mobikwik, Amazon</div>
              </div>
            </button>

            {/* Net Banking */}
            <button
              type="button"
              onClick={() => setSelectedMethod('netbanking')}
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 ${
                selectedMethod === 'netbanking'
                  ? 'border-emerald-600 bg-emerald-50/50 shadow-md ring-2 ring-emerald-600/20'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <Landmark className={`w-6 h-6 ${selectedMethod === 'netbanking' ? 'text-emerald-600' : 'text-slate-500'}`} />
              <div>
                <div className="font-bold text-xs sm:text-sm text-slate-900">Net Banking</div>
                <div className="text-[10px] text-slate-500">All Major Indian & BD Banks</div>
              </div>
            </button>

            {/* Cash on Delivery */}
            <button
              type="button"
              onClick={() => setSelectedMethod('cod')}
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 ${
                selectedMethod === 'cod'
                  ? 'border-emerald-600 bg-emerald-50/50 shadow-md ring-2 ring-emerald-600/20'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <Banknote className={`w-6 h-6 ${selectedMethod === 'cod' ? 'text-emerald-600' : 'text-slate-500'}`} />
              <div>
                <div className="font-bold text-xs sm:text-sm text-slate-900">Cash on Delivery</div>
                <div className="text-[10px] text-slate-500">Pay Cash / UPI at Doorstep</div>
              </div>
            </button>
          </div>

          {/* Dynamic sub-form for selected payment method */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            {/* UPI Form */}
            {selectedMethod === 'upi' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm">Pay using UPI ID or Scan QR</h3>
                  <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Instant Zero-Fee
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="w-32 h-32 bg-white p-2 rounded-xl border border-slate-200 shadow-xs flex flex-col items-center justify-center shrink-0">
                    <QrCode className="w-20 h-20 text-slate-800" />
                    <span className="text-[9px] font-bold text-slate-500 mt-1">Scan with any UPI App</span>
                  </div>
                  <div className="flex-1 w-full space-y-2">
                    <label className="block text-xs font-semibold text-slate-700">Or enter your VPA / UPI ID:</label>
                    <input
                      type="text"
                      placeholder="e.g. mobile@upi or username@okaxis"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-mono"
                    />
                    <div className="flex gap-2 text-[10px] text-slate-500">
                      <button type="button" onClick={() => setUpiId('rohan@okaxis')} className="hover:text-emerald-700 underline">
                        Try: rohan@okaxis
                      </button>
                      <span>•</span>
                      <button type="button" onClick={() => setUpiId('9876543210@paytm')} className="hover:text-emerald-700 underline">
                        Try: 9876543210@paytm
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Card Form */}
            {selectedMethod === 'card' && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-900 text-sm">Enter Card Details</h3>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Card Number</label>
                  <input
                    type="text"
                    placeholder="4532 •••• •••• 8921"
                    maxLength={19}
                    value={cardNumber}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, '').slice(0, 16);
                      const formatted = v.replace(/(\d{4})/g, '$1 ').trim();
                      setCardNumber(formatted);
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Name on Card</label>
                    <input
                      type="text"
                      placeholder="e.g. Rohan Bose"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Expiry</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        maxLength={5}
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">CVV</label>
                      <input
                        type="password"
                        placeholder="•••"
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Wallet Form */}
            {selectedMethod === 'wallet' && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-900 text-sm">Select Digital Wallet</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['PhonePe', 'Paytm', 'Amazon Pay', 'Mobikwik'].map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setSelectedWallet(w)}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                        selectedWallet === w
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-600/20'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Linked Mobile Number</label>
                  <input
                    type="tel"
                    value={walletMobile}
                    onChange={(e) => setWalletMobile(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            )}

            {/* Net Banking Form */}
            {selectedMethod === 'netbanking' && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-900 text-sm">Select Bank for Net Banking</h3>
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500 font-medium"
                >
                  <option>HDFC Bank</option>
                  <option>ICICI Bank</option>
                  <option>State Bank of India (SBI)</option>
                  <option>Axis Bank</option>
                  <option>Punjab National Bank (PNB)</option>
                  <option>City Bank / BRAC Bank (BD Region)</option>
                  <option>Kotak Mahindra Bank</option>
                </select>
                <p className="text-xs text-slate-500">
                  You will be securely redirected to {selectedBank}'s payment portal to authorize payment.
                </p>
              </div>
            )}

            {/* COD Form */}
            {selectedMethod === 'cod' && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                  <Banknote className="w-5 h-5 text-emerald-600" /> Cash on Delivery (COD) Selected
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Pay in cash or use your UPI app directly to scan the delivery partner's QR code upon arrival at your doorstep. Please keep exact change ready if paying in cash.
                </p>
              </div>
            )}
          </div>

          {/* Delivery Address Review */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="text-xs text-slate-500 block font-medium">Deliver Order To:</span>
                <span className="text-sm font-bold text-slate-900">{user?.name} • {user?.address}</span>
                <span className="text-xs text-emerald-700 block font-semibold">{deliveryInfo.message}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Summary & Pay Button */}
        <div>
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs sticky top-24">
            <h3 className="text-base font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">
              Payment Total
            </h3>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-900">₹{subtotal}</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Delivery Fee</span>
                {deliveryFee === 0 ? (
                  <span className="font-bold text-emerald-700">FREE</span>
                ) : (
                  <span className="font-semibold text-slate-900">₹{deliveryFee}</span>
                )}
              </div>

              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span className="flex items-center gap-1">
                    <Ticket className="w-3.5 h-3.5" /> Coupon ({appliedCoupon?.code})
                  </span>
                  <span>-₹{couponDiscount}</span>
                </div>
              )}

              {coinDiscount > 0 && (
                <div className="flex justify-between text-amber-700 font-semibold">
                  <span className="flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5" /> EL Coins ({appliedCoins}% OFF)
                  </span>
                  <span>-₹{coinDiscount}</span>
                </div>
              )}

              {willEarnCoins && (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                  <Gift className="w-4 h-4 text-amber-600 shrink-0" />
                  <span><strong>+10 EL Coins</strong> will be credited on order completion!</span>
                </div>
              )}

              <div className="pt-4 border-t border-slate-200 flex justify-between items-baseline">
                <div>
                  <span className="text-base font-extrabold text-slate-900 block">Total Payable</span>
                  <span className="text-[11px] text-slate-500 capitalize">{selectedMethod} Payment</span>
                </div>
                <span className="text-2xl font-extrabold text-emerald-800">
                  ₹{total}
                </span>
              </div>
            </div>

            {/* Pay Button */}
            <button
              onClick={handleSubmitOrder}
              disabled={isProcessing}
              className="w-full mt-6 py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-extrabold text-sm sm:text-base shadow-md shadow-emerald-700/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing Payment...</span>
                </div>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>
                    {selectedMethod === 'cod' ? 'Confirm Cash On Delivery' : `Pay ₹${total} Now`}
                  </span>
                </>
              )}
            </button>

            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium text-center">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>PCI-DSS Compliant • 100% Refund Guarantee</span>
              </div>
              <div className="text-slate-500">
                Payment trouble? Call 24x7 Helpline: <a href={`tel:${HELPLINE_NUMBER}`} className="text-emerald-700 font-bold hover:underline">{HELPLINE_FORMATTED}</a>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
