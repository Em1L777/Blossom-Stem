// frontend/src/pages/AdminDashboardPage.tsx
import React, { useEffect, useState } from 'react';
import { axiosClient } from '../api/axiosClient';
import { formatCurrency } from '../utils/formatters';

export const AdminDashboardPage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchAdminOrders = async () => {
    try {
      setIsLoading(true);
      setErrorMsg(null);
      const response = await axiosClient.get('/orders');
      if (response.data.success) {
        setOrders(response.data.data || []);
      }
    } catch (err: any) {
      console.error('Failed to load admin dashboard orders:', err);
      setErrorMsg(err.response?.data?.error?.message || 'Failed to connect to administrative order service.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingId(orderId);
      const response = await axiosClient.patch(`/orders/${orderId}/status`, { status: newStatus });
      if (response.data.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
      }
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to update order status.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Расчетметрик
  const totalRevenue = orders
    .filter((o) => o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);

  const pendingAssemblyCount = orders.filter((o) => ['PAID', 'PENDING'].includes(o.status)).length;
  const inTransitCount = orders.filter((o) => o.status === 'IN_TRANSIT').length;
  const deliveredCount = orders.filter((o) => o.status === 'DELIVERED').length;

  const filteredOrders =
    selectedStatusFilter === 'ALL'
      ? orders
      : orders.filter((o) => o.status === selectedStatusFilter);

  const statusOptions = ['PENDING', 'PAID', 'ASSEMBLED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="border-b border-[#e2e2e2] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#064e3b]">
            Protected Executive Area • Atelier Owner
          </span>
          <h1 className="font-serif text-3xl text-[#1a1c1c] font-normal">
            Admin & Executive Dashboard
          </h1>
          <p className="text-xs text-[#404944]">
            Global order monitoring, financial summary, and fulfillment oversight.
          </p>
        </div>

        <button
          onClick={fetchAdminOrders}
          className="h-9 px-4 bg-white border border-[#d6d3d1] hover:border-[#064e3b] text-xs font-semibold text-[#1a1c1c] rounded transition self-start sm:self-auto"
        >
          🔄 Refresh Data
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 bg-[#fff1f2] border border-[#fecdd3] rounded text-xs text-[#9f1239]">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#e7e5e4] p-5 rounded-lg space-y-1 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#707974]">
            Total Gross Revenue
          </span>
          <p className="font-serif text-2xl font-bold text-[#064e3b]">
            {formatCurrency(totalRevenue)}
          </p>
          <span className="text-[11px] text-[#404944]">Across {orders.length} total orders</span>
        </div>

        <div className="bg-white border border-[#e7e5e4] p-5 rounded-lg space-y-1 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#707974]">
            Pending Assembly
          </span>
          <p className="font-serif text-2xl font-bold text-[#92400e]">
            {pendingAssemblyCount}
          </p>
          <span className="text-[11px] text-[#404944]">Awaiting florist conditioning</span>
        </div>

        <div className="bg-white border border-[#e7e5e4] p-5 rounded-lg space-y-1 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#707974]">
            Active Couriers In Transit
          </span>
          <p className="font-serif text-2xl font-bold text-[#6b21a8]">
            {inTransitCount}
          </p>
          <span className="text-[11px] text-[#404944]">En route across Barcelona</span>
        </div>

        <div className="bg-white border border-[#e7e5e4] p-5 rounded-lg space-y-1 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#707974]">
            Successfully Delivered
          </span>
          <p className="font-serif text-2xl font-bold text-[#065f46]">
            {deliveredCount}
          </p>
          <span className="text-[11px] text-[#404944]">Completed hand-offs</span>
        </div>
      </div>

      {/* Order Management Section */}
      <div className="bg-white border border-[#e7e5e4] rounded-lg shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#f5f5f4] pb-4">
          <h2 className="font-serif text-xl text-[#1a1c1c] font-medium">
            System Orders Registry ({filteredOrders.length})
          </h2>

          {/* Filter Chips */}
          <div className="flex flex-wrap gap-1.5 text-xs">
            {['ALL', ...statusOptions].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatusFilter(status)}
                className={`px-3 py-1 rounded text-[11px] font-semibold tracking-wider uppercase transition ${
                  selectedStatusFilter === status
                    ? 'bg-[#064e3b] text-white'
                    : 'bg-[#fafaf9] border border-[#e2e2e2] text-[#404944] hover:border-[#064e3b]'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="py-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#064e3b] mx-auto"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#707974]">
            No orders found matching the selected status filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#404944]">
              <thead className="bg-[#fafaf9] border-b border-[#e2e2e2] text-[10px] font-bold uppercase tracking-wider text-[#1a1c1c]">
                <tr>
                  <th className="p-3">Reference</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Recipient & Address</th>
                  <th className="p-3">Items Summary</th>
                  <th className="p-3">Total Amount</th>
                  <th className="p-3">Status Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5f5f4]">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#fafaf9] transition">
                    <td className="p-3 font-mono font-bold text-[#064e3b]">
                      {order.orderNumber}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-3 max-w-[200px]">
                      <span className="font-bold text-[#1a1c1c] block truncate">{order.recipientName}</span>
                      <span className="text-[11px] text-[#707974] block truncate">{order.streetAddress || order.address}</span>
                    </td>
                    <td className="p-3 max-w-[180px]">
                      <span className="truncate block font-medium text-[#1a1c1c]">
                        {order.items?.map((i: any) => `${i.quantity}x ${i.product?.title || 'Item'}`).join(', ') || 'No items'}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-[#1a1c1c] whitespace-nowrap">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <select
                        value={order.status}
                        disabled={updatingId === order.id}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="h-8 px-2 bg-white border border-[#d6d3d1] rounded text-[11px] font-bold text-[#1a1c1c] focus:outline-none focus:border-[#064e3b]"
                      >
                        {statusOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};