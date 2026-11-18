import React, { useState, useEffect } from 'react';
import { Users, Mail, Phone, Calendar, ShoppingBag } from 'lucide-react';
import { User } from '../../types';
import { useToast } from '../../context/ToastContext';
import { fallbackCustomers } from '../../data/mockData';
import api from '../../services/api';

export const AdminCustomersPage: React.FC = () => {
  const { showToast } = useToast();
  const [customers, setCustomers] = useState<User[]>(fallbackCustomers as any);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/admin/customers').then((res) => {
      if (res.data?.customers) {
        setCustomers(res.data.customers);
      }
    }).catch((err) => {
      showToast('Error', 'Failed to fetch customer list', 'error');
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">
            Registered Customers
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Customer directory with verified order history and total lifetime spending in BDT.
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-[#141414] border border-zinc-800/80 overflow-hidden shadow-xl">
        <table className="w-full text-xs text-left">
          <thead className="bg-zinc-900 text-zinc-400 uppercase font-bold text-[10px] tracking-wider border-b border-zinc-800">
            <tr>
              <th className="px-4 py-3.5">Customer Name</th>
              <th className="px-4 py-3.5">Email</th>
              <th className="px-4 py-3.5">Phone (BD)</th>
              <th className="px-4 py-3.5">Orders Placed</th>
              <th className="px-4 py-3.5">Total Spent</th>
              <th className="px-4 py-3.5">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-zinc-500">
                  Loading customers...
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-zinc-500">
                  No registered customers found.
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c.id} className="hover:bg-zinc-800/30">
                  <td className="px-4 py-3.5 font-bold text-white flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-brand-orange/20 text-brand-orange flex items-center justify-center font-bold">
                      {c.full_name?.charAt(0).toUpperCase()}
                    </div>
                    <span>{c.full_name}</span>
                  </td>
                  <td className="px-4 py-3.5 text-zinc-400">{c.email}</td>
                  <td className="px-4 py-3.5 text-zinc-400 font-mono">{c.phone || '—'}</td>
                  <td className="px-4 py-3.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 font-bold text-white text-[10px]">
                      {c.order_count || 0} orders
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-bold text-brand-orange">
                    ৳{Number(c.total_spent || 0).toLocaleString('en-BD')}
                  </td>
                  <td className="px-4 py-3.5 text-zinc-500">
                    {c.created_at ? new Date(c.created_at).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
