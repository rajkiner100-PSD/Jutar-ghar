import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Truck,
  RotateCcw,
  Star,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  ShoppingBag,
} from 'lucide-react';
import { Product, Category, Banner } from '../types';
import { ProductCard } from '../components/shop/ProductCard';
import api from '../services/api';

export const HomePage: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [bannersRes, catsRes, featuredRes, trendingRes, newRes] = await Promise.all([
          api.get('/banners'),
          api.get('/categories'),
          api.get('/products?is_featured=true&limit=8'),
          api.get('/products?is_trending=true&limit=4'),
          api.get('/products?is_new_arrival=true&limit=4'),
        ]);

        if (bannersRes.data?.banners) setBanners(bannersRes.data.banners);
        if (catsRes.data?.categories) setCategories(catsRes.data.categories);
        if (featuredRes.data?.products) setFeaturedProducts(featuredRes.data.products);
        if (trendingRes.data?.products) setTrendingProducts(trendingRes.data.products);
        if (newRes.data?.products) setNewArrivals(newRes.data.products);
      } catch (err) {
        console.error('Failed to load home page data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Auto rotate hero banners
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const activeBanner = banners[currentBannerIndex] || {
    title: 'THE ULTIMATE SNEAKER DESTINATION',
    subtitle: 'Limited edition Nike Air Jordan, Ultraboost & handcrafted formal leather shoes in Bangladesh.',
    badge: 'NEW COLLECTION 2026',
    image_url: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1600&q=80',
    link_url: '/shop?category=sneakers',
    button_text: 'Explore Kicks',
  };

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-black">
        <div className="relative h-[500px] sm:h-[580px] lg:h-[640px] w-full">
          {/* Background Image with Gradient Overlay */}
          <img
            src={activeBanner.image_url}
            alt={activeBanner.title}
            className="w-full h-full object-cover object-center filter brightness-[0.45] transition-all duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B] via-transparent to-black/60" />

          {/* Hero Content */}
          <div className="absolute inset-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-16 sm:pb-24">
            <div className="max-w-2xl space-y-4 animate-slide-up">
              {activeBanner.badge && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-orange text-white text-[11px] font-black tracking-widest uppercase shadow-glow-orange">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{activeBanner.badge}</span>
                </div>
              )}

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight uppercase leading-none">
                {activeBanner.title}
              </h1>

              {activeBanner.subtitle && (
                <p className="text-sm sm:text-base text-zinc-300 font-medium leading-relaxed max-w-xl">
                  {activeBanner.subtitle}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to={activeBanner.link_url || '/shop'}
                  className="px-6 py-3.5 rounded-full bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-glow-orange transition-all duration-300"
                >
                  <span>{activeBanner.button_text || 'Shop Now'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/shop"
                  className="px-6 py-3.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-md border border-zinc-700/80 transition-all"
                >
                  View All Shoes
                </Link>
              </div>
            </div>
          </div>

          {/* Banner Controls */}
          {banners.length > 1 && (
            <div className="absolute bottom-6 right-8 hidden sm:flex items-center gap-2 z-20">
              <button
                onClick={() =>
                  setCurrentBannerIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1))
                }
                className="w-10 h-10 rounded-full bg-zinc-900/80 border border-zinc-700 text-white flex items-center justify-center hover:bg-brand-orange hover:border-brand-orange transition-colors"
                aria-label="Previous banner"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentBannerIndex((prev) => (prev + 1) % banners.length)}
                className="w-10 h-10 rounded-full bg-zinc-900/80 border border-zinc-700 text-white flex items-center justify-center hover:bg-brand-orange hover:border-brand-orange transition-colors"
                aria-label="Next banner"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Trust Badges Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-3xl bg-[#141414] border border-zinc-800/80">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-brand-orange shrink-0" />
            <div>
              <p className="text-xs font-bold text-white">100% Authentic</p>
              <p className="text-[11px] text-zinc-400">Verified genuine shoe guarantee</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Truck className="w-8 h-8 text-brand-orange shrink-0" />
            <div>
              <p className="text-xs font-bold text-white">Fast BD Shipping</p>
              <p className="text-[11px] text-zinc-400">Dhaka 1-2 days, 64 districts 2-4 days</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <RotateCcw className="w-8 h-8 text-brand-orange shrink-0" />
            <div>
              <p className="text-xs font-bold text-white">7 Days Easy Exchange</p>
              <p className="text-[11px] text-zinc-400">Hassle-free size replacement</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-brand-orange shrink-0" />
            <div>
              <p className="text-xs font-bold text-white">Cash on Delivery</p>
              <p className="text-[11px] text-zinc-400">Check shoes at your doorstep</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Shoe Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-orange">
              Categories
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
              Shop by Silhouette
            </h2>
          </div>
          <Link
            to="/shop"
            className="text-xs font-bold text-zinc-400 hover:text-brand-orange flex items-center gap-1 transition-colors"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/shop?category=${cat.slug}`}
              className="group relative h-48 sm:h-56 rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800/80 hover:border-brand-orange/60 transition-all duration-300 block"
            >
              <img
                src={cat.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600'}
                alt={cat.name}
                className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500 filter brightness-75 group-hover:brightness-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <h3 className="text-base font-black text-white uppercase group-hover:text-brand-orange transition-colors">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-zinc-300 line-clamp-1 mt-0.5">
                  {cat.description || 'Explore collection'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Best Sellers / Featured Kicks */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-orange">
              Curated Selection
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
              Best Sellers & Staff Picks
            </h2>
          </div>
          <Link
            to="/shop?is_featured=true"
            className="text-xs font-bold text-zinc-400 hover:text-brand-orange flex items-center gap-1 transition-colors"
          >
            <span>Explore All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-80 rounded-2xl bg-zinc-900 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Promotional Mid-Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-zinc-900 via-[#181818] to-zinc-900 border border-zinc-800 p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-lg">
            <span className="px-3 py-1 rounded-full bg-brand-orange/20 text-brand-orange text-[10px] font-black uppercase tracking-widest border border-brand-orange/30">
              BANGLADESH PROMO
            </span>
            <h3 className="text-2xl sm:text-4xl font-black text-white tracking-tight uppercase">
              Free Delivery Inside Dhaka
            </h3>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Enjoy 100% Free Express Delivery inside Dhaka Metropolitan area on any order of ৳4,000 or more. Cash on delivery available at checkout.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <Link
                to="/shop"
                className="px-6 py-3 rounded-full bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold uppercase tracking-wider transition-all shadow-glow-orange"
              >
                Claim Free Delivery
              </Link>
              <span className="text-xs text-zinc-400 font-semibold">Use code: DHAKAFREE</span>
            </div>
          </div>

          <div className="w-full md:w-80 aspect-video md:aspect-square rounded-2xl overflow-hidden border border-zinc-800 shrink-0">
            <img
              src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80"
              alt="Promo Shoes"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Trending Drops & New Arrivals Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-end justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-brand-orange" />
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-brand-orange">
                Fresh Drops
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
                Trending Right Now
              </h2>
            </div>
          </div>
          <Link
            to="/shop?is_trending=true"
            className="text-xs font-bold text-zinc-400 hover:text-brand-orange flex items-center gap-1 transition-colors"
          >
            <span>See More</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {trendingProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-orange">
            Customer Testimonials
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
            Loved by Shoe Enthusiasts in BD
          </h2>
          <p className="text-xs text-zinc-400">
            Real reviews from sneakerheads and leather footwear connoisseurs in Dhaka, Chittagong, and Sylhet.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#141414] border border-zinc-800 space-y-4">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed italic">
              "Authentic Chicago 1s delivered to Banani in under 24 hours. The double box packaging was pristine, and the shoe size matched the EU size chart accurately."
            </p>
            <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs">
              <span className="font-bold text-white">Rahim Ahmed</span>
              <span className="text-zinc-500">Banani, Dhaka</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#141414] border border-zinc-800 space-y-4">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed italic">
              "Finding genuine Apex leather Oxfords online with Cash on Delivery outside Dhaka used to be stressful. Jutar Ghor made it seamless—delivered to Chittagong in 2 days."
            </p>
            <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs">
              <span className="font-bold text-white">Nasir Uddin</span>
              <span className="text-zinc-500">Nasirabad, Chittagong</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#141414] border border-zinc-800 space-y-4">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed italic">
              "The Ultraboost Light is the real deal. Cushioning is heavenly for Hatirjheel morning runs. Love the transparent pricing and instant order tracking."
            </p>
            <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs">
              <span className="font-bold text-white">Tanvir Hossain</span>
              <span className="text-zinc-500">Dhanmondi, Dhaka</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
