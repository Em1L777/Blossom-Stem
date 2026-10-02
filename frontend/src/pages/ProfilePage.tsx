// frontend/src/pages/ProfilePage.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { axiosClient } from '../api/axiosClient';
import { formatCurrency } from '../utils/formatters';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [myOrders, setMyOrders] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyOrders = async () => {
      try {
        setIsLoadingOrders(true);
        const response = await axiosClient.get('/orders/my-orders');
        if (response.data.success) {
          setMyOrders(response.data.data || []);
        }
      } catch (err: any) {
        console.error('Failed to load my orders:', err);
        setErrorMsg('Could not load order history.');
      } finally {
        setIsLoadingOrders(false);
      }
    };

    if (user) {
      fetchMyOrders();
    }
  }, [user]);

  if (!user) return null;

  const roleBadgeStyle = (role: string) => {
    switch (role) {
      case 'OWNER':
      case 'ADMIN':
        return 'bg-[#ecfdf5] text-[#065f46] border-[#bbf7d0]';
      case 'FLORIST':
        return 'bg-[#fef3c7] text-[#92400e] border-[#fde68a]';
      case 'COURIER':
        return 'bg-[#e0f2fe] text-[#075985] border-[#bae6fd]';
      default:
        return 'bg-[#fafaf9] text-[#404944] border-[#e2e2e2]';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="border-b border-[#e2e2e2] pb-4 space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#064e3b]">
          Patron Account & Personal Atelier Record
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#1a1c1c] font-normal">
          Client & Staff Profile
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Column: Account Summary Card */}
        <div className="md:col-span-5 bg-white border border-[#e7e5e4] p-6 rounded-lg space-y-5 shadow-sm">
          <div className="flex items-center gap-4 border-b border-[#f5f5f4] pb-4">
            <div className="w-14 h-14 bg-[#064e3b] text-white rounded-full flex items-center justify-center font-serif text-2xl font-bold shadow-sm">
              {user.firstName ? user.firstName[0].toUpperCase() : 'B'}
            </div>
            <div>
              <h2 className="font-serif text-xl text-[#1a1c1c] font-bold">
                {user.firstName} {user.lastName}
              </h2>
              <span
                className={`inline-block mt-1 text-[10px] font-bold px-2.5 py-0.5 rounded border uppercase ${roleBadgeStyle(
                  user.role
                )}`}
              >
                {user.role}
              </span>
            </div>
          </div>

          <div className="space-y-3 text-xs text-[#404944]">
            <div>
              <span className="font-bold text-[#1a1c1c] block uppercase tracking-wider text-[10px] text-[#707974]">
                Email Address
              </span>
              <p className="font-mono text-sm text-[#064e3b]">{user.email}</p>
            </div>

            <div>
              <span className="font-bold text-[#1a1c1c] block uppercase tracking-wider text-[10px] text-[#707974]">
                Contact Phone
              </span>
              <p>{user.phone || 'No phone number linked'}</p>
            </div>
          </div>

          {/* Quick Staff Navigation Links */}
          {['FLORIST', 'COURIER', 'ADMIN', 'OWNER'].includes(user.role) && (
            <div className="pt-4 border-t border-[#f5f5f4] space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#064e3b] block">
                Staff Quick Navigation
              </span>
              {['FLORIST', 'ADMIN', 'OWNER'].includes(user.role) && (
                <Link
                  to="/workspace/florist"
                  className="block w-full py-2 px-3 bg-[#fafaf9] hover:bg-[#f5f5f4] border border-[#e2e2e2] rounded text-xs font-semibold text-[#1a1c1c] transition"
                >
                  💐 Florist Assembly Station ➔
                </Link>
              )}
              {['COURIER', 'ADMIN', 'OWNER'].includes(user.role) && (
                <Link
                  to="/workspace/courier"
                  className="block w-full py-2 px-3 bg-[#fafaf9] hover:bg-[#f5f5f4] border border-[#e2e2e2] rounded text-xs font-semibold text-[#1a1c1c] transition"
                >
                  🚚 Courier Dispatch Fleet ➔
                </Link>
              )}
              {['ADMIN', 'OWNER'].includes(user.role) && (
                <Link
                  to="/workspace/admin"
                  className="block w-full py-2 px-3 bg-[#064e3b] hover:bg-[#022c22] text-white rounded text-xs font-semibold transition"
                >
                  📊 Executive Admin Dashboard ➔
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Personal Order History */}
        <div className="md:col-span-7 space-y-4">
          <div className="bg-white border border-[#e7e5e4] p-6 rounded-lg shadow-sm space-y-4">
            <h2 className="font-serif text-xl text-[#1a1c1c] font-medium border-b border-[#f5f5f4] pb-3">
              Order History ({myOrders.length})
            </h2>

            {errorMsg && (
              <div className="p-3 bg-[#fff1f2] border border-[#fecdd3] rounded text-xs text-[#9f1239]">
                ⚠️ {errorMsg}
              </div>
            )}

            {isLoadingOrders ? (
              <div className="py-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#064e3b] mx-auto"></div>
              </div>
            ) : myOrders.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#707974] space-y-2">
                <span className="text-2xl block">🌸</span>
                <p>You haven't placed any flower orders with us yet.</p>
                <Link
                  to="/catalog"
                  className="inline-block mt-2 px-4 py-2 bg-[#064e3b] text-white text-xs font-semibold uppercase tracking-wider rounded"
                >
                  Explore Boutique Catalog
                </Link>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {myOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 bg-[#fafaf9] border border-[#e2e2e2] rounded-lg space-y-3 text-xs hover:border-[#064e3b] transition"
                  >
                    <div className="flex items-center justify-between border-b border-[#e2e2e2] pb-2">
                      <div>
                        <span className="font-mono font-bold text-[#064e3b] text-sm block">
                          {order.orderNumber}
                        </span>
                        <span className="text-[10px] text-[#707974]">
                          Placed on {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      <span className="bg-[#ecfdf5] text-[#065f46] text-[10px] font-bold px-2.5 py-1 rounded border border-[#bbf7d0] uppercase">
                        {order.status}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[#1a1c1c] font-semibold">
                        Recipient: {order.recipientName}
                      </p>
                      <p className="text-[#404944] text-[11px] truncate">
                        📍 {order.streetAddress ? `${order.streetAddress}, ${order.city || 'Barcelona'}` : order.address}
                      </p>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-[#e2e2e2]">
                      <span className="font-serif text-base font-bold text-[#064e3b]">
                        {formatCurrency(order.totalAmount)}
                      </span>
                      <Link
                        to={`/order-confirmation/${order.orderNumber}`}
                        className="px-3 py-1 bg-white border border-[#d6d3d1] hover:border-[#064e3b] text-[#1a1c1c] font-semibold text-[11px] rounded transition"
                      >
                        View Receipt ➔
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};