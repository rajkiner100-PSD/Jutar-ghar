import React, { useState } from 'react';
import { X, Ruler, CheckCircle } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'men' | 'women'>('men');

  if (!isOpen) return null;

  const menSizes = [
    { bdEu: '39', us: '6.5', uk: '6.0', cm: '24.5', inch: '9.6' },
    { bdEu: '40', us: '7.5', uk: '7.0', cm: '25.0', inch: '9.8' },
    { bdEu: '41', us: '8.0', uk: '7.5', cm: '26.0', inch: '10.2' },
    { bdEu: '42', us: '8.5', uk: '8.0', cm: '26.5', inch: '10.4' },
    { bdEu: '43', us: '9.5', uk: '9.0', cm: '27.5', inch: '10.8' },
    { bdEu: '44', us: '10.0', uk: '9.5', cm: '28.0', inch: '11.0' },
    { bdEu: '45', us: '11.0', uk: '10.5', cm: '29.0', inch: '11.4' },
  ];

  const womenSizes = [
    { bdEu: '35', us: '5.0', uk: '2.5', cm: '22.0', inch: '8.7' },
    { bdEu: '36', us: '6.0', uk: '3.5', cm: '23.0', inch: '9.0' },
    { bdEu: '37', us: '6.5', uk: '4.0', cm: '23.5', inch: '9.2' },
    { bdEu: '38', us: '7.5', uk: '5.0', cm: '24.0', inch: '9.4' },
    { bdEu: '39', us: '8.5', uk: '6.0', cm: '25.0', inch: '9.8' },
    { bdEu: '40', us: '9.0', uk: '6.5', cm: '25.5', inch: '10.0' },
  ];

  const currentSizes = activeTab === 'men' ? menSizes : womenSizes;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#141414] border border-zinc-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Ruler className="w-5 h-5 text-brand-orange" />
            <h3 className="text-base font-bold text-white">Shoe Size Conversion Chart</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Gender Switch */}
          <div className="flex rounded-lg bg-zinc-900 p-1 border border-zinc-800">
            <button
              onClick={() => setActiveTab('men')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                activeTab === 'men' ? 'bg-brand-orange text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Men's Sizing
            </button>
            <button
              onClick={() => setActiveTab('women')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                activeTab === 'women' ? 'bg-brand-orange text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Women's Sizing
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-zinc-800">
            <table className="w-full text-xs text-left">
              <thead className="bg-zinc-900 text-zinc-300 uppercase font-semibold">
                <tr>
                  <th className="px-3 py-2.5">BD / EU</th>
                  <th className="px-3 py-2.5">US</th>
                  <th className="px-3 py-2.5">UK</th>
                  <th className="px-3 py-2.5">Foot (CM)</th>
                  <th className="px-3 py-2.5">Foot (Inch)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                {currentSizes.map((row) => (
                  <tr key={row.bdEu} className="hover:bg-zinc-800/40">
                    <td className="px-3 py-2.5 font-bold text-brand-orange">{row.bdEu}</td>
                    <td className="px-3 py-2.5">{row.us}</td>
                    <td className="px-3 py-2.5">{row.uk}</td>
                    <td className="px-3 py-2.5">{row.cm} cm</td>
                    <td className="px-3 py-2.5">{row.inch}"</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Measurement Tips */}
          <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-400 space-y-1.5">
            <div className="flex items-center gap-2 text-white font-semibold">
              <CheckCircle className="w-4 h-4 text-brand-orange" />
              <span>How to Measure Your Foot Length</span>
            </div>
            <p>
              1. Place a piece of paper on the floor against a flat wall.
            </p>
            <p>
              2. Step on the paper with your heel firmly touching the wall.
            </p>
            <p>
              3. Mark the longest tip of your toes, then measure the distance in cm with a ruler.
            </p>
            <p className="text-brand-orange font-medium mt-1">
              💡 Tip: If you have wide feet or fall between two sizes, choose the larger size for maximum comfort.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
