import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const ContactPage: React.FC = () => {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    showToast('Message Sent', 'Thank you! Our support team in Dhaka will contact you shortly.', 'success');
    setName('');
    setPhone('');
    setMessage('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-brand-orange">
          Customer Support
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase">
          Contact Jutar Ghor Dhaka
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
          Need size advice, order tracking assistance, or corporate bulk shoe orders? We're here to help.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Info Column */}
        <div className="p-8 rounded-3xl bg-[#141414] border border-zinc-800 space-y-6 text-xs text-zinc-300">
          <h3 className="text-base font-bold text-white uppercase tracking-wider">
            Flagship Hub
          </h3>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-brand-orange shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-bold">Banani Experience Center</strong>
                <p className="text-zinc-400">House 42, Road 11, Block D, Banani, Dhaka-1213, Bangladesh</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-brand-orange shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-bold">Helpline & WhatsApp</strong>
                <p className="text-zinc-400">+880 1700-000000 / +880 1800-000000</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-brand-orange shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-bold">Email</strong>
                <p className="text-zinc-400">support@jutarghor.com</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-brand-orange shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-bold">Operating Hours</strong>
                <p className="text-zinc-400">Saturday to Thursday: 10:00 AM – 10:00 PM</p>
                <p className="text-zinc-400">Friday: 2:00 PM – 10:00 PM</p>
              </div>
            </div>
          </div>
        </div>

        {/* Message Form */}
        <form onSubmit={handleSubmit} className="p-8 rounded-3xl bg-[#141414] border border-zinc-800 space-y-4">
          <h3 className="text-base font-bold text-white uppercase tracking-wider">
            Send us a Query
          </h3>

          <div>
            <label className="text-xs font-semibold text-zinc-400 block mb-1">Your Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Shakib Al Hasan"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-orange"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-400 block mb-1">Mobile Number</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="01XXXXXXXXX"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-orange"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-400 block mb-1">Your Message</label>
            <textarea
              rows={4}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us what shoe or size you're inquiring about..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-brand-orange"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-glow-orange transition-all"
          >
            <Send className="w-4 h-4" />
            <span>Send Message</span>
          </button>
        </form>
      </div>
    </div>
  );
};
