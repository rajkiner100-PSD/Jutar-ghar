import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Package,
  Truck,
  ArrowRight,
  MapPin,
  Phone,
  Compass,
} from 'lucide-react';
import { Order } from '../types';
import api from '../services/api';

export const OrderConfirmationPage: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const location = useLocation();
  const [order, setOrder] = useState<Order | null>(location.state?.order || null);
  const [loading, setLoading] = useState(!order);

  useEffect(() => {
    if (!order && orderNumber) {
      try {
        const saved = JSON.parse(localStorage.getItem('jutar_ghor_saved_orders') || '[]');
        const localFound = saved.find((o: any) => o.order_number === orderNumber);
        if (localFound) {
          setOrder(localFound);
          setLoading(false);
          return;
        }
      } catch (e) {}

      api.get(`/orders/track/${orderNumber}`).then((res) => {
        if (res.data?.order) {
          setOrder(res.data.order);
        }
      }).finally(() => setLoading(false));
    }
  }, [order, orderNumber]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-brand-orange border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-zinc-400">Loading Order Confirmation...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Order Not Found</h2>
        <p className="text-xs text-zinc-400 mb-6">Unable to locate details for order {orderNumber}.</p>
        <Link to="/" className="px-6 py-2.5 rounded-full bg-brand-orange text-white text-xs font-bold uppercase">
          Back to Home
        </Link>
      </div>
    );
  }

  const isDhaka = (order.district || (order as any).delivery_district || '').toLowerCase().includes('dhaka');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-fade-in">
      {/* Success Banner */}
      <div className="p-8 rounded-3xl bg-[#141414] border border-zinc-800 text-center space-y-4 shadow-2xl relative overflow-hidden">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-lg">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <span className="text-xs font-bold text-brand-orange uppercase tracking-widest block mb-1">
            Order Confirmed & Logged
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
            Thank you, {order.customer_name}!
          </h1>
          <p className="text-xs sm:text-sm text-zinc-300 mt-2 max-w-lg mx-auto">
            Your footwear order has been received and sent to our Dhaka warehouse for packaging.
          </p>
        </div>

        {/* Unique Order ID Badge */}
        <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-zinc-900 border border-zinc-800">
          <Package className="w-5 h-5 text-brand-orange" />
          <div className="text-left">
            <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Order Reference No.</span>
            <span className="text-base font-black text-white tracking-wider">{order.order_number}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <Link
            to={`/track?order=${order.order_number}&phone=${order.customer_phone}`}
            className="px-6 py-3 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-glow-orange transition-all"
          >
            <Compass className="w-4 h-4" />
            <span>Track Live Shipment</span>
          </Link>
          <Link
            to="/shop"
            className="px-6 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-bold uppercase tracking-wider border border-zinc-800 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>

      {/* Details Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shipping & Delivery Info */}
        <div className="p-6 rounded-3xl bg-[#141414] border border-zinc-800 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Truck className="w-4 h-4 text-brand-orange" />
            <span>Shipping & Estimated Time</span>
          </h3>

          <div className="space-y-2 text-xs text-zinc-300">
            <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
              <span>Estimated Delivery:</span>
              <strong className="text-white font-bold">
                {isDhaka ? '1 - 2 Business Days (Dhaka Express)' : '2 - 4 Business Days (Courier BD)'}
              </strong>
            </div>

            <div className="flex items-start gap-2.5 pt-2">
              <MapPin className="w-4 h-4 text-brand-orange shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">{order.full_address}</p>
                <p className="text-zinc-400">{order.area || (order as any).delivery_area}, {order.district || (order as any).delivery_district}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 pt-1">
              <Phone className="w-4 h-4 text-brand-orange shrink-0" />
              <span>Contact Phone: <strong className="text-white">{order.customer_phone}</strong></span>
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="p-6 rounded-3xl bg-[#141414] border border-zinc-800 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Package className="w-4 h-4 text-brand-orange" />
            <span>Payment Summary</span>
          </h3>

          <div className="space-y-2 text-xs text-zinc-400">
            <div className="flex justify-between">
              <span>Payment Mode:</span>
              <span className="text-white font-bold uppercase">
                {order.payment_method === 'cod' ? 'Cash on Delivery (COD)' : order.payment_method.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Payment Status:</span>
              <span className={`font-bold uppercase ${order.payment_status === 'paid' ? 'text-emerald-400' : 'text-amber-400'}`}>
                {order.payment_status}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="text-white font-bold">৳{order.subtotal?.toLocaleString('en-BD')}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-brand-orange">
                <span>Coupon Savings:</span>
                <span>-৳{order.discount?.toLocaleString('en-BD')}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Delivery Charge:</span>
              <span className="text-white font-bold">
                {(order.delivery_fee ?? (order as any).delivery_charge ?? 80) === 0 ? 'FREE' : `৳${order.delivery_fee ?? (order as any).delivery_charge ?? 80}`}
              </span>
            </div>
            <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-zinc-800">
              <span>Total Amount:</span>
              <span className="text-brand-orange">৳{Number(order.total_amount || 0).toLocaleString('en-BD')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Purchased Items Table */}
      {order.items && order.items.length > 0 && (
        <div className="p-6 rounded-3xl bg-[#141414] border border-zinc-800 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Shoes in this Package
          </h3>
          <div className="divide-y divide-zinc-800/80">
            {order.items.map((it, idx) => (
              <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-zinc-950 overflow-hidden shrink-0 border border-zinc-800">
                    <img src={it.product_image || (it as any).image_url || ''} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-bold text-white">{it.product_name}</p>
                    <p className="text-zinc-400 text-[11px] mt-0.5">
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
      )}
    </div>
  );
};
