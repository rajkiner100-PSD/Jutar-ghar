import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  RotateCcw,
  XCircle,
  MapPin,
  Phone,
  Calendar,
  X,
  CreditCard,
} from 'lucide-react';
import { Order, OrderStatus, PaymentStatus } from '../../types';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

export const AdminOrdersPage: React.FC = () => {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params: any = { limit: 100 };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (search) params.search = search;

      const res = await api.get('/orders', { params });
      if (res.data?.orders) {
        setOrders(res.data.orders);
      }
    } catch (err: any) {
      showToast('Error', 'Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, search]);

  const handleUpdateStatus = async (orderId: number, orderStatus?: OrderStatus, paymentStatus?: PaymentStatus) => {
    try {
      setUpdating(true);
      const payload: any = {};
      if (orderStatus) payload.order_status = orderStatus;
      if (paymentStatus) payload.payment_status = paymentStatus;

      await api.put(`/orders/${orderId}/status`, payload);
      showToast('Order Updated', 'Order status synchronized successfully with inventory', 'success');

      // Update local state in modal if open
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => prev ? {
          ...prev,
          order_status: orderStatus || prev.order_status,
          payment_status: paymentStatus || prev.payment_status,
        } : null);
      }

      fetchOrders();
    } catch (err: any) {
      showToast('Error', err.response?.data?.error || 'Failed to update order status', 'error');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">
            Order Management & Fulfillment
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Review customer orders, update delivery tracking stages, verify mobile payments.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by order number (e.g. JG-2026-10001), customer name, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-brand-orange"
          />
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3 pointer-events-none" />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-orange cursor-pointer"
        >
          <option value="all">All Order Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
          <option value="returned">Returned</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl bg-[#141414] border border-zinc-800/80 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-zinc-900 text-zinc-400 uppercase font-bold text-[10px] tracking-wider border-b border-zinc-800">
              <tr>
                <th className="px-4 py-3.5">Order Ref</th>
                <th className="px-4 py-3.5">Customer & Phone</th>
                <th className="px-4 py-3.5">District & Address</th>
                <th className="px-4 py-3.5">Payment</th>
                <th className="px-4 py-3.5">Total (BDT)</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-zinc-500">
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-zinc-500">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-zinc-800/30 transition-colors">
                    {/* Order Number & Date */}
                    <td className="px-4 py-3.5">
                      <span className="font-mono font-bold text-brand-orange block">
                        {order.order_number}
                      </span>
                      <span className="text-[10px] text-zinc-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="px-4 py-3.5">
                      <p className="font-bold text-white">{order.customer_name}</p>
                      <p className="text-[10px] text-zinc-400 font-mono">{order.customer_phone}</p>
                    </td>

                    {/* Location */}
                    <td className="px-4 py-3.5">
                      <span className="font-bold text-white block">{order.district}</span>
                      <span className="text-[10px] text-zinc-400 truncate max-w-[150px] block">
                        {order.area}
                      </span>
                    </td>

                    {/* Payment Mode & Status */}
                    <td className="px-4 py-3.5">
                      <span className="font-bold uppercase text-white block">
                        {order.payment_method}
                      </span>
                      <span
                        className={`text-[10px] uppercase font-bold ${
                          order.payment_status === 'paid' ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      >
                        {order.payment_status}
                      </span>
                    </td>

                    {/* Total Amount */}
                    <td className="px-4 py-3.5 font-bold text-white">
                      ৳{order.total_amount?.toLocaleString('en-BD')}
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                          order.order_status === 'delivered'
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : order.order_status === 'shipped'
                            ? 'bg-blue-500/15 text-blue-400'
                            : order.order_status === 'cancelled'
                            ? 'bg-red-500/15 text-red-400'
                            : 'bg-amber-500/15 text-amber-400'
                        }`}
                      >
                        {order.order_status}
                      </span>
                    </td>

                    {/* Action Button */}
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-brand-orange text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 ml-auto transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-brand-orange" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Order Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#141414] border border-zinc-800 rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">
                  Order Details
                </span>
                <h3 className="text-lg font-black text-white font-mono flex items-center gap-2">
                  <span>{selectedOrder.order_number}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-brand-orange/20 text-brand-orange font-bold uppercase">
                    {selectedOrder.order_status}
                  </span>
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Status Changers */}
            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-zinc-400 uppercase block mb-1.5">
                  Update Order Dispatch Status
                </label>
                <select
                  disabled={updating}
                  value={selectedOrder.order_status}
                  onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value as OrderStatus)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-orange cursor-pointer font-bold"
                >
                  <option value="pending">Pending Verification</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing & Packaged</option>
                  <option value="shipped">Shipped to Courier</option>
                  <option value="delivered">Delivered to Customer</option>
                  <option value="cancelled">Cancelled (Restores Stock)</option>
                  <option value="returned">Returned (Restores Stock)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-zinc-400 uppercase block mb-1.5">
                  Update Payment Status
                </label>
                <select
                  disabled={updating}
                  value={selectedOrder.payment_status}
                  onChange={(e) => handleUpdateStatus(selectedOrder.id, undefined, e.target.value as PaymentStatus)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-orange cursor-pointer font-bold"
                >
                  <option value="unpaid">Unpaid (Pending Doorstep Cash)</option>
                  <option value="paid">Paid (Confirmed Cash / MFS)</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
            </div>

            {/* Customer & Shipping Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-zinc-300">
              <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-1.5">
                <span className="font-bold text-white uppercase text-[10px] text-brand-orange block">
                  Customer Information
                </span>
                <p className="font-bold text-white">{selectedOrder.customer_name}</p>
                <p>Phone: <strong className="text-white">{selectedOrder.customer_phone}</strong></p>
                {selectedOrder.customer_email && <p>Email: {selectedOrder.customer_email}</p>}
                {selectedOrder.notes && (
                  <p className="text-[11px] text-amber-300 italic pt-1">
                    Notes: "{selectedOrder.notes}"
                  </p>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-1.5">
                <span className="font-bold text-white uppercase text-[10px] text-brand-orange block">
                  Shipping Destination
                </span>
                <p className="font-bold text-white">{selectedOrder.district}</p>
                <p>Area: {selectedOrder.area}</p>
                <p>Address: {selectedOrder.full_address}</p>
              </div>
            </div>

            {/* Payment Details */}
            <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-1.5 text-xs text-zinc-300">
              <span className="font-bold text-white uppercase text-[10px] text-brand-orange block">
                Payment Channel & Verification
              </span>
              <div className="flex flex-wrap gap-4 pt-1">
                <span>Method: <strong className="text-white uppercase">{selectedOrder.payment_method}</strong></span>
                {selectedOrder.bkash_transaction_id && (
                  <span className="text-pink-400 font-mono font-bold">
                    bKash TrxID: {selectedOrder.bkash_transaction_id}
                  </span>
                )}
                {selectedOrder.nagad_transaction_id && (
                  <span className="text-orange-400 font-mono font-bold">
                    Nagad TrxID: {selectedOrder.nagad_transaction_id}
                  </span>
                )}
              </div>
            </div>

            {/* Items Table */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider block">
                Ordered Footwear Items
              </span>
              <div className="divide-y divide-zinc-800 rounded-2xl border border-zinc-800 overflow-hidden bg-zinc-950">
                {selectedOrder.items?.map((it, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-zinc-900 overflow-hidden shrink-0">
                        <img src={it.product_image || ''} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-white">{it.product_name}</p>
                        <p className="text-[10px] text-zinc-400">
                          Size: {it.size} • Color: {it.color} • Qty: {it.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-white">
                      ৳{(it.price * it.quantity).toLocaleString('en-BD')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals Breakdown */}
            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2 text-xs text-zinc-400">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-white font-bold">৳{selectedOrder.subtotal?.toLocaleString('en-BD')}</span>
              </div>
              {selectedOrder.discount > 0 && (
                <div className="flex justify-between text-brand-orange font-bold">
                  <span>Coupon Discount ({selectedOrder.coupon_code})</span>
                  <span>-৳{selectedOrder.discount?.toLocaleString('en-BD')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span className="text-white font-bold">৳{selectedOrder.delivery_fee}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-zinc-800">
                <span>Grand Total</span>
                <span className="text-brand-orange">৳{selectedOrder.total_amount?.toLocaleString('en-BD')}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
