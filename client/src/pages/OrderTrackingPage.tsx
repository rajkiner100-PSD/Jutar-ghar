import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  AlertCircle,
  XCircle,
  RotateCcw,
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import api from '../services/api';

export const OrderTrackingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [orderNumberInput, setOrderNumberInput] = useState(searchParams.get('order') || '');
  const [phoneInput, setPhoneInput] = useState(searchParams.get('phone') || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTracking = async (num: string, ph: string) => {
    if (!num.trim()) {
      setError('Please provide an order reference number (e.g. JG-2026-10001).');
      return;
    }
    try {
      setLoading(true);
      setError('');

      // Check localStorage first
      try {
        const saved = JSON.parse(localStorage.getItem('jutar_ghor_saved_orders') || '[]');
        const found = saved.find((o: any) => o.order_number?.toLowerCase() === num.trim().toLowerCase());
        if (found) {
          setOrder(found);
          setLoading(false);
          return;
        }
      } catch (e) {}

      const res = await api.get(`/orders/track/${encodeURIComponent(num.trim())}`, {
        params: ph.trim() ? { phone: ph.trim() } : {},
      });
      if (res.data?.order) {
        setOrder(res.data.order);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Order not found. Please check your order reference number.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const urlOrder = searchParams.get('order');
    if (urlOrder) {
      setOrderNumberInput(urlOrder);
      const urlPhone = searchParams.get('phone') || '';
      fetchTracking(urlOrder, urlPhone);
    }
  }, [searchParams]);

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTracking(orderNumberInput, phoneInput);
  };

  const steps: { key: OrderStatus; label: string; desc: string }[] = [
    { key: 'pending', label: 'Order Placed', desc: 'Received & verified by our sales team' },
    { key: 'confirmed', label: 'Confirmed', desc: 'Order approved & assigned to warehouse' },
    { key: 'processing', label: 'Processing', desc: 'Boxed with double-protection packaging' },
    { key: 'shipped', label: 'Dispatched', desc: 'Handed over to courier for transit' },
    { key: 'delivered', label: 'Delivered', desc: 'Successfully handed over to customer' },
  ];

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 0;
      case 'confirmed': return 1;
      case 'processing': return 2;
      case 'shipped': return 3;
      case 'delivered': return 4;
      default: return -1;
    }
  };

  const currentStep = order ? getStepIndex(order.order_status) : 0;
  const isCancelled = order?.order_status === 'cancelled';
  const isReturned = order?.order_status === 'returned';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Title */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-brand-orange">
          Real-time Bangladesh Tracking
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
          Track Your Shoe Shipment
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
          Enter your unique order reference code (JG-2026-XXXXX) to see the live dispatch and delivery stage.
        </p>
      </div>

      {/* Tracking Form */}
      <form onSubmit={handleTrackSubmit} className="p-6 rounded-3xl bg-[#141414] border border-zinc-800 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-zinc-400 block mb-1">
              Order Reference Number
            </label>
            <input
              type="text"
              required
              placeholder="e.g. JG-2026-10001"
              value={orderNumberInput}
              onChange={(e) => setOrderNumberInput(e.target.value.toUpperCase())}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white uppercase focus:outline-none focus:border-brand-orange"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-400 block mb-1">
              Mobile Number (Optional Verification)
            </label>
            <input
              type="tel"
              placeholder="01XXXXXXXXX"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-orange"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-glow-orange transition-all"
        >
          {loading ? (
            <span>Locating Shipment...</span>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>Track Live Status</span>
            </>
          )}
        </button>
      </form>

      {error && (
        <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/50 text-red-200 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Order Tracking Result View */}
      {order && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#141414] border border-zinc-800 space-y-8 animate-slide-up">
          {/* Status Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-zinc-800/80 gap-4">
            <div>
              <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">
                Order Tracking Status
              </span>
              <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2 mt-0.5">
                <span>{order.order_number}</span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                    isCancelled
                      ? 'bg-red-500/20 text-red-400'
                      : isReturned
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-emerald-500/20 text-emerald-400'
                  }`}
                >
                  {order.order_status}
                </span>
              </h2>
            </div>
            <div className="text-right sm:text-right text-xs">
              <span className="text-zinc-400 block">Placed On</span>
              <strong className="text-white font-medium">
                {new Date(order.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </strong>
            </div>
          </div>

          {/* Stepper Progress Bar */}
          {isCancelled ? (
            <div className="p-4 rounded-2xl bg-red-950/30 border border-red-500/40 flex items-center gap-3 text-red-300 text-xs">
              <XCircle className="w-5 h-5 text-red-400 shrink-0" />
              <span>This order was cancelled. Inventory has been returned to stock.</span>
            </div>
          ) : isReturned ? (
            <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 flex items-center gap-3 text-amber-300 text-xs">
              <RotateCcw className="w-5 h-5 text-amber-400 shrink-0" />
              <span>This order has been returned by customer and processed.</span>
            </div>
          ) : (
            <div className="relative py-4">
              <div className="hidden sm:grid sm:grid-cols-5 gap-2 relative z-10">
                {steps.map((step, idx) => {
                  const isDone = idx <= currentStep;
                  const isCurrent = idx === currentStep;
                  return (
                    <div key={step.key} className="flex flex-col items-center text-center space-y-2">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                          isDone
                            ? 'bg-brand-orange text-white shadow-glow-orange'
                            : 'bg-zinc-900 border border-zinc-800 text-zinc-500'
                        }`}
                      >
                        {isDone ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                      </div>
                      <span className={`text-xs font-bold ${isCurrent ? 'text-brand-orange' : isDone ? 'text-white' : 'text-zinc-500'}`}>
                        {step.label}
                      </span>
                      <span className="text-[10px] text-zinc-400 max-w-[120px] leading-tight">
                        {step.desc}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Mobile Stepper (Vertical) */}
              <div className="sm:hidden space-y-4">
                {steps.map((step, idx) => {
                  const isDone = idx <= currentStep;
                  return (
                    <div key={step.key} className="flex items-start gap-3">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                          isDone ? 'bg-brand-orange text-white' : 'bg-zinc-900 border border-zinc-800 text-zinc-500'
                        }`}
                      >
                        {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                      </div>
                      <div>
                        <h4 className={`text-xs font-bold ${isDone ? 'text-white' : 'text-zinc-500'}`}>
                          {step.label}
                        </h4>
                        <p className="text-[10px] text-zinc-400">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Delivery & Items Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-zinc-800/80 text-xs text-zinc-300">
            <div className="space-y-2">
              <span className="font-bold text-white uppercase text-[11px] block text-brand-orange">
                Destination Address
              </span>
              <p className="font-bold text-white">{order.customer_name}</p>
              <p>{order.full_address}</p>
              <p>{order.area}, {order.district}</p>
              <p>Phone: {order.customer_phone}</p>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-white uppercase text-[11px] block text-brand-orange">
                Payment & Billing
              </span>
              <p>Method: <strong className="text-white uppercase">{order.payment_method}</strong></p>
              <p>Payment Status: <strong className="capitalize text-emerald-400">{order.payment_status}</strong></p>
              <p>Total Due: <strong className="text-brand-orange font-bold text-sm">৳{order.total_amount?.toLocaleString('en-BD')}</strong></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
