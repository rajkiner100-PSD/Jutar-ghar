import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ArrowRight, Truck, ExternalLink, Calendar } from 'lucide-react';
import { Order } from '../types';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const OrderHistoryPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      api.get('/orders/my-orders').then((res) => {
        if (res.data?.orders) {
          setOrders(res.data.orders);
        }
      }).catch((err) => {
        console.error('Failed to load orders', err);
      }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <Package className="w-12 h-12 text-brand-orange mx-auto" />
        <h2 className="text-xl font-bold text-white uppercase">Please Sign In</h2>
        <p className="text-xs text-zinc-400">
          Sign in to your Jutar Ghor customer account to view your past orders and tracking numbers.
        </p>
        <Link
          to="/login"
          className="inline-block px-6 py-2.5 rounded-full bg-brand-orange text-white text-xs font-bold uppercase shadow-glow-orange"
        >
          Sign In Now
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-brand-orange border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-zinc-400">Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-zinc-800/80 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
            My Order History
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Logged in as <strong className="text-white">{user?.full_name}</strong> ({user?.email})
          </p>
        </div>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-xs font-bold text-brand-orange hover:underline"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#141414] border border-zinc-800 space-y-4">
          <Package className="w-12 h-12 text-zinc-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Orders Placed Yet</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            You haven't purchased any shoes yet. Explore our latest arrivals with nationwide Cash on Delivery.
          </p>
          <Link
            to="/shop"
            className="inline-block px-6 py-2.5 rounded-full bg-brand-orange text-white text-xs font-bold uppercase shadow-glow-orange"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="p-6 rounded-3xl bg-[#141414] border border-zinc-800 space-y-6 hover:border-zinc-700 transition-colors"
            >
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-800 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">
                    Order Ref
                  </span>
                  <h3 className="text-sm font-black text-white tracking-wider">
                    {order.order_number}
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5 text-zinc-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(order.created_at).toLocaleDateString()}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-500/15 text-emerald-400">
                    {order.order_status}
                  </span>
                  <Link
                    to={`/track?order=${order.order_number}&phone=${order.customer_phone}`}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg bg-brand-orange/15 text-brand-orange hover:bg-brand-orange hover:text-white text-xs font-bold transition-all"
                  >
                    <span>Track</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Items in this order */}
              <div className="divide-y divide-zinc-800/60">
                {order.items?.map((it, idx) => (
                  <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-zinc-950 overflow-hidden shrink-0 border border-zinc-800">
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

              {/* Summary Bottom */}
              <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-xs">
                <span className="text-zinc-400">
                  Payment: <strong className="text-white uppercase">{order.payment_method}</strong> ({order.payment_status})
                </span>
                <span className="text-sm font-black text-white">
                  Total: <span className="text-brand-orange">৳{order.total_amount?.toLocaleString('en-BD')}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
