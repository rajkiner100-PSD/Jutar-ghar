import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-800/80 pt-16 pb-8 text-zinc-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Value Proposition Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-14 border-b border-zinc-800/80">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-brand-orange shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">100% Authentic</h4>
              <p className="text-xs text-zinc-400">Original kicks & genuine leather</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-brand-orange shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Nationwide Delivery</h4>
              <p className="text-xs text-zinc-400">Dhaka 1-2 days, 64 districts 2-4 days</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-brand-orange shrink-0">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">7 Days Exchange</h4>
              <p className="text-xs text-zinc-400">Hassle-free size replacement</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-brand-orange shrink-0">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Customer Support</h4>
              <p className="text-xs text-zinc-400">10 AM - 10 PM daily in BD</p>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 py-12 border-b border-zinc-800/80">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-orange flex items-center justify-center font-black text-black">
                JG
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                JUTAR <span className="text-brand-orange">GHOR</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed text-zinc-400 max-w-sm">
              Jutar Ghor (জুতার ঘর) is Bangladesh's premier shoe destination. We bring iconic sneakers, performance athletic footwear, and handcrafted genuine leather formal shoes directly to your doorstep with nationwide Cash on Delivery.
            </p>
            <div className="space-y-2 pt-2 text-xs">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-brand-orange shrink-0" />
                <span>Road 11, Block D, Banani, Dhaka-1213, Bangladesh</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brand-orange shrink-0" />
                <span>+880 1700-000000 / +880 1800-000000</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand-orange shrink-0" />
                <span>support@jutarghor.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="text-sm font-bold text-white tracking-wider uppercase mb-4">Shop Shoes</h5>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/shop" className="hover:text-brand-orange transition-colors">All Products</Link>
              </li>
              <li>
                <Link to="/shop?category=sneakers" className="hover:text-brand-orange transition-colors">Sneakers</Link>
              </li>
              <li>
                <Link to="/shop?category=sports-shoes" className="hover:text-brand-orange transition-colors">Running & Gym</Link>
              </li>
              <li>
                <Link to="/shop?category=formal-shoes" className="hover:text-brand-orange transition-colors">Leather Formals</Link>
              </li>
              <li>
                <Link to="/shop?category=sandals-slides" className="hover:text-brand-orange transition-colors">Sandals & Slides</Link>
              </li>
              <li>
                <Link to="/shop?category=casual-shoes" className="hover:text-brand-orange transition-colors">Everyday Loafers</Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h5 className="text-sm font-bold text-white tracking-wider uppercase mb-4">Customer Care</h5>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/track" className="hover:text-brand-orange transition-colors">Track Your Order</Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-brand-orange transition-colors">Frequently Asked Questions</Link>
              </li>
              <li>
                <Link to="/return-policy" className="hover:text-brand-orange transition-colors">7 Days Exchange Policy</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-brand-orange transition-colors">Contact Support</Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-brand-orange transition-colors">Privacy & Terms</Link>
              </li>
            </ul>
          </div>

          {/* Payment & Security */}
          <div>
            <h5 className="text-sm font-bold text-white tracking-wider uppercase mb-4">Payment Methods</h5>
            <p className="text-xs text-zinc-400 mb-3">
              Pay upon doorstep inspection or use trusted mobile banking.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] font-bold text-emerald-400">
                Cash on Delivery
              </span>
              <span className="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] font-bold text-pink-500">
                bKash
              </span>
              <span className="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] font-bold text-orange-400">
                Nagad
              </span>
            </div>
            <div className="mt-6 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <p className="text-[11px] text-zinc-400 font-medium">
                Admin portal available for store staff & management.
              </p>
              <Link
                to="/admin/login"
                className="inline-block mt-1 text-xs text-brand-orange hover:underline font-semibold"
              >
                Admin Staff Login →
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-400 gap-4">
          <p>© {new Date().getFullYear()} Jutar Ghor Bangladesh Ltd. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy-policy" className="hover:text-zinc-300">Privacy Policy</Link>
            <Link to="/return-policy" className="hover:text-zinc-300">Terms & Exchange</Link>
            <Link to="/contact" className="hover:text-zinc-300">Store Locator</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
