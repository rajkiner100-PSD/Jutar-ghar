import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye, ShoppingBag, Star } from 'lucide-react';
import { Product } from '../../types';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { QuickViewModal } from './QuickViewModal';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isFavorited = isInWishlist(product.id);
  const discountPercent = product.regular_price > product.sale_price
    ? Math.round(((product.regular_price - product.sale_price) / product.regular_price) * 100)
    : 0;

  const isLowStock = product.total_stock !== undefined && product.total_stock > 0 && product.total_stock <= 5;
  const isOutOfStock = product.total_stock !== undefined && product.total_stock <= 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.variants && product.variants.length > 0) {
      // Find first in-stock variant
      const availableVariant = product.variants.find((v) => v.stock_quantity > 0) || product.variants[0];
      addToCart(product, availableVariant, 1);
    } else {
      setQuickViewOpen(true);
    }
  };

  return (
    <>
      <div
        className="group relative flex flex-col bg-[#141414] rounded-2xl border border-zinc-800/80 hover:border-zinc-700 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Top Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
          {discountPercent > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-brand-orange text-white text-[10px] font-black tracking-wider uppercase shadow-md">
              -{discountPercent}%
            </span>
          )}
          {Boolean(product.is_new_arrival) && (
            <span className="px-2 py-0.5 rounded-full bg-white text-black text-[10px] font-black tracking-wider uppercase">
              NEW
            </span>
          )}
          {isLowStock && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/90 text-black text-[10px] font-black tracking-wider uppercase">
              LOW STOCK
            </span>
          )}
          {isOutOfStock && (
            <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black tracking-wider uppercase">
              SOLD OUT
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            isFavorited
              ? 'bg-brand-orange text-white'
              : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white backdrop-blur-sm'
          }`}
          aria-label="Save to Wishlist"
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
        </button>

        {/* Product Image Frame */}
        <Link to={`/product/${product.slug}`} className="relative aspect-square w-full bg-zinc-950 overflow-hidden block">
          <img
            src={product.primary_image || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600'}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {/* Quick Action Overlay (Desktop Hover) */}
          <div
            className={`absolute inset-x-0 bottom-3 px-3 hidden sm:flex items-center gap-2 transition-all duration-300 ${
              isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
            }`}
          >
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setQuickViewOpen(true);
              }}
              className="flex-1 py-2 px-3 rounded-xl bg-zinc-900/90 hover:bg-black text-white text-xs font-semibold backdrop-blur-md border border-zinc-700/80 flex items-center justify-center gap-1.5 shadow-lg transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Quick View</span>
            </button>
            <button
              onClick={handleQuickAdd}
              disabled={isOutOfStock}
              className="py-2 px-3 rounded-xl bg-brand-orange hover:bg-brand-orange-hover disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-1 shadow-glow-orange transition-colors"
              title="Add to Bag"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
            </button>
          </div>
        </Link>

        {/* Product Details */}
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            {/* Brand & Rating */}
            <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
              <span className="uppercase tracking-widest font-bold text-zinc-400">
                {product.brand_name || 'ORIGINAL'}
              </span>
              {product.avg_rating ? (
                <div className="flex items-center gap-1 text-amber-400 font-bold">
                  <Star className="w-3 h-3 fill-current" />
                  <span>{Number(product.avg_rating).toFixed(1)}</span>
                </div>
              ) : null}
            </div>

            {/* Product Title */}
            <Link to={`/product/${product.slug}`} className="block">
              <h3 className="text-sm font-bold text-white group-hover:text-brand-orange transition-colors line-clamp-2 leading-snug">
                {product.name}
              </h3>
            </Link>

            {/* Available Sizes Pills Preview */}
            {product.available_sizes && product.available_sizes.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2.5">
                {product.available_sizes.slice(0, 5).map((size) => (
                  <span
                    key={size}
                    className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800"
                  >
                    {size}
                  </span>
                ))}
                {product.available_sizes.length > 5 && (
                  <span className="text-[10px] text-zinc-400 self-center">
                    +{product.available_sizes.length - 5}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Pricing */}
          <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-base font-black text-white">
                ৳{product.sale_price.toLocaleString('en-BD')}
              </span>
              {discountPercent > 0 && (
                <span className="text-xs text-zinc-400 line-through">
                  ৳{product.regular_price.toLocaleString('en-BD')}
                </span>
              )}
            </div>

            {/* Mobile quick add button */}
            <button
              onClick={handleQuickAdd}
              disabled={isOutOfStock}
              className="sm:hidden p-1.5 rounded-lg bg-brand-orange hover:bg-brand-orange-hover disabled:opacity-50 text-white"
              aria-label="Add to cart"
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      {quickViewOpen && (
        <QuickViewModal product={product} isOpen={quickViewOpen} onClose={() => setQuickViewOpen(false)} />
      )}
    </>
  );
};
