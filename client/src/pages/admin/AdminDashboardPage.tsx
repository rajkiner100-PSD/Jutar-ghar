import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

export const AdminDashboardPage: React.FC = () => {
  const { showToast } = useToast();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/dashboard-stats');
      if (res.data) {
        setStats(res.data);
      }
    } catch (err: any) {
      console.error('Failed to load dashboard statistics', err);
      showToast('Error', 'Failed to load dashboard metrics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleQuickStatusChange = async (orderId: number, newStatus: OrderStatus) => {
    try {
      setUpdatingOrderId(orderId);
      await api.put(`/orders/${orderId}/status`, { order_status: newStatus });
      showToast('Order Updated', `Order #${orderId} marked as ${newStatus}`, 'success');
      fetchStats();
    } catch (err: any) {
      showToast('Error', err.response?.data?.error || 'Failed to update order status', 'error');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  if (loading || !stats) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-zinc-900 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-zinc-900 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const {
    metrics = { total_revenue: 148500, total_orders: 28, total_customers: 64, low_stock_count: 3 },
    low_stock_variants = [],
    recent_orders = [],
    orders_by_status = [],
    category_sales = []
  } = stats || {};

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title & Store Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">
            Store Performance Dashboard
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time analytics for Jutar Ghor footwear sales and inventory in Bangladesh.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/admin/products/new"
            className="px-4 py-2 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold shadow-glow-orange transition-all"
          >
            + Add New Shoe
          </Link>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="p-5 rounded-2xl bg-[#141414] border border-zinc-800/80 space-y-3">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span className="font-semibold uppercase tracking-wider">Total Sales</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              ৳
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-white">
              ৳{Number(metrics.total_revenue || 0).toLocaleString('en-BD')}
            </h3>
            <span className="text-[11px] text-emerald-400 font-medium">Delivered & active orders</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="p-5 rounded-2xl bg-[#141414] border border-zinc-800/80 space-y-3">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span className="font-semibold uppercase tracking-wider">Total Orders</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-white">{metrics.total_orders || 0}</h3>
            <span className="text-[11px] text-zinc-400 font-medium">
              {metrics.pending_orders} pending dispatch
            </span>
          </div>
        </div>

        {/* Products in Catalog */}
        <div className="p-5 rounded-2xl bg-[#141414] border border-zinc-800/80 space-y-3">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span className="font-semibold uppercase tracking-wider">Active Shoes</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-white">{metrics.active_products || 0}</h3>
            <span className="text-[11px] text-zinc-400 font-medium">
              out of {metrics.total_products} in catalog
            </span>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="p-5 rounded-2xl bg-[#141414] border border-zinc-800/80 space-y-3">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span className="font-semibold uppercase tracking-wider">Low Stock Alerts</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-white">{metrics.low_stock_count || 0}</h3>
            <span className="text-[11px] text-amber-400 font-medium">
              Variants with ≤ 5 pairs left
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Recent Orders & Low Stock Variant Warnings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders (2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-orange" />
              <span>Recent Customer Orders</span>
            </h2>
            <Link
              to="/admin/orders"
              className="text-xs font-semibold text-brand-orange hover:underline flex items-center gap-1"
            >
              <span>View All Orders</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="rounded-2xl bg-[#141414] border border-zinc-800/80 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-zinc-900/80 text-zinc-400 uppercase font-bold text-[10px] tracking-wider border-b border-zinc-800">
                  <tr>
                    <th className="px-4 py-3">Order No.</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">District</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                  {recent_orders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                        No orders recorded yet.
                      </td>
                    </tr>
                  ) : (
                    recent_orders.map((o: any) => (
                      <tr key={o.id} className="hover:bg-zinc-800/30">
                        <td className="px-4 py-3 font-mono font-bold text-brand-orange">
                          {o.order_number}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-bold text-white truncate max-w-[120px]">{o.customer_name}</p>
                          <p className="text-[10px] text-zinc-500">{o.customer_phone}</p>
                        </td>
                        <td className="px-4 py-3 text-zinc-400">{o.district}</td>
                        <td className="px-4 py-3 font-bold text-white">
                          ৳{Number(o.total_amount).toLocaleString('en-BD')}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              o.order_status === 'delivered'
                                ? 'bg-emerald-500/15 text-emerald-400'
                                : o.order_status === 'shipped'
                                ? 'bg-blue-500/15 text-blue-400'
                                : o.order_status === 'cancelled'
                                ? 'bg-red-500/15 text-red-400'
                                : 'bg-amber-500/15 text-amber-400'
                            }`}
                          >
                            {o.order_status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <select
                            disabled={updatingOrderId === o.id}
                            value={o.order_status}
                            onChange={(e) => handleQuickStatusChange(o.id, e.target.value as OrderStatus)}
                            className="bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-[11px] text-zinc-300 focus:outline-none focus:border-brand-orange cursor-pointer"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="returned">Returned</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Low Stock Variant Warnings Panel (1 Column) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Stock Depletion Watch</span>
            </h2>
            <Link
              to="/admin/products"
              className="text-xs font-semibold text-zinc-400 hover:text-white"
            >
              Inventory →
            </Link>
          </div>

          <div className="rounded-2xl bg-[#141414] border border-zinc-800/80 p-4 divide-y divide-zinc-800/60">
            {low_stock_variants.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-500">
                All shoe sizes and colors have healthy stock levels.
              </div>
            ) : (
              low_stock_variants.map((v: any) => (
                <div key={v.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-zinc-950 overflow-hidden shrink-0 border border-zinc-800">
                      <img src={v.product_image || ''} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-bold text-white truncate max-w-[130px]">{v.product_name}</p>
                      <p className="text-[10px] text-zinc-400">
                        Size: <strong className="text-zinc-200">{v.size}</strong> • {v.color}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full font-black text-[10px] uppercase ${
                        v.stock_quantity === 0
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {v.stock_quantity === 0 ? 'SOLD OUT' : `${v.stock_quantity} left`}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
