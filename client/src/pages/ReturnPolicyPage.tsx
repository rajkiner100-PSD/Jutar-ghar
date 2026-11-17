import React from 'react';
import { RotateCcw, ShieldCheck, CheckCircle } from 'lucide-react';

export const ReturnPolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-brand-orange">
          Confidence Guarantee
        </span>
        <h1 className="text-3xl font-black text-white uppercase tracking-tight">
          7-Day Return & Size Exchange Policy
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
          Shop shoes worry-free. If the fit isn't right, we exchange it across Bangladesh.
        </p>
      </div>

      <div className="p-8 rounded-3xl bg-[#141414] border border-zinc-800 space-y-6 text-xs sm:text-sm text-zinc-300 leading-relaxed">
        <h3 className="text-base font-bold text-white uppercase tracking-wider text-brand-orange">
          1. Exchange Eligibility Window
        </h3>
        <p>
          You have <strong>7 calendar days</strong> from the date of doorstep delivery to request a shoe size replacement or product exchange.
        </p>

        <h3 className="text-base font-bold text-white uppercase tracking-wider text-brand-orange">
          2. Condition of Footwear
        </h3>
        <p>
          To qualify for an exchange, shoes must be unworn outdoor, clean, with the original shoe box, laces, wrapping paper, and brand tags intact. Please try shoes indoors on a clean carpeted surface.
        </p>

        <h3 className="text-base font-bold text-white uppercase tracking-wider text-brand-orange">
          3. How to Request an Exchange
        </h3>
        <p>
          Contact our Dhaka helpline at <strong>+880 1700-000000</strong> or WhatsApp with your Order Reference Number (`JG-2026-XXXXX`). Our team will dispatch the replacement size and pick up the original pair.
        </p>
      </div>
    </div>
  );
};
