import React from 'react';
import { RotateCcw, Filter } from 'lucide-react';
import { Category, Brand } from '../../types';

interface ProductFilterSidebarProps {
  categories: Category[];
  brands: Brand[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  selectedBrand: string;
  onSelectBrand: (brand: string) => void;
  selectedGender: string;
  onSelectGender: (gender: string) => void;
  selectedSize: string;
  onSelectSize: (size: string) => void;
  minPrice: number;
  maxPrice: number;
  onPriceChange: (min: number, max: number) => void;
  onReset: () => void;
}

export const ProductFilterSidebar: React.FC<ProductFilterSidebarProps> = ({
  categories,
  brands,
  selectedCategory,
  onSelectCategory,
  selectedBrand,
  onSelectBrand,
  selectedGender,
  onSelectGender,
  selectedSize,
  onSelectSize,
  minPrice,
  maxPrice,
  onPriceChange,
  onReset,
}) => {
  const commonSizes = ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'];
  const genders = ['Men', 'Women', 'Kids', 'Unisex'];

  return (
    <aside className="w-full bg-[#141414] border border-zinc-800/80 rounded-2xl p-5 space-y-6">
      {/* Title & Reset */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-brand-orange" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Filters</h3>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-[11px] font-semibold text-zinc-400 hover:text-brand-orange transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Category Filter */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 mb-3">
          Categories
        </h4>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          <button
            onClick={() => onSelectCategory('')}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              !selectedCategory ? 'bg-brand-orange/15 text-brand-orange font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            All Footwear
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.slug)}
              className={`w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedCategory === cat.slug
                  ? 'bg-brand-orange/15 text-brand-orange font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>{cat.name}</span>
              {cat.product_count !== undefined && (
                <span className="text-[10px] text-zinc-400">{cat.product_count}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Gender Filter */}
      <div className="pt-4 border-t border-zinc-800/80">
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 mb-3">
          Gender / Division
        </h4>
        <div className="flex flex-wrap gap-2">
          {genders.map((g) => (
            <button
              key={g}
              onClick={() => onSelectGender(selectedGender === g ? '' : g)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                selectedGender === g
                  ? 'bg-brand-orange border-brand-orange text-white shadow-glow-orange'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Brand Filter */}
      <div className="pt-4 border-t border-zinc-800/80">
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 mb-3">
          Shoe Brands
        </h4>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          <button
            onClick={() => onSelectBrand('')}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              !selectedBrand ? 'bg-brand-orange/15 text-brand-orange font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            All Brands
          </button>
          {brands.map((b) => (
            <button
              key={b.id}
              onClick={() => onSelectBrand(b.slug)}
              className={`w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedBrand === b.slug
                  ? 'bg-brand-orange/15 text-brand-orange font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>{b.name}</span>
              {b.product_count !== undefined && (
                <span className="text-[10px] text-zinc-400">{b.product_count}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Size (BD/EU) Filter */}
      <div className="pt-4 border-t border-zinc-800/80">
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 mb-3">
          Size (BD / EU)
        </h4>
        <div className="grid grid-cols-4 gap-1.5">
          {commonSizes.map((sz) => (
            <button
              key={sz}
              onClick={() => onSelectSize(selectedSize === sz ? '' : sz)}
              className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                selectedSize === sz
                  ? 'bg-brand-orange border-brand-orange text-white shadow-glow-orange'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {sz}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="pt-4 border-t border-zinc-800/80 space-y-3">
        <div className="flex justify-between items-center text-xs font-bold text-zinc-300">
          <span className="uppercase tracking-wider">Max Price</span>
          <span className="text-brand-orange font-black">৳{maxPrice.toLocaleString('en-BD')}</span>
        </div>
        <input
          type="range"
          min="1000"
          max="25000"
          step="500"
          value={maxPrice}
          onChange={(e) => onPriceChange(minPrice, Number(e.target.value))}
          className="w-full accent-brand-orange bg-zinc-800 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-zinc-400">
          <span>৳1,000</span>
          <span>৳25,000</span>
        </div>
      </div>
    </aside>
  );
};
