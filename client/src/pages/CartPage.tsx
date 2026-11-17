import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Tag,
  Check,
  Truck,
  ShieldCheck,
} from 'lucide-react';
import { useCart } from '../context/CartContext';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    cart,
    removeFromCart,
    updateQuantity,
    subtotal,
    deliveryFee,
    coupon,
    couponDiscount,
    applyCoupon,
    removeCoupon,
    district,
    setDistrict,
    total,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [applying, setApplying] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setApplying(true);
    await applyCoupon(couponInput);
    setApplying(false);
    setCouponInput('');
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mx-auto mb-6">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2">
          Your Shopping Bag is Empty
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto mb-8">
          Browse our collection of premium sneakers, sports shoes, and handcrafted formal leather shoes in Bangladesh.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold uppercase tracking-wider shadow-glow-orange transition-all"
        >
          <span>Explore Footwear Catalog</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
          Your Shopping Bag
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Review your selected shoes, sizes, and order summary.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="divide-y divide-zinc-800/80 bg-[#141414] border border-zinc-800/80 rounded-3xl p-6">
            {cart.map((item) => (
              <div key={item.variant.id} className="py-6 first:pt-0 last:pb-0 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
                {/* Image & Title */}
                <div className="flex gap-4 items-center">
                  <div className="w-20 h-20 rounded-2xl bg-zinc-950 overflow-hidden shrink-0 border border-zinc-800">
                    <img
                      src={item.product.primary_image || ''}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-orange block">
                      {item.product.brand_name || 'AUTHENTIC'}
                    </span>
                    <Link
                      to={`/product/${item.product.slug}`}
                      className="text-sm font-bold text-white hover:text-brand-orange transition-colors"
                    >
                      {item.product.name}
                    </Link>
                    <div className="flex items-center gap-2 mt-1 text-xs text-zinc-400">
                      <span className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 font-semibold text-zinc-300">
                        Size: {item.selected_size}
                      </span>
                      <span>Color: {item.selected_color}</span>
                    </div>
                  </div>
                </div>

                {/* Pricing, Stepper & Remove */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-zinc-800 rounded-xl bg-zinc-900 px-1 py-0.5">
                    <button
                      onClick={() => updateQuantity(item.variant.id!, item.quantity - 1)}
                      className="p-1.5 text-zinc-400 hover:text-white"
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-bold text-white">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.variant.id!, item.quantity + 1)}
                      className="p-1.5 text-zinc-400 hover:text-white"
                      disabled={item.quantity >= item.variant.stock_quantity}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Line Total */}
                  <div className="text-right min-w-[90px]">
                    <span className="text-sm font-black text-white">
                      ৳{(item.unit_price * item.quantity).toLocaleString('en-BD')}
                    </span>
                    {item.quantity > 1 && (
                      <span className="block text-[10px] text-zinc-400">
                        ৳{item.unit_price.toLocaleString('en-BD')} each
                      </span>
                    )}
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.variant.id!)}
                    className="p-2 text-zinc-500 hover:text-red-400 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary Column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#141414] border border-zinc-800/80 rounded-3xl p-6 space-y-6">
            <h3 className="text-base font-bold text-white uppercase tracking-wider pb-3 border-b border-zinc-800">
              Order Summary
            </h3>

            {/* Destination District for accurate delivery calculation */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                <span>Delivery Destination</span>
                <span className="text-[11px] text-brand-orange font-bold">
                  {district.toLowerCase().includes('dhaka') ? 'Inside Dhaka (৳80)' : 'Outside Dhaka (৳150)'}
                </span>
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-orange"
              >
                <option value="Dhaka">Dhaka (Metropolitan)</option>
                <option value="Chittagong">Chittagong (Chattogram)</option>
                <option value="Sylhet">Sylhet</option>
                <option value="Rajshahi">Rajshahi</option>
                <option value="Khulna">Khulna</option>
                <option value="Barishal">Barishal</option>
                <option value="Rangpur">Rangpur</option>
                <option value="Mymensingh">Mymensingh</option>
                <option value="Comilla">Comilla (Cumilla)</option>
                <option value="Gazipur">Gazipur</option>
                <option value="Narayanganj">Narayanganj</option>
                <option value="Other">Other 64 Districts</option>
              </select>
            </div>

            {/* Promo Code Box */}
            <div className="pt-2">
              {coupon ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-brand-orange/10 border border-brand-orange/30 text-xs text-brand-orange">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    <span>
                      Coupon <strong className="font-bold">{coupon.code}</strong> applied
                    </span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-zinc-400 hover:text-white text-[11px] underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Coupon code (e.g. WELCOME10)"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white uppercase placeholder-zinc-500 focus:outline-none focus:border-brand-orange"
                  />
                  <button
                    type="submit"
                    disabled={applying || !couponInput.trim()}
                    className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white text-xs font-bold transition-colors"
                  >
                    {applying ? '...' : 'Apply'}
                  </button>
                </form>
              )}
            </div>

            {/* Breakdown */}
            <div className="space-y-3 pt-3 border-t border-zinc-800/80 text-xs text-zinc-400">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-white font-bold">৳{subtotal.toLocaleString('en-BD')}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-brand-orange font-bold">
                  <span>Coupon Savings</span>
                  <span>-৳{couponDiscount.toLocaleString('en-BD')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping Charge</span>
                <span className="text-white font-bold">
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-400">FREE</span>
                  ) : (
                    `৳${deliveryFee}`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-base font-black text-white pt-3 border-t border-zinc-800">
                <span>Grand Total</span>
                <span className="text-brand-orange">৳{total.toLocaleString('en-BD')}</span>
              </div>
            </div>

            {/* Checkout CTA */}
            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-4 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-glow-orange transition-all"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Guarantees */}
            <div className="space-y-2 text-[11px] text-zinc-400 pt-2 border-t border-zinc-800/60">
              <div className="flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-brand-orange" />
                <span>Fast doorstep delivery all over Bangladesh</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Pay via Cash on Delivery or Mobile Banking</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
