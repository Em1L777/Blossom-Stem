// frontend/src/pages/CourierWorkspacePage.tsx
import React, { useEffect, useState } from 'react';
import { axiosClient } from '../api/axiosClient';

export const CourierWorkspacePage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchCourierOrders = async () => {
    try {
      setIsLoading(true);
      setErrorMsg(null);
      const response = await axiosClient.get('/orders/courier/workspace');
      if (response.data.success) {
        setOrders(response.data.data || []);
      }
    } catch (err: any) {
      console.error('Failed to load courier workspace orders:', err);
      setErrorMsg(err.response?.data?.error?.message || 'Failed to connect to courier dispatch system.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourierOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: 'IN_TRANSIT' | 'DELIVERED') => {
    try {
      setUpdatingId(orderId);
      const response = await axiosClient.patch(`/orders/${orderId}/delivery-status`, { status: newStatus });
      if (response.data.success) {
        if (newStatus === 'DELIVERED') {
          // Убираем доставленный заказ
          setOrders((prev) => prev.filter((o) => o.id !== orderId));
        } else {
          // Обновляем статус на IN_TRANSIT
          setOrders((prev) =>
            prev.map((o) => (o.id === orderId ? { ...o, status: 'IN_TRANSIT' } : o))
          );
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to update delivery status.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="border-b border-[#e2e2e2] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#064e3b]">
            Protected Dispatch Area • Barcelona Metropolitan
          </span>
          <h1 className="font-serif text-3xl text-[#1a1c1c] font-normal">
            Courier Delivery Fleet
          </h1>
          <p className="text-xs text-[#404944]">
            Assembled arrangements ready for climate-controlled transit across Barcelona.
          </p>
        </div>

        <button
          onClick={fetchCourierOrders}
          className="h-9 px-4 bg-white border border-[#d6d3d1] hover:border-[#064e3b] text-xs font-semibold text-[#1a1c1c] rounded transition self-start sm:self-auto"
        >
          🔄 Refresh Fleet Dispatch ({orders.length})
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 bg-[#fff1f2] border border-[#fecdd3] rounded text-xs text-[#9f1239]">
          ⚠️ {errorMsg}
        </div>
      )}

      {isLoading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#064e3b]"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="p-12 text-center bg-white border border-[#e7e5e4] rounded-lg space-y-2">
          <span className="text-3xl block">🚚</span>
          <h3 className="font-serif text-lg text-[#1a1c1c]">No Deliveries Pending</h3>
          <p className="text-xs text-[#404944]">All current Barcelona orders have been delivered to recipients.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white border border-[#e7e5e4] rounded-lg p-6 space-y-4 shadow-sm flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-[#f5f5f4] pb-2">
                  <span className="font-mono text-xs font-bold text-[#064e3b]">
                    {order.orderNumber}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      order.status === 'IN_TRANSIT'
                        ? 'bg-[#f3e8ff] text-[#6b21a8] border border-[#e9d5ff]'
                        : 'bg-[#e0f2fe] text-[#075985] border border-[#bae6fd]'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-[#fafaf9] rounded border border-[#e2e2e2] space-y-1">
                    <span className="font-bold text-[#1a1c1c] block text-sm">
                      👤 {order.recipientName}
                    </span>
                    <a
                      href={`tel:${order.recipientPhone}`}
                      className="text-[#064e3b] font-semibold underline block"
                    >
                      📞 {order.recipientPhone}
                    </a>
                  </div>

                  <div className="p-3 bg-[#fafaf9] rounded border border-[#e2e2e2] space-y-1">
                    <span className="font-bold text-[#1a1c1c] block">
                      📍 Destination Address:
                    </span>
                    <p className="text-[#1a1c1c] font-medium">
                      {order.streetAddress ? `${order.streetAddress}, ${order.postalCode || ''} ${order.city || 'Barcelona'}` : order.address}
                    </p>
                    {order.deliveryNotes && (
                      <p className="text-[11px] text-[#9f1239] pt-1">
                        <strong>Access Note:</strong> "{order.deliveryNotes}"
                      </p>
                    )}
                  </div>

                  <p className="text-[#404944] text-[11px]">
                    <strong>Window:</strong> {order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : 'Today'} • {order.timeSlot}
                  </p>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                {order.status === 'ASSEMBLED' && (
                  <button
                    onClick={() => handleUpdateStatus(order.id, 'IN_TRANSIT')}
                    disabled={updatingId === order.id}
                    className="flex-1 h-10 bg-[#075985] hover:bg-[#0369a1] text-white text-xs font-semibold uppercase tracking-wider rounded transition flex items-center justify-center gap-1 shadow-sm disabled:opacity-50"
                  >
                    🚀 Start Transit
                  </button>
                )}

                <button
                  onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}
                  disabled={updatingId === order.id}
                  className="flex-1 h-10 bg-[#064e3b] hover:bg-[#022c22] text-white text-xs font-semibold uppercase tracking-wider rounded transition flex items-center justify-center gap-1 shadow-sm disabled:opacity-50"
                >
                  ✓ Mark Delivered
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};