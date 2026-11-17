import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Star, ShoppingBag, ShieldCheck, Truck, Check } from 'lucide-react';
import { Product, ProductVariant } from '../../types';
import { useCart } from '../../context/CartContext';
import api from '../../services/api';

interface QuickViewModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, isOpen, onClose }) => {
  const { addToCart } = useCart();
  const [fullProduct, setFullProduct] = useState<Product>(product);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedImage, setSelectedImage] = useState<string>(product.primary_image || '');

  useEffect(() => {
    // Fetch full product variants if needed
    if (!product.variants || product.variants.length === 0) {
      api.get(`/products/${product.slug}`).then((res) => {
        if (res.data?.product) {
          const p = res.data.product;
          setFullProduct(p);
          if (p.images && p.images.length > 0) {
            setSelectedImage(p.images[0].image_url);
          }
          if (p.variants && p.variants.length > 0) {
            const firstInStock = p.variants.find((v: ProductVariant) => v.stock_quantity > 0) || p.variants[0];
            setSelectedVariant(firstInStock);
            setSelectedSize(firstInStock.size);
            setSelectedColor(firstInStock.color);
          }
        }
      });
    } else {
      const firstInStock = product.variants.find((v) => v.stock_quantity > 0) || product.variants[0];
      setSelectedVariant(firstInStock);
      setSelectedSize(firstInStock?.size || '');
      setSelectedColor(firstInStock?.color || '');
    }
  }, [product]);

  // When size or color changes, find matching variant
  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
    if (fullProduct.variants) {
      const match = fullProduct.variants.find((v) => v.size === size && (selectedColor ? v.color === selectedColor : true))
        || fullProduct.variants.find((v) => v.size === size);
      if (match) {
        setSelectedVariant(match);
        setSelectedColor(match.color);
      }
    }
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    if (fullProduct.variants) {
      const match = fullProduct.variants.find((v) => v.color === color && (selectedSize ? v.size === selectedSize : true))
        || fullProduct.variants.find((v) => v.color === color);
      if (match) {
        setSelectedVariant(match);
        setSelectedSize(match.size);
      }
    }
  };

  const handleAddToCart = () => {
    if (selectedVariant) {
      addToCart(fullProduct, selectedVariant, quantity);
      onClose();
    }
  };

  if (!isOpen) return null;

  const uniqueSizes = Array.from(new Set(fullProduct.variants?.map((v) => v.size) || []));
  const uniqueColors = Array.from(
    new Map(fullProduct.variants?.map((v) => [v.color, v.color_hex || '#000000']) || []).entries()
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#141414] border border-zinc-800 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl animate-scale-up max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80">
          <span className="text-xs uppercase font-bold tracking-widest text-brand-orange">
            Quick Shoe Inspection
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image Column */}
          <div className="space-y-3">
            <div className="aspect-square bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800">
              <img
                src={selectedImage || fullProduct.primary_image || ''}
                alt={fullProduct.name}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Thumbnails */}
            {fullProduct.images && fullProduct.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {fullProduct.images.map((img) => (
                  <button
                    key={img.image_url}
                    onClick={() => setSelectedImage(img.image_url)}
                    className={`w-14 h-14 rounded-lg bg-zinc-950 overflow-hidden shrink-0 border-2 transition-all ${
                      selectedImage === img.image_url ? 'border-brand-orange' : 'border-zinc-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Column */}
          <div className="flex flex-col justify-between space-y-4">
            <div>
              {/* Brand & Title */}
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">
                {fullProduct.brand_name || 'AUTHENTIC FOOTWEAR'}
              </p>
              <h2 className="text-xl font-black text-white leading-tight mb-2">
                {fullProduct.name}
              </h2>

              {/* SKU & Stock status */}
              <div className="flex items-center gap-3 text-xs text-zinc-400 mb-3">
                {fullProduct.sku && <span>SKU: {fullProduct.sku}</span>}
                {selectedVariant && (
                  <span className={`font-semibold ${selectedVariant.stock_quantity > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    • {selectedVariant.stock_quantity > 0 ? `In Stock (${selectedVariant.stock_quantity} left)` : 'Out of Stock'}
                  </span>
                )}
              </div>

              {/* Pricing */}
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-2xl font-black text-white">
                  ৳{fullProduct.sale_price.toLocaleString('en-BD')}
                </span>
                {fullProduct.regular_price > fullProduct.sale_price && (
                  <span className="text-sm text-zinc-400 line-through">
                    ৳{fullProduct.regular_price.toLocaleString('en-BD')}
                  </span>
                )}
              </div>

              {/* Size Selector */}
              {uniqueSizes.length > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between items-center text-xs font-bold text-zinc-300 mb-2">
                    <span>Select Size (BD / EU)</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {uniqueSizes.map((size) => {
                      const v = fullProduct.variants?.find((item) => item.size === size);
                      const isOutOfStock = !v || v.stock_quantity <= 0;
                      return (
                        <button
                          key={size}
                          disabled={isOutOfStock}
                          onClick={() => handleSizeSelect(size)}
                          className={`w-10 h-10 rounded-xl font-bold text-xs border transition-all ${
                            selectedSize === size
                              ? 'bg-brand-orange text-white border-brand-orange shadow-glow-orange'
                              : isOutOfStock
                              ? 'bg-zinc-900/50 text-zinc-400 border-zinc-900 cursor-not-allowed line-through'
                              : 'bg-zinc-900 text-zinc-200 border-zinc-800 hover:border-zinc-700'
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Color Selector */}
              {uniqueColors.length > 0 && (
                <div className="mb-4">
                  <div className="text-xs font-bold text-zinc-300 mb-2">
                    <span>Color: </span>
                    <span className="text-brand-orange">{selectedColor}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {uniqueColors.map(([colorName, colorHex]) => (
                      <button
                        key={colorName}
                        onClick={() => handleColorSelect(colorName)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                          selectedColor === colorName
                            ? 'bg-zinc-800 border-brand-orange text-white'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        <span className="w-3 h-3 rounded-full border border-zinc-700 shrink-0" style={{ backgroundColor: colorHex }} />
                        <span>{colorName}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={!selectedVariant || selectedVariant.stock_quantity <= 0}
                className="w-full py-3.5 rounded-xl bg-brand-orange hover:bg-brand-orange-hover disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-glow-orange transition-all"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>
                  {!selectedVariant || selectedVariant.stock_quantity <= 0 ? 'Out of Stock' : 'Add to Shopping Bag'}
                </span>
              </button>

              <Link
                to={`/product/${fullProduct.slug}`}
                onClick={onClose}
                className="block text-center text-xs text-zinc-400 hover:text-brand-orange underline font-medium"
              >
                View Full Specifications & Customer Reviews →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
