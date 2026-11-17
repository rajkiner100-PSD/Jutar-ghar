import React from 'react';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-brand-orange">
          Legal & Privacy
        </span>
        <h1 className="text-3xl font-black text-white uppercase tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
          How Jutar Ghor Bangladesh protects and manages your customer information.
        </p>
      </div>

      <div className="p-8 rounded-3xl bg-[#141414] border border-zinc-800 space-y-6 text-xs sm:text-sm text-zinc-300 leading-relaxed">
        <h3 className="text-base font-bold text-white uppercase text-brand-orange">
          Data Protection & Privacy
        </h3>
        <p>
          At Jutar Ghor, your privacy is paramount. We collect only the information necessary to fulfill and deliver your shoe orders across Bangladesh, including your full name, mobile number, and delivery street address.
        </p>
        <p>
          We never sell, rent, or trade customer contact details with third-party advertisers. All passwords and sensitive authentication data are encrypted with industry-standard bcrypt hashing.
        </p>
        <p>
          We do not store payment card details on our local database. Payments made through bKash or Nagad are processed securely via established mobile banking channels.
        </p>
      </div>
    </div>
  );
};
