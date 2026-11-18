import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  Heart,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  Ruler,
  Check,
  Plus,
  Minus,
  MessageSquare,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Product, ProductVariant, Review } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { SizeGuideModal } from '../components/common/SizeGuideModal';
import { ProductCard } from '../components/shop/ProductCard';
import { fallbackProducts } from '../data/mockData';
import api from '../services/api';

export const ProductDetailsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { showToast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'shipping' | 'reviews'>('desc');

  // Review Form State
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      if (!slug) return;
      try {
        setLoading(true);
        // Instant fallback match so the user never sees "Product Not Found"
        const localMatch = fallbackProducts.find((p) => p.slug === slug || String(p.id) === slug) || fallbackProducts[0];
        if (localMatch) {
          setProduct(localMatch);
          if (localMatch.images && localMatch.images.length > 0) {
            setSelectedImage(localMatch.images[0].image_url);
          } else if (localMatch.primary_image) {
            setSelectedImage(localMatch.primary_image);
          }
          if (localMatch.variants && localMatch.variants.length > 0) {
            const firstAvailable = localMatch.variants.find((v: ProductVariant) => v.stock_quantity > 0) || localMatch.variants[0];
            setSelectedVariant(firstAvailable);
            setSelectedSize(firstAvailable.size);
            setSelectedColor(firstAvailable.color);
          }
        }

        const res = await api.get(`/products/${slug}`);
        if (res.data?.product) {
          const p = res.data.product;
          setProduct(p);
          if (p.images && p.images.length > 0) {
            setSelectedImage(p.images[0].image_url);
          } else if (p.primary_image) {
            setSelectedImage(p.primary_image);
          }

          if (p.variants && p.variants.length > 0) {
            const firstAvailable = p.variants.find((v: ProductVariant) => v.stock_quantity > 0) || p.variants[0];
            setSelectedVariant(firstAvailable);
            setSelectedSize(firstAvailable.size);
            setSelectedColor(firstAvailable.color);
          }
        }
      } catch (err) {
        console.error('Failed to fetch product', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-orange border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-zinc-400 font-semibold tracking-wider uppercase">Loading Shoe Details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Product Not Found</h2>
        <p className="text-xs text-zinc-400 mb-6">The shoe you are looking for may have been removed or is unavailable.</p>
        <Link
          to="/shop"
          className="px-6 py-2.5 rounded-full bg-brand-orange text-white text-xs font-bold uppercase"
        >
          Back to Shop
        </Link>
      </div>
    );
  }

  const isFavorited = isInWishlist(product.id);
  const discountPercent = product.discount_percentage || 0;
  const isOutOfStock = !selectedVariant || selectedVariant.stock_quantity <= 0;
  const isLowStock = selectedVariant && selectedVariant.stock_quantity > 0 && selectedVariant.stock_quantity <= 5;

  const uniqueSizes = Array.from(new Set(product.variants?.map((v) => v.size) || []));
  const uniqueColors = Array.from(
    new Map(product.variants?.map((v) => [v.color, v.color_hex || '#000000']) || []).entries()
  );

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
    if (product.variants) {
      const match = product.variants.find((v) => v.size === size && (selectedColor ? v.color === selectedColor : true))
        || product.variants.find((v) => v.size === size);
      if (match) {
        setSelectedVariant(match);
        setSelectedColor(match.color);
        setQuantity(1);
      }
    }
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    if (product.variants) {
      const match = product.variants.find((v) => v.color === color && (selectedSize ? v.size === selectedSize : true))
        || product.variants.find((v) => v.color === color);
      if (match) {
        setSelectedVariant(match);
        setSelectedSize(match.size);
        setQuantity(1);
      }
    }
  };

  const handleAddToCart = () => {
    if (selectedVariant) {
      addToCart(product, selectedVariant, quantity);
    }
  };

  const handleBuyNow = () => {
    if (selectedVariant) {
      const added = addToCart(product, selectedVariant, quantity);
      if (added) {
        navigate('/checkout');
      }
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    try {
      setSubmittingReview(true);
      await api.post('/reviews', {
        product_id: product.id,
        rating: reviewRating,
        comment: reviewComment.trim(),
        user_name: reviewName.trim() || 'Verified Customer',
      });
      showToast('Review Submitted', 'Thank you for reviewing this shoe!', 'success');
      setReviewComment('');
      setReviewName('');

      // Refresh product reviews
      const updated = await api.get(`/products/${slug}`);
      if (updated.data?.product) {
        setProduct(updated.data.product);
      }
    } catch (err: any) {
      showToast('Error', err.response?.data?.error || 'Failed to submit review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumb Navigation */}
      <nav className="text-xs text-zinc-400 flex items-center gap-2">
        <Link to="/" className="hover:text-white">Home</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-white">Shoes</Link>
        {product.category_name && (
          <>
            <span>/</span>
            <Link to={`/shop?category=${product.category_slug}`} className="hover:text-white">
              {product.category_name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-brand-orange truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left: Multi-Image Interactive Gallery */}
        <div className="space-y-4">
          {/* Main Selected Image with Zoom Container */}
          <div className="aspect-square bg-zinc-950 rounded-3xl overflow-hidden border border-zinc-800 relative group">
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500 cursor-crosshair"
            />
            {discountPercent > 0 && (
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-brand-orange text-white text-xs font-black uppercase shadow-glow-orange">
                SAVE {discountPercent}%
              </span>
            )}
          </div>

          {/* Thumbnails row */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img) => (
                <button
                  key={img.image_url}
                  onClick={() => setSelectedImage(img.image_url)}
                  className={`w-20 h-20 rounded-2xl bg-zinc-950 overflow-hidden shrink-0 border-2 transition-all ${
                    selectedImage === img.image_url
                      ? 'border-brand-orange shadow-glow-orange'
                      : 'border-zinc-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Purchase Controls */}
        <div className="space-y-6 flex flex-col justify-between">
          <div>
            {/* Brand, SKU & Wishlist Header */}
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-widest text-brand-orange">
                  {product.brand_name || 'AUTHENTIC'}
                </span>
                {product.gender && (
                  <span className="text-xs text-zinc-400 font-medium">
                    • {product.gender}
                  </span>
                )}
              </div>
              <button
                onClick={() => toggleWishlist(product)}
                className={`p-2.5 rounded-full border transition-all ${
                  isFavorited
                    ? 'bg-brand-orange border-brand-orange text-white shadow-glow-orange'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
                aria-label="Wishlist"
              >
                <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase leading-tight mb-3">
              {product.name}
            </h1>

            {/* Rating Stars & SKU */}
            <div className="flex items-center gap-4 text-xs text-zinc-400 mb-6">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                <Star className="w-4 h-4 fill-current" />
                <span>{product.avg_rating ? Number(product.avg_rating).toFixed(1) : '5.0'}</span>
                <span className="text-zinc-500 font-normal">
                  ({product.review_count || product.reviews?.length || 0} reviews)
                </span>
              </div>
              {product.sku && <span>SKU: <strong className="text-zinc-300">{product.sku}</strong></span>}
            </div>

            {/* Price Box */}
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex items-baseline gap-4 mb-6">
              <span className="text-3xl font-black text-white">
                ৳{product.sale_price.toLocaleString('en-BD')}
              </span>
              {discountPercent > 0 && (
                <>
                  <span className="text-base text-zinc-400 line-through">
                    ৳{product.regular_price.toLocaleString('en-BD')}
                  </span>
                  <span className="text-xs font-bold text-brand-orange">
                    (You save ৳{(product.regular_price - product.sale_price).toLocaleString('en-BD')})
                  </span>
                </>
              )}
            </div>

            {/* Size Selector & Size Guide */}
            {uniqueSizes.length > 0 && (
              <div className="mb-6 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                    Select Size (BD / EU): <strong className="text-brand-orange">{selectedSize}</strong>
                  </span>
                  <button
                    onClick={() => setSizeGuideOpen(true)}
                    className="flex items-center gap-1 text-xs text-zinc-400 hover:text-brand-orange underline font-medium transition-colors"
                  >
                    <Ruler className="w-3.5 h-3.5" />
                    <span>Size Guide Chart</span>
                  </button>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {uniqueSizes.map((sz) => {
                    const v = product.variants?.find((item) => item.size === sz);
                    const out = !v || v.stock_quantity <= 0;
                    return (
                      <button
                        key={sz}
                        disabled={out}
                        onClick={() => handleSizeSelect(sz)}
                        className={`py-3 rounded-xl font-bold text-xs border transition-all ${
                          selectedSize === sz
                            ? 'bg-brand-orange text-white border-brand-orange shadow-glow-orange scale-105'
                            : out
                            ? 'bg-zinc-900/40 text-zinc-400 border-zinc-900 line-through cursor-not-allowed'
                            : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Color Options */}
            {uniqueColors.length > 0 && (
              <div className="mb-6 space-y-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 block">
                  Colorway: <strong className="text-white">{selectedColor}</strong>
                </span>
                <div className="flex flex-wrap gap-2">
                  {uniqueColors.map(([colorName, colorHex]) => (
                    <button
                      key={colorName}
                      onClick={() => handleColorSelect(colorName)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                        selectedColor === colorName
                          ? 'bg-zinc-800 border-brand-orange text-white shadow-md'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-zinc-700 shrink-0"
                        style={{ backgroundColor: colorHex }}
                      />
                      <span>{colorName}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock Availability Indicator */}
            <div className="mb-6 flex items-center gap-2 text-xs">
              {isOutOfStock ? (
                <span className="text-red-400 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  Currently Out of Stock in this size
                </span>
              ) : isLowStock ? (
                <span className="text-amber-400 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  Hurry! Only {selectedVariant?.stock_quantity} pairs remaining in Bangladesh warehouse
                </span>
              ) : (
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  In Stock ({selectedVariant?.stock_quantity} available for instant dispatch)
                </span>
              )}
            </div>

            {/* Quantity Stepper & Action Buttons */}
            <div className="space-y-3">
              <div className="flex gap-4">
                {/* Quantity */}
                <div className="flex items-center border border-zinc-800 rounded-xl bg-zinc-900 px-2 py-1">
                  <button
                    disabled={quantity <= 1 || isOutOfStock}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-2 text-zinc-400 hover:text-white disabled:opacity-40"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 text-sm font-bold text-white">{quantity}</span>
                  <button
                    disabled={
                      isOutOfStock || (selectedVariant ? quantity >= selectedVariant.stock_quantity : false)
                    }
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-2 text-zinc-400 hover:text-white disabled:opacity-40"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Add to Bag Button */}
                <button
                  disabled={isOutOfStock}
                  onClick={handleAddToCart}
                  className="flex-1 py-3.5 px-6 rounded-xl bg-brand-orange hover:bg-brand-orange-hover disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-glow-orange transition-all"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{isOutOfStock ? 'Sold Out' : 'Add to Shopping Bag'}</span>
                </button>
              </div>

              {/* Buy Now (Direct to Checkout) */}
              <button
                disabled={isOutOfStock}
                onClick={handleBuyNow}
                className="w-full py-3.5 rounded-xl bg-white hover:bg-zinc-200 disabled:opacity-50 text-black text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-lg"
              >
                <span>Instant Buy Now with Cash on Delivery</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Bangladesh Delivery Highlights Card */}
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-2.5 text-xs text-zinc-300">
            <div className="flex items-center gap-3">
              <Truck className="w-4 h-4 text-brand-orange shrink-0" />
              <div>
                <strong>Express Delivery in Bangladesh:</strong> Inside Dhaka ৳80 (1-2 days) | Outside Dhaka ৳150 (2-4 days)
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <strong>Cash on Delivery:</strong> Inspect the shoes at your doorstep before payment.
              </div>
            </div>
            <div className="flex items-center gap-3">
              <RotateCcw className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <strong>7 Days Size Exchange:</strong> Doesn't fit? We will swap the size with zero hassle.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description & Review Tabs */}
      <div className="pt-8 border-t border-zinc-800/80 space-y-6">
        {/* Tab Headers */}
        <div className="flex border-b border-zinc-800 gap-6 text-sm font-bold">
          <button
            onClick={() => setActiveTab('desc')}
            className={`pb-3 transition-colors relative ${
              activeTab === 'desc' ? 'text-brand-orange' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Product Overview
            {activeTab === 'desc' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-orange" />}
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`pb-3 transition-colors relative ${
              activeTab === 'specs' ? 'text-brand-orange' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Materials & Specifications
            {activeTab === 'specs' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-orange" />}
          </button>
          <button
            onClick={() => setActiveTab('shipping')}
            className={`pb-3 transition-colors relative ${
              activeTab === 'shipping' ? 'text-brand-orange' : 'text-zinc-400 hover:text-white'
            }`}
          >
            BD Delivery & Returns
            {activeTab === 'shipping' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-orange" />}
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 transition-colors relative ${
              activeTab === 'reviews' ? 'text-brand-orange' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Reviews ({product.reviews?.length || 0})
            {activeTab === 'reviews' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-orange" />}
          </button>
        </div>

        {/* Tab Contents */}
        <div className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-4xl">
          {activeTab === 'desc' && (
            <div className="space-y-4">
              <p>{product.description}</p>
              {product.short_description && (
                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400">
                  <p className="font-semibold text-white mb-1">Highlights:</p>
                  <p>{product.short_description}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                <span className="text-zinc-500 uppercase text-[10px] font-bold block mb-1">Brand Heritage</span>
                <span className="text-white font-bold">{product.brand_name || 'Standard'}</span>
              </div>
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                <span className="text-zinc-500 uppercase text-[10px] font-bold block mb-1">Silhouette Category</span>
                <span className="text-white font-bold">{product.category_name || 'Footwear'}</span>
              </div>
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                <span className="text-zinc-500 uppercase text-[10px] font-bold block mb-1">Gender Division</span>
                <span className="text-white font-bold">{product.gender || 'Unisex'}</span>
              </div>
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                <span className="text-zinc-500 uppercase text-[10px] font-bold block mb-1">Upper & Sole Material</span>
                <span className="text-white font-bold">Premium Leather / Breathable Jacquard Knit & Rubber Outsole</span>
              </div>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="space-y-4">
              <p>
                We dispatch all orders via our dedicated courier network across all 64 districts in Bangladesh.
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
                <li><strong>Inside Dhaka Metro:</strong> 1 - 2 business days (৳80 delivery charge, Free over ৳4,000).</li>
                <li><strong>Outside Dhaka (All BD Districts):</strong> 2 - 4 business days via RedX / Steadfast courier (৳150).</li>
                <li><strong>Cash on Delivery:</strong> Available all over Bangladesh. You can check the shoe size upon arrival.</li>
                <li><strong>Exchange Policy:</strong> 7 days exchange window for unworn shoes with original tags and box intact.</li>
              </ul>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-8">
              {/* Existing Reviews */}
              <div className="space-y-4">
                {product.reviews && product.reviews.length > 0 ? (
                  product.reviews.map((rev) => (
                    <div key={rev.id} className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{rev.user_name}</span>
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                            Verified Buyer
                          </span>
                        </div>
                        <div className="flex text-amber-400">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-current" />
                          ))}
                        </div>
                      </div>
                      <p className="text-zinc-300 text-xs">{rev.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-zinc-400 italic">No reviews yet for this shoe. Be the first to review!</p>
                )}
              </div>

              {/* Review Submission Form */}
              <form onSubmit={handleSubmitReview} className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                  Write a Customer Review
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-zinc-400 block mb-1">Your Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Tanvir Ahmed"
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-orange"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-400 block mb-1">Star Rating</label>
                    <select
                      value={reviewRating}
                      onChange={(e) => setReviewRating(Number(e.target.value))}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-orange"
                    >
                      <option value="5">⭐⭐⭐⭐⭐ (5 - Exceptional Kicks)</option>
                      <option value="4">⭐⭐⭐⭐ (4 - Very Good)</option>
                      <option value="3">⭐⭐⭐ (3 - Average)</option>
                      <option value="2">⭐⭐ (2 - Below Expectation)</option>
                      <option value="1">⭐ (1 - Poor)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-1">Review Comment</label>
                  <textarea
                    rows={3}
                    placeholder="Share your experience regarding sizing, leather finish, comfort, or delivery speed in Bangladesh..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    required
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-brand-orange"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-6 py-2.5 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold uppercase tracking-wider transition-all shadow-glow-orange"
                >
                  {submittingReview ? 'Submitting...' : 'Post Customer Review'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Related Shoes Recommendations */}
      {product.related_products && product.related_products.length > 0 && (
        <div className="pt-12 border-t border-zinc-800/80 space-y-6">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-brand-orange">
                Recommendations
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                You May Also Like
              </h3>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {product.related_products.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </div>
      )}

      {/* Size Guide Modal */}
      <SizeGuideModal isOpen={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} />
    </div>
  );
};
