import React from 'react';
import { ShieldCheck, Sparkles, HeartHandshake, Truck, MapPin } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-brand-orange">
          About Jutar Ghor
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase">
          Elevating Footwear Culture in Bangladesh
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto">
          From street-certified sneaker drops to timeless handcrafted leather formals in Dhaka.
        </p>
      </div>

      <div className="p-8 rounded-3xl bg-[#141414] border border-zinc-800 space-y-6 text-xs sm:text-sm text-zinc-300 leading-relaxed">
        <h2 className="text-xl font-bold text-white uppercase tracking-wider text-brand-orange">
          Our Story
        </h2>
        <p>
          Founded in the heart of Dhaka, Bangladesh, <strong>Jutar Ghor (জুতার ঘর)</strong> was born out of a desire for genuine, premium footwear. For years, shoe lovers in Bangladesh faced either rampant counterfeits or limited access to iconic sneaker releases and authentic full-grain leather craftsmanship.
        </p>
        <p>
          We bridged that gap by establishing direct, authenticated sourcing for global athletic and streetwear icons—including Nike, Jordan, Adidas, New Balance, and Puma—while partnering with legendary Bangladeshi shoemakers like <strong>Apex</strong> and <strong>Bata</strong> to curate the finest formal and lifestyle shoes.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-zinc-800">
          <div className="space-y-2">
            <ShieldCheck className="w-6 h-6 text-brand-orange" />
            <h4 className="font-bold text-white">100% Authentic</h4>
            <p className="text-xs text-zinc-400">
              Every single pair undergoes rigorous multi-point inspection before it reaches your hands.
            </p>
          </div>
          <div className="space-y-2">
            <Truck className="w-6 h-6 text-brand-orange" />
            <h4 className="font-bold text-white">Nationwide COD</h4>
            <p className="text-xs text-zinc-400">
              Cash on Delivery to all 64 districts with 24 to 72 hours express courier dispatch.
            </p>
          </div>
          <div className="space-y-2">
            <HeartHandshake className="w-6 h-6 text-brand-orange" />
            <h4 className="font-bold text-white">7 Days Exchange</h4>
            <p className="text-xs text-zinc-400">
              Shoe size doesn't fit? We swap it promptly with zero hidden hassle or interrogation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
