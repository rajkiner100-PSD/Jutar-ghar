import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  SlidersHorizontal,
  ChevronDown,
  X,
  Search,
  PackageOpen,
  ArrowUpDown,
} from 'lucide-react';
import { Product, Category, Brand } from '../types';
import { ProductCard } from '../components/shop/ProductCard';
import { ProductFilterSidebar } from '../components/shop/ProductFilterSidebar';
import { fallbackProducts, fallbackCategories, fallbackBrands } from '../data/mockData';
import api from '../services/api';

export const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [categories, setCategories] = useState<Category[]>(fallbackCategories);
  const [brands, setBrands] = useState<Brand[]>(fallbackBrands);
  const [loading, setLoading] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter state
  const categoryParam = searchParams.get('category') || '';
  const brandParam = searchParams.get('brand') || '';
  const genderParam = searchParams.get('gender') || '';
  const searchParam = searchParams.get('search') || '';
  const sizeParam = searchParams.get('size') || '';
  const sortParam = searchParams.get('sort') || 'popular';
  const pageParam = Number(searchParams.get('page')) || 1;
  const isFeaturedParam = searchParams.get('is_featured') || '';
  const isTrendingParam = searchParams.get('is_trending') || '';

  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(25000);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalProducts, setTotalProducts] = useState<number>(fallbackProducts.length);

  // Fetch Categories & Brands once
  useEffect(() => {
    Promise.all([api.get('/categories'), api.get('/brands')]).then(([cRes, bRes]) => {
      if (cRes.data?.categories) setCategories(cRes.data.categories);
      if (bRes.data?.brands) setBrands(bRes.data.brands);
    });
  }, []);

  // Fetch Products whenever filters change
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const params: Record<string, any> = {
          page: pageParam,
          limit: 12,
          sort: sortParam,
        };

        if (categoryParam) params.category = categoryParam;
        if (brandParam) params.brand = brandParam;
        if (genderParam) params.gender = genderParam;
        if (searchParam) params.search = searchParam;
        if (sizeParam) params.size = sizeParam;
        if (isFeaturedParam) params.is_featured = isFeaturedParam;
        if (isTrendingParam) params.is_trending = isTrendingParam;
        if (maxPrice < 25000) params.maxPrice = maxPrice;
        if (minPrice > 0) params.minPrice = minPrice;

        const res = await api.get('/products', { params });
        if (res.data?.products && res.data.products.length > 0) {
          setProducts(res.data.products);
          if (res.data.pagination) {
            setTotalPages(res.data.pagination.totalPages || 1);
            setTotalProducts(res.data.pagination.total || res.data.products.length);
          }
        }
      } catch (err) {
        console.error('Failed to load products', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [
    categoryParam,
    brandParam,
    genderParam,
    searchParam,
    sizeParam,
    sortParam,
    pageParam,
    isFeaturedParam,
    isTrendingParam,
    maxPrice,
    minPrice,
  ]);

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams());
    setMinPrice(0);
    setMaxPrice(25000);
  };

  const activeFilters = [
    { label: 'Category', value: categoryParam, key: 'category' },
    { label: 'Brand', value: brandParam, key: 'brand' },
    { label: 'Gender', value: genderParam, key: 'gender' },
    { label: 'Size', value: sizeParam, key: 'size' },
    { label: 'Search', value: searchParam, key: 'search' },
  ].filter((f) => Boolean(f.value));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
            All Footwear Catalog
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Showing <strong className="text-white">{totalProducts}</strong> shoes in Bangladesh stock
          </p>
        </div>

        {/* Controls: Mobile Filter Button & Sort Dropdown */}
        <div className="flex items-center gap-3">
          {/* Mobile Filter Trigger */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-300 hover:text-white"
          >
            <SlidersHorizontal className="w-4 h-4 text-brand-orange" />
            <span>Filters</span>
            {activeFilters.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-brand-orange text-white text-[10px] font-bold flex items-center justify-center">
                {activeFilters.length}
              </span>
            )}
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <select
              value={sortParam}
              onChange={(e) => updateFilter('sort', e.target.value)}
              className="bg-transparent text-xs font-semibold text-zinc-200 focus:outline-none cursor-pointer"
            >
              <option value="popular" className="bg-zinc-900">Featured & Popular</option>
              <option value="newest" className="bg-zinc-900">New Arrivals</option>
              <option value="price_asc" className="bg-zinc-900">Price: Low to High</option>
              <option value="price_desc" className="bg-zinc-900">Price: High to Low</option>
              <option value="name_asc" className="bg-zinc-900">Product Name: A - Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Filter Tags */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-zinc-400 font-medium">Active filters:</span>
          {activeFilters.map((f) => (
            <span
              key={f.key}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-200"
            >
              <span className="text-zinc-400">{f.label}:</span>
              <strong className="text-brand-orange capitalize">{f.value}</strong>
              <button
                onClick={() => updateFilter(f.key, '')}
                className="hover:text-red-400 transition-colors ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <button
            onClick={handleResetFilters}
            className="text-xs text-brand-orange hover:underline font-semibold ml-2"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Main Catalog Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <div className="hidden lg:block lg:col-span-1">
          <ProductFilterSidebar
            categories={categories}
            brands={brands}
            selectedCategory={categoryParam}
            onSelectCategory={(cat) => updateFilter('category', cat)}
            selectedBrand={brandParam}
            onSelectBrand={(b) => updateFilter('brand', b)}
            selectedGender={genderParam}
            onSelectGender={(g) => updateFilter('gender', g)}
            selectedSize={sizeParam}
            onSelectSize={(s) => updateFilter('size', s)}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onPriceChange={(min, max) => {
              setMinPrice(min);
              setMaxPrice(max);
            }}
            onReset={handleResetFilters}
          />
        </div>

        {/* Product Grid Area */}
        <div className="lg:col-span-3 space-y-8">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 rounded-2xl bg-zinc-900 animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-[#141414] border border-zinc-800 rounded-3xl min-h-[350px]">
              <PackageOpen className="w-12 h-12 text-zinc-500 mb-3" />
              <h3 className="text-lg font-bold text-white mb-1">No shoes found</h3>
              <p className="text-xs text-zinc-400 max-w-sm mb-6">
                We couldn't find any shoes matching your specific filters. Try clearing your filters or search terms.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-6 py-2.5 rounded-full bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold shadow-glow-orange transition-all"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6 border-t border-zinc-800">
              <button
                disabled={pageParam <= 1}
                onClick={() => updateFilter('page', String(pageParam - 1))}
                className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-300 hover:text-white disabled:opacity-40 transition-colors"
              >
                Previous
              </button>

              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => {
                  const p = i + 1;
                  return (
                    <button
                      key={p}
                      onClick={() => updateFilter('page', String(p))}
                      className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                        pageParam === p
                          ? 'bg-brand-orange text-white shadow-glow-orange'
                          : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>

              <button
                disabled={pageParam >= totalPages}
                onClick={() => updateFilter('page', String(pageParam + 1))}
                className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-300 hover:text-white disabled:opacity-40 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-sm bg-[#121212] border-l border-zinc-800 flex flex-col p-6 overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Filter Footwear
                </h3>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <ProductFilterSidebar
                categories={categories}
                brands={brands}
                selectedCategory={categoryParam}
                onSelectCategory={(cat) => updateFilter('category', cat)}
                selectedBrand={brandParam}
                onSelectBrand={(b) => updateFilter('brand', b)}
                selectedGender={genderParam}
                onSelectGender={(g) => updateFilter('gender', g)}
                selectedSize={sizeParam}
                onSelectSize={(s) => updateFilter('size', s)}
                minPrice={minPrice}
                maxPrice={maxPrice}
                onPriceChange={(min, max) => {
                  setMinPrice(min);
                  setMaxPrice(max);
                }}
                onReset={handleResetFilters}
              />

              <div className="mt-8 pt-4 border-t border-zinc-800">
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-full py-3 rounded-xl bg-brand-orange text-white text-xs font-bold uppercase tracking-wider shadow-glow-orange"
                >
                  Apply Filters & Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
