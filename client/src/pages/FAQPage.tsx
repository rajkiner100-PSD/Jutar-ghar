import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export const FAQPage: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Are all your shoes 100% original and authentic?',
      a: 'Yes, absolutely. We guarantee 100% authenticity on all footwear. Every pair of sneakers, sports runners, and leather formals is sourced through verified brand distributors and inspected for factory SKU matching before dispatch in Bangladesh.',
    },
    {
      q: 'How does Cash on Delivery (COD) work?',
      a: 'When you place an order with Cash on Delivery, our courier brings the parcel to your doorstep anywhere in Bangladesh. You may check the package and pay the rider in cash upon receiving.',
    },
    {
      q: 'What are the delivery charges and delivery times?',
      a: 'Inside Dhaka Metropolitan: ৳80 delivery charge, delivered within 1 to 2 business days. Outside Dhaka (all 64 districts): ৳150 delivery charge, delivered within 2 to 4 business days. Orders over ৳4,000 qualify for FREE delivery inside Dhaka!',
    },
    {
      q: 'What if the shoe size does not fit my feet?',
      a: 'We offer a 7-day hassle-free size replacement guarantee. Simply contact our support team on WhatsApp or phone within 7 days of receiving the shoes, keep the original box and tags intact, and we will swap your size.',
    },
    {
      q: 'Can I pay via bKash or Nagad?',
      a: 'Yes! We support bKash and Nagad mobile payments. Select the bKash or Nagad option at checkout, make the payment to our official merchant account, and enter your Transaction ID (TrxID) in the checkout field.',
    },
    {
      q: 'How can I track my shipment?',
      a: 'Every order gets a unique reference code (e.g. JG-2026-10001). Click the "Track Your Order" link in our header or visit /track to view live updates from warehouse packaging to courier dispatch.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-brand-orange">
          Got Questions?
        </span>
        <h1 className="text-3xl font-black text-white uppercase tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
          Everything you need to know about shopping footwear with Jutar Ghor in Bangladesh.
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-[#141414] border border-zinc-800 transition-colors"
            >
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full flex items-center justify-between text-left text-sm font-bold text-white hover:text-brand-orange transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${isOpen ? 'rotate-180 text-brand-orange' : ''}`} />
              </button>
              {isOpen && (
                <p className="mt-3 text-xs sm:text-sm text-zinc-300 leading-relaxed pt-2 border-t border-zinc-800/60">
                  {faq.a}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
