// frontend/src/pages/AdminUsersPage.tsx
import React, { useEffect, useState } from 'react';
import { axiosClient } from '../api/axiosClient';

interface UserItem {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'CLIENT' | 'FLORIST' | 'COURIER' | 'ADMIN' | 'OWNER';
  createdAt: string;
}

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Поля формы создания
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'CLIENT' | 'FLORIST' | 'COURIER' | 'ADMIN'>('FLORIST');

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setErrorMsg(null);
      const response = await axiosClient.get('/users');
      if (response.data.success) {
        setUsers(response.data.data || []);
      }
    } catch (err: any) {
      console.error('Failed to load users list:', err);
      setErrorMsg(err.response?.data?.error?.message || 'Failed to connect to user management service.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const payload = {
        email: email.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim() || undefined,
        role,
      };

      const response = await axiosClient.post('/users', payload);
      if (response.data.success) {
        setUsers((prev) => [response.data.data, ...prev]);
        setIsModalOpen(false);
        setEmail('');
        setPassword('');
        setFirstName('');
        setLastName('');
        setPhone('');
      }
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to create new user account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const response = await axiosClient.patch(`/users/${userId}/role`, { role: newRole });
      if (response.data.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole as any } : u))
        );
      }
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to update user role.');
    }
  };

  const filteredUsers =
    roleFilter === 'ALL' ? users : users.filter((u) => u.role === roleFilter);

  const roleBadgeStyle = (r: string) => {
    switch (r) {
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
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="border-b border-[#e2e2e2] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#064e3b]">
            Staff & User Directory • Executive Admin
          </span>
          <h1 className="font-serif text-3xl text-[#1a1c1c] font-normal">
            User Accounts & Staff Access
          </h1>
          <p className="text-xs text-[#404944]">
            Register florists, couriers, and administrators or change existing account access roles.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="h-10 px-5 bg-[#064e3b] hover:bg-[#022c22] text-white text-xs font-semibold uppercase tracking-wider rounded transition shadow-sm self-start sm:self-auto flex items-center gap-2"
        >
          <span>+ Add Staff / User</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 bg-[#fff1f2] border border-[#fecdd3] rounded text-xs text-[#9f1239]">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 text-xs border-b border-[#f5f5f4] pb-3">
        {['ALL', 'FLORIST', 'COURIER', 'ADMIN', 'CLIENT', 'OWNER'].map((r) => (
          <button
            key={r}
            onClick={() => setRoleFilter(r)}
            className={`px-3 py-1 rounded text-[11px] font-semibold tracking-wider uppercase transition ${
              roleFilter === r
                ? 'bg-[#064e3b] text-white'
                : 'bg-[#fafaf9] border border-[#e2e2e2] text-[#404944] hover:border-[#064e3b]'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Users Table */}
      {isLoading ? (
        <div className="py-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#064e3b] mx-auto"></div>
        </div>
      ) : (
        <div className="bg-white border border-[#e7e5e4] rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#404944]">
              <thead className="bg-[#fafaf9] border-b border-[#e2e2e2] text-[10px] font-bold uppercase tracking-wider text-[#1a1c1c]">
                <tr>
                  <th className="p-3">User / Name</th>
                  <th className="p-3">Email Address</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Current Role</th>
                  <th className="p-3">Joined Date</th>
                  <th className="p-3 text-right">Role Assignment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5f5f4]">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-[#fafaf9] transition">
                    <td className="p-3 font-bold text-[#1a1c1c]">
                      {u.firstName} {u.lastName}
                    </td>
                    <td className="p-3 font-mono text-[11px] text-[#064e3b]">
                      {u.email}
                    </td>
                    <td className="p-3 text-[#707974]">
                      {u.phone || '—'}
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded border uppercase ${roleBadgeStyle(
                          u.role
                        )}`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3 text-[#707974] whitespace-nowrap">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="p-3 text-right">
                      {u.role !== 'OWNER' ? (
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="h-8 px-2 bg-white border border-[#d6d3d1] rounded text-[11px] font-bold text-[#1a1c1c] focus:outline-none focus:border-[#064e3b]"
                        >
                          <option value="CLIENT">CLIENT</option>
                          <option value="FLORIST">FLORIST</option>
                          <option value="COURIER">COURIER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      ) : (
                        <span className="text-[10px] font-bold uppercase text-stone-400">System Owner</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal for Registering Staff */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#e7e5e4] rounded-lg max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-[#f5f5f4] pb-3">
              <h3 className="font-serif text-xl text-[#1a1c1c] font-medium">
                Register New Staff / Account
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase text-[#1a1c1c] mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Marc"
                    className="w-full h-9 px-3 bg-[#fafaf9] border border-[#d6d3d1] rounded text-xs text-[#1a1c1c] focus:outline-none focus:border-[#064e3b]"
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase text-[#1a1c1c] mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Vidal"
                    className="w-full h-9 px-3 bg-[#fafaf9] border border-[#d6d3d1] rounded text-xs text-[#1a1c1c] focus:outline-none focus:border-[#064e3b]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase text-[#1a1c1c] mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="florist2@blossom.com"
                  className="w-full h-9 px-3 bg-[#fafaf9] border border-[#d6d3d1] rounded text-xs text-[#1a1c1c] focus:outline-none focus:border-[#064e3b]"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase text-[#1a1c1c] mb-1">
                  Initial Password *
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-9 px-3 bg-[#fafaf9] border border-[#d6d3d1] rounded text-xs text-[#1a1c1c] focus:outline-none focus:border-[#064e3b]"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase text-[#1a1c1c] mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+34 612 345 678"
                  className="w-full h-9 px-3 bg-[#fafaf9] border border-[#d6d3d1] rounded text-xs text-[#1a1c1c] focus:outline-none focus:border-[#064e3b]"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase text-[#1a1c1c] mb-1">
                  Assign Staff Role *
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full h-9 px-3 bg-[#fafaf9] border border-[#d6d3d1] rounded text-xs text-[#1a1c1c] focus:outline-none focus:border-[#064e3b]"
                >
                  <option value="FLORIST">FLORIST (Assembly Station Access)</option>
                  <option value="COURIER">COURIER (Delivery Fleet Access)</option>
                  <option value="ADMIN">ADMIN (Full Administrative Access)</option>
                  <option value="CLIENT">CLIENT (Standard Customer Account)</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 h-10 border border-[#d6d3d1] hover:bg-[#fafaf9] text-[#1a1c1c] font-semibold uppercase tracking-wider rounded transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-10 bg-[#064e3b] hover:bg-[#022c22] text-white font-semibold uppercase tracking-wider rounded transition shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Registering...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};