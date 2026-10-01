// frontend/src/pages/CheckoutPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { axiosClient } from '../api/axiosClient';
import { formatCurrency } from '../utils/formatters';

export const CheckoutPage: React.FC = () => {
  const {
    items,
    totalPrice,
    greetingCardNote,
    deliveryDate,
    deliverySlot,
    clearCart,
  } = useCart();

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, []);

  const todayFormatted = new Date().toISOString().split('T')[0];
  const finalDeliveryDate = deliveryDate && deliveryDate.trim() !== '' ? deliveryDate : todayFormatted;
  const finalDeliverySlot = deliverySlot && deliverySlot.trim() !== '' ? deliverySlot : '10:00 - 13:00';

  const [recipientName, setRecipientName] = useState(
    user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : ''
  );
  const [recipientPhone, setRecipientPhone] = useState(user?.phone || '');
  const [streetAddress, setStreetAddress] = useState('');
  const [postalCode, setPostalCode] = useState('08008');
  const [city] = useState('Barcelona');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'ONLINE_MOCK' | 'CASH_ON_DELIVERY'>('ONLINE_MOCK');

  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8821');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('882');
  const [cardHolder, setCardHolder] = useState(recipientName || 'MAREA PUIG');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [validationDetails, setValidationDetails] = useState<any[]>([]);

  if (items.length === 0) {
    return null;
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setValidationDetails([]);
    setIsSubmitting(true);

    try {
      let parsedIsoDate: string;
      try {
        parsedIsoDate = new Date(finalDeliveryDate).toISOString();
      } catch {
        parsedIsoDate = new Date().toISOString();
      }

      const orderPayload = {
        recipientName: recipientName.trim(),
        recipientPhone: recipientPhone.trim(),
        streetAddress: streetAddress.trim(),
        postalCode: postalCode.trim(),
        city: city.trim(),
        deliveryNotes: deliveryNotes.trim() || undefined,
        cardMessage: greetingCardNote?.trim() || undefined,
        deliveryDate: parsedIsoDate,
        timeSlot: finalDeliverySlot,
        paymentMethod,
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      };

      const response = await axiosClient.post('/orders', orderPayload);

      if (response.data.success) {
        const createdOrder = response.data.data;
        
        // ⚠️ КРИТИЧЕСКИЙ ФИКС: Используем orderNumber (например, ORD-2026-A1B2C) вместо UUID!
        localStorage.setItem('blossom_last_order', JSON.stringify(createdOrder));
        navigate(`/order-confirmation/${createdOrder.orderNumber}`);
        clearCart();
      }
    } catch (err: any) {
      console.error('Failed to place order:', err.response?.data || err);
      const errorObj = err.response?.data?.error;
      const mainMessage = errorObj?.message || 'Validation failed. Please check the order details below.';
      
      setErrorMsg(mainMessage);
      if (errorObj?.details && Array.isArray(errorObj.details)) {
        setValidationDetails(errorObj.details);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="border-b border-[#e2e2e2] pb-4 space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#064e3b]">
          Atelier Checkout & Secure Dispatch • Barcelona
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#1a1c1c] font-normal">
          Delivery & Patron Checkout
        </h1>
      </div>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column */}
        <div className="lg:col-span-7 space-y-6">
          {errorMsg && (
            <div className="p-4 bg-[#fff1f2] border border-[#fecdd3] rounded text-xs text-[#9f1239] space-y-1.5 shadow-sm">
              <p className="font-bold text-sm">⚠️ Order Submission Error</p>
              <p>{errorMsg}</p>
              {validationDetails.length > 0 && (
                <ul className="list-disc list-inside space-y-0.5 text-[11px] pt-1 border-t border-[#fecdd3]">
                  {validationDetails.map((det, idx) => (
                    <li key={idx}>
                      <strong>{det.field || det.path}:</strong> {det.message}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Recipient Information */}
          <div className="bg-white border border-[#e7e5e4] p-6 rounded-lg space-y-4 shadow-sm">
            <h3 className="font-serif text-lg text-[#1a1c1c] font-medium border-b border-[#f5f5f4] pb-2">
              1. Recipient Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1a1c1c] mb-1">
                  Recipient Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Mireia Puig"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full h-10 px-3 bg-[#fafaf9] border border-[#d6d3d1] rounded text-xs text-[#1a1c1c] focus:outline-none focus:border-[#064e3b]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1a1c1c] mb-1">
                  Contact Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+34 612 345 678"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  className="w-full h-10 px-3 bg-[#fafaf9] border border-[#d6d3d1] rounded text-xs text-[#1a1c1c] focus:outline-none focus:border-[#064e3b]"
                />
              </div>
            </div>
          </div>

          {/* Destination Address */}
          <div className="bg-white border border-[#e7e5e4] p-6 rounded-lg space-y-4 shadow-sm">
            <h3 className="font-serif text-lg text-[#1a1c1c] font-medium border-b border-[#f5f5f4] pb-2">
              2. Barcelona Destination Address
            </h3>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1a1c1c] mb-1">
                Street Address & Door Access *
              </label>
              <input
                type="text"
                required
                placeholder="Carrer de Mallorca, 234, Principal 1ª"
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
                className="w-full h-10 px-3 bg-[#fafaf9] border border-[#d6d3d1] rounded text-xs text-[#1a1c1c] focus:outline-none focus:border-[#064e3b]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1a1c1c] mb-1">
                  Postal Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="08008"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full h-10 px-3 bg-[#fafaf9] border border-[#d6d3d1] rounded text-xs text-[#1a1c1c] focus:outline-none focus:border-[#064e3b]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1a1c1c] mb-1">
                  City
                </label>
                <input
                  type="text"
                  disabled
                  value={city}
                  className="w-full h-10 px-3 bg-[#f5f5f4] border border-[#e2e2e2] rounded text-xs text-[#404944]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1a1c1c] mb-1">
                Courier Instructions (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Building intercom code, ring bell, or leave with door attendant..."
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                className="w-full p-2.5 bg-[#fafaf9] border border-[#d6d3d1] rounded text-xs text-[#1a1c1c] focus:outline-none focus:border-[#064e3b]"
              />
            </div>
          </div>

          {/* Payment Option */}
          <div className="bg-white border border-[#e7e5e4] p-6 rounded-lg space-y-4 shadow-sm">
            <h3 className="font-serif text-lg text-[#1a1c1c] font-medium border-b border-[#f5f5f4] pb-2">
              3. Payment Authorization
            </h3>

            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3.5 bg-[#fafaf9] border border-[#d6d3d1] rounded cursor-pointer hover:border-[#064e3b] transition">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'ONLINE_MOCK'}
                  onChange={() => setPaymentMethod('ONLINE_MOCK')}
                  className="mt-0.5 accent-[#064e3b]"
                />
                <div className="w-full">
                  <span className="text-xs font-bold text-[#1a1c1c] block">
                    💳 Credit / Debit Card (Instant Authorization)
                  </span>
                  <span className="text-[11px] text-[#404944]">
                    Encrypted SSL card gateway authorization.
                  </span>
                </div>
              </label>

              {paymentMethod === 'ONLINE_MOCK' && (
                <div className="p-4 bg-[#f5f5f4] border border-[#e2e2e2] rounded-md space-y-3 text-xs">
                  <div className="flex items-center justify-between text-[11px] text-[#064e3b] font-bold uppercase tracking-wider">
                    <span>🔒 Simulated Payment Gateway</span>
                    <span>VISA / MC / AMEX</span>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#404944] mb-1">
                      Card Number *
                    </label>
                    <input
                      type="text"
                      required={paymentMethod === 'ONLINE_MOCK'}
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4532 0000 0000 8821"
                      className="w-full h-9 px-3 bg-white border border-[#d6d3d1] rounded text-xs text-[#1a1c1c] focus:outline-none focus:border-[#064e3b]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-[#404944] mb-1">
                        Expiry Date *
                      </label>
                      <input
                        type="text"
                        required={paymentMethod === 'ONLINE_MOCK'}
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full h-9 px-3 bg-white border border-[#d6d3d1] rounded text-xs text-[#1a1c1c] focus:outline-none focus:border-[#064e3b]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-[#404944] mb-1">
                        CVC / CVV *
                      </label>
                      <input
                        type="password"
                        required={paymentMethod === 'ONLINE_MOCK'}
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        placeholder="882"
                        className="w-full h-9 px-3 bg-white border border-[#d6d3d1] rounded text-xs text-[#1a1c1c] focus:outline-none focus:border-[#064e3b]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#404944] mb-1">
                      Cardholder Name *
                    </label>
                    <input
                      type="text"
                      required={paymentMethod === 'ONLINE_MOCK'}
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      placeholder="CLARA VIDAL"
                      className="w-full h-9 px-3 bg-white border border-[#d6d3d1] rounded text-xs text-[#1a1c1c] focus:outline-none focus:border-[#064e3b]"
                    />
                  </div>
                </div>
              )}

              <label className="flex items-start gap-3 p-3.5 bg-[#fafaf9] border border-[#d6d3d1] rounded cursor-pointer hover:border-[#064e3b] transition">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'CASH_ON_DELIVERY'}
                  onChange={() => setPaymentMethod('CASH_ON_DELIVERY')}
                  className="mt-0.5 accent-[#064e3b]"
                />
                <div>
                  <span className="text-xs font-bold text-[#1a1c1c] block">
                    💶 Cash or Card on Courier Arrival
                  </span>
                  <span className="text-[11px] text-[#404944]">
                    Pay directly to the driver upon delivery in Barcelona.
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-5 bg-white border border-[#e7e5e4] p-6 rounded-lg space-y-5 shadow-sm sticky top-20">
          <h2 className="font-serif text-xl text-[#1a1c1c] font-medium border-b border-[#f5f5f4] pb-3">
            Order Review ({items.length} items)
          </h2>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.product.id} className="flex items-center gap-3 text-xs">
                <img
                  src={item.product.imageUrl}
                  alt={item.product.title}
                  className="w-12 h-12 object-cover rounded bg-[#f5f5f4] border border-[#e2e2e2]"
                />
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-[#1a1c1c] block truncate">
                    {item.product.title}
                  </span>
                  <span className="text-[11px] text-[#404944]">
                    Qty: {item.quantity} × {formatCurrency(item.product.price)}
                  </span>
                </div>
                <span className="font-semibold text-[#1a1c1c]">
                  {formatCurrency(Number(item.product.price) * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="bg-[#fafaf9] p-3 rounded border border-[#e2e2e2] text-xs space-y-1">
            <span className="font-bold text-[#064e3b] block">📅 Scheduled Delivery Window:</span>
            <p className="text-[#1a1c1c]">{finalDeliveryDate} • {finalDeliverySlot}</p>
          </div>

          {greetingCardNote && (
            <div className="bg-[#fafaf9] p-3 rounded border border-[#e2e2e2] text-xs space-y-1">
              <span className="font-bold text-[#064e3b] block">💌 Calligraphy Note Preview:</span>
              <p className="italic text-[#404944]">"{greetingCardNote}"</p>
            </div>
          )}

          <div className="border-t border-[#e2e2e2] pt-4 flex justify-between items-baseline">
            <span className="text-sm font-bold text-[#1a1c1c]">Total Payable</span>
            <span className="font-serif text-2xl font-bold text-[#064e3b]">
              {formatCurrency(totalPrice)}
            </span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 bg-[#064e3b] hover:bg-[#022c22] text-white text-xs font-semibold uppercase tracking-[0.12em] rounded transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            {isSubmitting ? 'Authorizing Order...' : `Place & Authorize Order (${formatCurrency(totalPrice)})`}
          </button>
        </div>
      </form>
    </div>
  );
};