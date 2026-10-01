// frontend/src/pages/CartPage.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/formatters';

export const CartPage: React.FC = () => {
  const {
    items,
    totalPrice,
    updateQuantity,
    removeFromCart,
    greetingCardNote,
    setGreetingCardNote,
    deliveryDate,
    setDeliveryDate,
    deliverySlot,
    setDeliverySlot,
  } = useCart();

  const navigate = useNavigate();

  // Доступные слоты доставки по Барселоне
  const deliverySlots = [
    { id: '10:00 - 13:00', label: '10:00 - 13:00 (Morning Harvest)' },
    { id: '14:00 - 17:00', label: '14:00 - 17:00 (Afternoon Transit)' },
    { id: '18:00 - 21:00', label: '18:00 - 21:00 (Evening Delivery)' },
  ];

  if (items.length === 0) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center space-y-4">
        <span className="text-4xl">🛒</span>
        <h2 className="font-serif text-2xl text-[#1a1c1c]">Your Cart is Empty</h2>
        <p className="text-xs text-[#404944] max-w-sm">
          You haven't selected any floral arrangements or gifts yet.
        </p>
        <Link
          to="/catalog"
          className="px-6 py-2.5 bg-[#064e3b] text-white text-xs font-semibold uppercase tracking-wider rounded shadow-sm hover:bg-[#022c22] transition"
        >
          ➔ Explore Atelier Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="border-b border-[#e2e2e2] pb-4 space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#064e3b]">
          Boutique Order Formulation • Barcelona
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#1a1c1c] font-normal">
          Your Selected Floral Arrangements
        </h1>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Items & Details */}
        <div className="lg:col-span-8 space-y-6">
          {/* Cart Items List */}
          <div className="bg-white border border-[#e7e5e4] rounded-lg overflow-hidden shadow-sm divide-y divide-[#f5f5f4]">
            {items.map((item) => (
              <div key={item.product.id} className="p-4 sm:p-6 flex items-center gap-4 sm:gap-6">
                <img
                  src={item.product.imageUrl}
                  alt={item.product.title}
                  className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded bg-[#f5f5f4] border border-[#e2e2e2] flex-shrink-0"
                />

                <div className="flex-1 space-y-1 min-w-0">
                  <Link
                    to={`/product/${item.product.slug}`}
                    className="font-serif text-base sm:text-lg text-[#1a1c1c] font-medium hover:text-[#064e3b] transition block truncate"
                  >
                    {item.product.title}
                  </Link>
                  <p className="text-[11px] text-[#404944]">
                    Unit Price: {formatCurrency(item.product.price)}
                  </p>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-3 pt-2">
                    <div className="flex items-center border border-[#d6d3d1] rounded bg-white">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center text-xs text-[#1a1c1c] hover:bg-[#f5f5f4]"
                      >
                        –
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-[#1a1c1c]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stockQuantity}
                        className="w-7 h-7 flex items-center justify-center text-xs text-[#1a1c1c] hover:bg-[#f5f5f4] disabled:opacity-30"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-[11px] text-[#9f1239] hover:underline font-medium"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="font-semibold text-sm sm:text-base text-[#1a1c1c] block">
                    {formatCurrency(Number(item.product.price) * item.quantity)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Complimentary Greeting Card Input */}
          <div className="bg-white border border-[#e7e5e4] p-5 sm:p-6 rounded-lg space-y-3 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-lg">💌</span>
              <h3 className="font-serif text-lg text-[#1a1c1c] font-medium">
                Complimentary Calligraphy Greeting Card Note
              </h3>
            </div>
            <p className="text-xs text-[#404944] leading-relaxed">
              Included with every arrangement. Hand-inscribed on our 350gsm textured cotton cardstock.
            </p>
            <textarea
              rows={3}
              placeholder="Write your personal message here (e.g. Happy Birthday Clara! With love, Marc)..."
              value={greetingCardNote}
              onChange={(e) => setGreetingCardNote(e.target.value)}
              className="w-full p-3 bg-[#fafaf9] border border-[#d6d3d1] rounded text-xs text-[#1a1c1c] placeholder:text-[#707974] focus:outline-none focus:border-[#064e3b] focus:ring-1 focus:ring-[#064e3b]"
            />
          </div>

          {/* Barcelona Delivery Schedule */}
          <div className="bg-white border border-[#e7e5e4] p-5 sm:p-6 rounded-lg space-y-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚡</span>
              <h3 className="font-serif text-lg text-[#1a1c1c] font-medium">
                Barcelona Delivery Logistics
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1a1c1c] mb-1.5">
                  Select Delivery Date *
                </label>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full h-10 px-3 bg-[#fafaf9] border border-[#d6d3d1] rounded text-xs text-[#1a1c1c] focus:outline-none focus:border-[#064e3b]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#1a1c1c] mb-1.5">
                  Select Time Slot *
                </label>
                <select
                  value={deliverySlot}
                  onChange={(e) => setDeliverySlot(e.target.value)}
                  className="w-full h-10 px-3 bg-[#fafaf9] border border-[#d6d3d1] rounded text-xs text-[#1a1c1c] focus:outline-none focus:border-[#064e3b]"
                >
                  {deliverySlots.map((slot) => (
                    <option key={slot.id} value={slot.id}>
                      {slot.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-4 bg-white border border-[#e7e5e4] p-6 rounded-lg space-y-5 shadow-sm sticky top-20">
          <h2 className="font-serif text-xl text-[#1a1c1c] font-medium border-b border-[#f5f5f4] pb-3">
            Order Summary
          </h2>

          <div className="space-y-2.5 text-xs text-[#404944]">
            <div className="flex justify-between">
              <span>Bouquet Subtotal</span>
              <span className="font-semibold text-[#1a1c1c]">{formatCurrency(totalPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span>Barcelona Local Courier</span>
              <span className="text-[#065f46] font-semibold">Complimentary</span>
            </div>
            <div className="flex justify-between">
              <span>Calligraphy Card</span>
              <span className="text-[#065f46] font-semibold">Included</span>
            </div>
          </div>

          <div className="border-t border-[#e2e2e2] pt-4 flex justify-between items-baseline">
            <span className="text-sm font-bold text-[#1a1c1c]">Grand Total</span>
            <span className="font-serif text-2xl font-bold text-[#064e3b]">
              {formatCurrency(totalPrice)}
            </span>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="w-full h-12 bg-[#064e3b] hover:bg-[#022c22] text-white text-xs font-semibold uppercase tracking-[0.12em] rounded transition flex items-center justify-center gap-2 shadow-sm"
          >
            ➔ Proceed to Delivery Checkout
          </button>

          <p className="text-[10px] text-stone-500 text-center leading-normal">
            🔒 Guaranteed fresh delivery in hydration reservoir packaging across Barcelona.
          </p>
        </div>
      </div>
    </div>
  );
};