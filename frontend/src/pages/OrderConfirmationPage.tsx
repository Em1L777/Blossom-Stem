// frontend/src/pages/OrderConfirmationPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { axiosClient } from '../api/axiosClient';
import { formatCurrency } from '../utils/formatters';

export const OrderConfirmationPage: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderData = async () => {
      if (!orderNumber) {
        setErrorMsg('Invalid order reference.');
        setIsLoading(false);
        return;
      }

      // 1. Проверяем локальный сохраненный объект
      const localOrderRaw = localStorage.getItem('blossom_last_order');
      if (localOrderRaw) {
        try {
          const parsed = JSON.parse(localOrderRaw);
          if (parsed.orderNumber === orderNumber && parsed.items && parsed.items.length > 0) {
            setOrder(parsed);
            setIsLoading(false);
            return;
          }
        } catch {}
      }

      // 2. Запрашиваем эндпоинт GET /api/v1/orders/:orderNumber
      try {
        setIsLoading(true);
        setErrorMsg(null);
        console.log(`Fetching order details for orderNumber: "${orderNumber}"`);
        const response = await axiosClient.get(`/orders/${orderNumber}`);

        if (response.data.success) {
          setOrder(response.data.data);
        }
      } catch (err: any) {
        console.error('Failed to load order confirmation:', err);
        const serverMessage = err.response?.data?.error?.message;
        setErrorMsg(serverMessage || 'Could not retrieve order details from server.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderData();
  }, [orderNumber]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#064e3b]"></div>
        <p className="text-xs text-[#404944] font-serif">Retrieving your order details...</p>
      </div>
    );
  }

  if (errorMsg || !order) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white border border-[#e7e5e4] rounded-lg text-center space-y-4 shadow-sm">
        <span className="text-4xl">🌸</span>
        <h2 className="font-serif text-2xl text-[#1a1c1c]">Order Confirmation Status</h2>
        <p className="text-xs text-[#404944]">
          Order Reference: <strong className="text-[#064e3b] font-mono">{orderNumber}</strong>
        </p>
        <p className="text-[11px] text-[#9f1239] bg-[#fff1f2] p-2.5 rounded border border-[#fecdd3]">
          {errorMsg || 'Order details are processing.'}
        </p>
        <Link
          to="/catalog"
          className="inline-block px-6 py-2.5 bg-[#064e3b] text-white text-xs font-semibold uppercase tracking-wider rounded shadow-sm hover:bg-[#022c22] transition"
        >
          ➔ Return to Catalog
        </Link>
      </div>
    );
  }

  const formattedDate = order.deliveryDate
    ? new Date(order.deliveryDate).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Today';

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* 1. Header Banner */}
      <div className="bg-white border border-[#e7e5e4] p-8 lg:p-10 rounded-lg text-center space-y-4 shadow-sm">
        <div className="w-12 h-12 bg-[#064e3b] text-white rounded-full flex items-center justify-center text-xl mx-auto shadow-sm">
          ✓
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#064e3b] block">
            COMANDA CONFIRMADA • ATELIER BARCELONA
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#1a1c1c] font-normal leading-tight">
            Thank You for Your Order
          </h1>
          <p className="text-xs text-[#404944] max-w-lg mx-auto leading-relaxed">
            Your botanical curation has been reserved and routed to our El Born florist workstation for dawn conditioning and bespoke arrangement.
          </p>
        </div>

        {/* Reference Badge & Status */}
        <div className="inline-flex flex-wrap items-center justify-center gap-3 pt-2 text-xs">
          <span className="bg-[#fafaf9] px-3.5 py-1.5 rounded border border-[#e2e2e2] text-[#1a1c1c] font-mono">
            ORDER REFERENCE: <strong className="text-[#064e3b]">{order.orderNumber}</strong>
          </span>
          <span className="bg-[#ecfdf5] text-[#065f46] px-3.5 py-1.5 rounded border border-[#bbf7d0] font-bold uppercase tracking-wider">
            STATUS: {order.status}
          </span>
        </div>

        {/* Timeline Tracker */}
        <div className="pt-6 border-t border-[#f5f5f4] grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
          <div className="bg-[#fafaf9] p-3 rounded border border-[#e2e2e2] space-y-1">
            <span className="text-[10px] font-bold uppercase text-[#064e3b] block">Step 1 — Done</span>
            <p className="font-bold text-xs text-[#1a1c1c]">Order Authorized</p>
            <p className="text-[10px] text-[#404944]">Payment verified & inventory allocated.</p>
          </div>
          <div className="bg-[#064e3b]/10 border border-[#064e3b] p-3 rounded space-y-1">
            <span className="text-[10px] font-bold uppercase text-[#064e3b] block">Step 2 — Active</span>
            <p className="font-bold text-xs text-[#064e3b]">Conditioning & Assembly</p>
            <p className="text-[10px] text-[#404944]">El Born Atelier Workshop.</p>
          </div>
          <div className="bg-[#fafaf9] p-3 rounded border border-[#e2e2e2] space-y-1 opacity-60">
            <span className="text-[10px] font-bold uppercase text-stone-500 block">Step 3 — Pending</span>
            <p className="font-bold text-xs text-[#1a1c1c]">Cold-Chain Dispatch</p>
            <p className="text-[10px] text-[#404944]">Temperature controlled.</p>
          </div>
          <div className="bg-[#fafaf9] p-3 rounded border border-[#e2e2e2] space-y-1 opacity-60">
            <span className="text-[10px] font-bold uppercase text-stone-500 block">Step 4 — Pending</span>
            <p className="font-bold text-xs text-[#1a1c1c]">Doorstep Arrival</p>
            <p className="text-[10px] text-[#404944]">Barcelona courier delivery.</p>
          </div>
        </div>
      </div>

      {/* 2. Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="md:col-span-7 space-y-6">
          {/* Delivery & Recipient */}
          <div className="bg-white border border-[#e7e5e4] p-6 rounded-lg space-y-3 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#f5f5f4] pb-2">
              <h3 className="font-serif text-lg text-[#1a1c1c] font-medium">
                Delivery & Recipient Details
              </h3>
              <span className="bg-[#ecfdf5] text-[#065f46] text-[10px] font-bold px-2 py-0.5 rounded border border-[#bbf7d0]">
                ZERO-EMISSION CARGO FLEET
              </span>
            </div>

            <div className="text-xs text-[#404944] space-y-1">
              <p className="font-bold text-[#1a1c1c] text-sm">{order.recipientName}</p>
              <p>📞 {order.recipientPhone}</p>
              <p>📍 {order.streetAddress ? `${order.streetAddress}, ${order.postalCode || ''} ${order.city || 'Barcelona'}` : order.address}</p>
              {order.deliveryNotes && (
                <div className="mt-2 p-2.5 bg-[#fff1f2] border border-[#fecdd3] rounded text-[11px] text-[#9f1239]">
                  <strong>Courier Access Notes:</strong> "{order.deliveryNotes}"
                </div>
              )}
            </div>
          </div>

          {/* Scheduled Window */}
          <div className="bg-white border border-[#e7e5e4] p-6 rounded-lg space-y-2 shadow-sm">
            <h3 className="font-serif text-lg text-[#1a1c1c] font-medium border-b border-[#f5f5f4] pb-2">
              Scheduled Window
            </h3>
            <div className="flex items-center justify-between text-xs pt-1">
              <div>
                <span className="font-bold text-[#1a1c1c] text-sm block">
                  {formattedDate}
                </span>
                <span className="text-[#064e3b] font-semibold">{order.timeSlot || order.deliverySlot || '10:00 - 13:00'}</span>
              </div>
              <span className="text-[10px] font-bold uppercase bg-[#fafaf9] px-2.5 py-1 rounded border border-[#e2e2e2] text-[#404944]">
                Hydration Reservoir #1
              </span>
            </div>
          </div>

          {/* Inscription Card */}
          {order.cardMessage && (
            <div className="bg-white border border-[#e7e5e4] p-6 rounded-lg space-y-3 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#f5f5f4] pb-2">
                <h3 className="font-serif text-lg text-[#1a1c1c] font-medium">
                  Complimentary Inscription Card
                </h3>
                <span className="text-[10px] font-bold uppercase text-[#064e3b]">
                  350GSM ITALIAN COTTON
                </span>
              </div>
              <div className="p-4 bg-[#fafaf9] border border-[#e2e2e2] rounded text-center space-y-2">
                <blockquote className="font-serif italic text-lg sm:text-xl text-[#1a1c1c] leading-snug">
                  "{order.cardMessage}"
                </blockquote>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#064e3b]">
                  INSCRIBED BY HAND AT EL BORN ATELIER
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Curated Items Breakdown */}
        <div className="md:col-span-5 bg-white border border-[#e7e5e4] p-6 rounded-lg space-y-5 shadow-sm self-start">
          <h3 className="font-serif text-xl text-[#1a1c1c] font-medium border-b border-[#f5f5f4] pb-3">
            Curated Items ({order.items?.length || 0})
          </h3>

          <div className="space-y-3 divide-y divide-[#f5f5f4]">
            {order.items && order.items.length > 0 ? (
              order.items.map((item: any) => (
                <div key={item.id} className="pt-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    {item.product?.imageUrl && (
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.title}
                        className="w-10 h-10 object-cover rounded bg-[#f5f5f4] border border-[#e2e2e2]"
                      />
                    )}
                    <div>
                      <span className="font-semibold text-[#1a1c1c] block">
                        {item.product?.title || 'Floral Arrangement'}
                      </span>
                      <span className="text-[11px] text-[#404944]">Qty: {item.quantity}</span>
                    </div>
                  </div>
                  <span className="font-semibold text-[#1a1c1c]">
                    {formatCurrency(Number(item.unitPrice || item.priceAtPurchase || item.product?.price || 0) * item.quantity)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#707974]">No item breakdown available.</p>
            )}
          </div>

          <div className="border-t border-[#e2e2e2] pt-4 space-y-2 text-xs text-[#404944]">
            <div className="flex justify-between">
              <span>Item Subtotal</span>
              <span className="font-semibold text-[#1a1c1c]">{formatCurrency(order.subtotal || order.totalAmount)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-[#065f46]">
                <span>10% First Order Discount</span>
                <span className="font-semibold">-{formatCurrency(order.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Barcelona Local Courier</span>
              <span className="text-[#065f46] font-semibold">Complimentary (€0.00)</span>
            </div>
            {order.cardMessage && (
              <div className="flex justify-between">
                <span>Hand-Inscribed Cotton Card</span>
                <span className="text-[#065f46] font-semibold">Included</span>
              </div>
            )}
          </div>

          <div className="border-t border-[#e2e2e2] pt-4 flex justify-between items-baseline">
            <span className="text-sm font-bold text-[#1a1c1c]">Grand Total Paid</span>
            <span className="font-serif text-2xl font-bold text-[#064e3b]">
              {formatCurrency(order.totalAmount)}
            </span>
          </div>

          <div className="pt-2">
            <Link
              to="/catalog"
              className="w-full h-11 bg-[#064e3b] hover:bg-[#022c22] text-white text-xs font-semibold uppercase tracking-wider rounded transition flex items-center justify-center gap-2 shadow-sm"
            >
              ➔ Return to Boutique Catalog
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};