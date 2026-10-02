// frontend/src/pages/FloristWorkspacePage.tsx
import React, { useEffect, useState } from 'react';
import { axiosClient } from '../api/axiosClient';

export const FloristWorkspacePage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchFloristOrders = async () => {
    try {
      setIsLoading(true);
      setErrorMsg(null);
      const response = await axiosClient.get('/orders/florist/workspace');
      if (response.data.success) {
        setOrders(response.data.data || []);
      }
    } catch (err: any) {
      console.error('Failed to load florist workspace orders:', err);
      setErrorMsg(err.response?.data?.error?.message || 'Failed to connect to florist workstation.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFloristOrders();
  }, []);

  const handleAssembleOrder = async (orderId: string) => {
    try {
      setUpdatingId(orderId);
      const response = await axiosClient.patch(`/orders/${orderId}/assemble`);
      if (response.data.success) {
        // Убираем собранный заказ из списка текущей сборки
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
      }
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to update assembly status.');
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
            Protected Staff Area • El Born Atelier
          </span>
          <h1 className="font-serif text-3xl text-[#1a1c1c] font-normal">
            Florist Assembly Station
          </h1>
          <p className="text-xs text-[#404944]">
            Pending compositions requiring conditioning and hand arrangement.
          </p>
        </div>

        <button
          onClick={fetchFloristOrders}
          className="h-9 px-4 bg-white border border-[#d6d3d1] hover:border-[#064e3b] text-xs font-semibold text-[#1a1c1c] rounded transition self-start sm:self-auto"
        >
          🔄 Refresh Orders ({orders.length})
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
          <span className="text-3xl block">💐</span>
          <h3 className="font-serif text-lg text-[#1a1c1c]">Workstation Clean & Clear</h3>
          <p className="text-xs text-[#404944]">All current orders have been assembled and dispatched to couriers.</p>
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
                  <span className="bg-[#fef3c7] text-[#92400e] text-[10px] font-bold px-2 py-0.5 rounded border border-[#fde68a] uppercase">
                    {order.status}
                  </span>
                </div>

                <div className="text-xs space-y-1">
                  <p className="text-[#404944]">
                    <strong>Scheduled Slot:</strong> {order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : 'Today'} • {order.timeSlot}
                  </p>
                  <p className="text-[#404944]">
                    <strong>Recipient:</strong> {order.recipientName}
                  </p>
                </div>

                {/* Composition Items Breakdown */}
                <div className="space-y-2 pt-2 border-t border-[#f5f5f4]">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#1a1c1c] block">
                    Arrangement Recipe & Items:
                  </span>
                  {order.items?.map((item: any) => (
                    <div key={item.id} className="p-3 bg-[#fafaf9] rounded border border-[#e2e2e2] space-y-1 text-xs">
                      <div className="flex justify-between font-bold text-[#1a1c1c]">
                        <span>{item.product?.title}</span>
                        <span>Qty: {item.quantity}</span>
                      </div>
                      {item.product?.composition && (
                        <p className="text-[11px] text-[#064e3b] italic">
                          🌿 Stems: {item.product.composition}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Calligraphy Card Note */}
                {order.cardMessage && (
                  <div className="p-3 bg-[#fffbe2] border border-[#fef08a] rounded text-xs space-y-1">
                    <span className="font-bold text-[#854d0e] block">💌 Inscription Note to Write:</span>
                    <p className="italic text-[#713f12]">"{order.cardMessage}"</p>
                  </div>
                )}
              </div>

              <button
                onClick={() => handleAssembleOrder(order.id)}
                disabled={updatingId === order.id}
                className="w-full h-10 bg-[#064e3b] hover:bg-[#022c22] text-white text-xs font-semibold uppercase tracking-wider rounded transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 mt-4"
              >
                {updatingId === order.id ? 'Updating...' : '✓ Mark Composition as Assembled'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};