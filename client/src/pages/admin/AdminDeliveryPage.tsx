import React, { useState, useEffect } from 'react';
import { Truck, Check, Save } from 'lucide-react';
import { DeliverySettings } from '../../types';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

export const AdminDeliveryPage: React.FC = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [insideDhakaFee, setInsideDhakaFee] = useState<number>(80);
  const [outsideDhakaFee, setOutsideDhakaFee] = useState<number>(150);
  const [freeThreshold, setFreeThreshold] = useState<number>(4000);
  const [daysDhaka, setDaysDhaka] = useState('1-2 Days (Express)');
  const [daysOutside, setDaysOutside] = useState('2-4 Days (Courier)');

  useEffect(() => {
    api.get('/delivery').then((res) => {
      if (res.data?.settings) {
        const s = res.data.settings;
        setInsideDhakaFee(s.inside_dhaka_fee);
        setOutsideDhakaFee(s.outside_dhaka_fee);
        setFreeThreshold(s.free_delivery_threshold);
        setDaysDhaka(s.estimated_days_inside_dhaka);
        setDaysOutside(s.estimated_days_outside_dhaka);
      }
    }).catch((err) => {
      showToast('Error', 'Failed to load delivery settings', 'error');
    }).finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.put('/delivery', {
        inside_dhaka_fee: Number(insideDhakaFee),
        outside_dhaka_fee: Number(outsideDhakaFee),
        free_delivery_threshold: Number(freeThreshold),
        estimated_days_inside_dhaka: daysDhaka,
        estimated_days_outside_dhaka: daysOutside,
      });
      showToast('Settings Saved', 'Nationwide delivery rates updated successfully', 'success');
    } catch (err: any) {
      showToast('Error', err.response?.data?.error || 'Failed to update delivery settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-zinc-500">Loading delivery configuration...</div>;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="pb-2">
        <h1 className="text-2xl font-black text-white uppercase tracking-tight">
          Delivery & Shipping Charges
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Configure courier shipping fees for Inside Dhaka vs Outside Dhaka districts.
        </p>
      </div>

      <form onSubmit={handleSave} className="p-6 rounded-3xl bg-[#141414] border border-zinc-800 space-y-5 shadow-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-zinc-400 block mb-1">
              Inside Dhaka Delivery Fee (৳ BDT)
            </label>
            <input
              type="number"
              min="0"
              required
              value={insideDhakaFee}
              onChange={(e) => setInsideDhakaFee(Number(e.target.value))}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-orange font-bold"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-400 block mb-1">
              Outside Dhaka (All BD Districts) Fee (৳ BDT)
            </label>
            <input
              type="number"
              min="0"
              required
              value={outsideDhakaFee}
              onChange={(e) => setOutsideDhakaFee(Number(e.target.value))}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-orange font-bold"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-zinc-400 block mb-1">
            Free Shipping Minimum Spend Threshold (৳ BDT)
          </label>
          <input
            type="number"
            min="0"
            required
            value={freeThreshold}
            onChange={(e) => setFreeThreshold(Number(e.target.value))}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-orange font-bold"
          />
          <span className="text-[10px] text-zinc-500 mt-1 block">
            Orders above this subtotal amount automatically receive free delivery inside Dhaka.
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-zinc-400 block mb-1">
              Estimated Delivery (Dhaka)
            </label>
            <input
              type="text"
              value={daysDhaka}
              onChange={(e) => setDaysDhaka(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-orange"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-400 block mb-1">
              Estimated Delivery (Outside Dhaka)
            </label>
            <input
              type="text"
              value={daysOutside}
              onChange={(e) => setDaysOutside(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-orange"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-glow-orange transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Update Delivery Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
