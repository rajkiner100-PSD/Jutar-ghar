import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  ExternalLink,
  AlertCircle,
  Eye,
  Check,
  X,
} from 'lucide-react';
import { Product, Category, Brand } from '../../types';
import { useToast } from '../../context/ToastContext';
import { fallbackProducts, fallbackCategories, fallbackBrands } from '../../data/mockData';
import api from '../../services/api';

export const AdminProductsPage: React.FC = () => {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [categories, setCategories] = useState<Category[]>(fallbackCategories);
  const [brands, setBrands] = useState<Brand[]>(fallbackBrands);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [deleteModalProduct, setDeleteModalProduct] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params: any = { limit: 100, includeInactive: true };
      if (search) params.search = search;
      if (selectedCat) params.category = selectedCat;

      const res = await api.get('/products', { params });
      if (res.data?.products) {
        setProducts(res.data.products);
      }
    } catch (err: any) {
      showToast('Error', 'Failed to fetch products', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.all([api.get('/categories'), api.get('/brands')]).then(([cRes, bRes]) => {
      if (cRes.data?.categories) setCategories(cRes.data.categories);
      if (bRes.data?.brands) setBrands(bRes.data.brands);
    });
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [search, selectedCat]);

  const handleDeleteConfirm = async () => {
    if (!deleteModalProduct) return;
    try {
      setDeleting(true);
      await api.delete(`/products/${deleteModalProduct.id}`);
      showToast('Deleted', `Product "${deleteModalProduct.name}" removed from database`, 'success');
      setDeleteModalProduct(null);
      fetchProducts();
    } catch (err: any) {
      showToast('Error', err.response?.data?.error || 'Failed to delete product', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">
            Footwear Catalog & Stock
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Manage shoes, prices, multi-angle images, size/color variant stock.
          </p>
        </div>
        <Link
          to="/admin/products/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold uppercase tracking-wider shadow-glow-orange transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Shoe</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search shoes by title, brand, or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-brand-orange"
          />
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3 pointer-events-none" />
        </div>

        <select
          value={selectedCat}
          onChange={(e) => setSelectedCat(e.target.value)}
          className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-orange cursor-pointer"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="rounded-2xl bg-[#141414] border border-zinc-800/80 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-zinc-900 text-zinc-400 uppercase font-bold text-[10px] tracking-wider border-b border-zinc-800">
              <tr>
                <th className="px-4 py-3.5">Shoe</th>
                <th className="px-4 py-3.5">Category & Brand</th>
                <th className="px-4 py-3.5">Price (BDT)</th>
                <th className="px-4 py-3.5">Stock</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-zinc-500">
                    Loading shoes from database...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-zinc-500">
                    No shoes found in this view.
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const isLow = p.total_stock !== undefined && p.total_stock > 0 && p.total_stock <= 5;
                  const isOut = p.total_stock !== undefined && p.total_stock === 0;

                  return (
                    <tr key={p.id} className="hover:bg-zinc-800/30 transition-colors">
                      {/* Product Thumbnail & Name */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-zinc-950 overflow-hidden shrink-0 border border-zinc-800">
                            <img
                              src={p.primary_image || ''}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-bold text-white max-w-[200px] truncate">{p.name}</p>
                            <p className="text-[10px] text-zinc-500 font-mono">
                              SKU: {p.sku || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category & Brand */}
                      <td className="px-4 py-3.5">
                        <span className="font-bold text-white block">{p.brand_name || 'N/A'}</span>
                        <span className="text-[10px] text-zinc-400">{p.category_name || 'Uncategorized'}</span>
                      </td>

                      {/* Prices */}
                      <td className="px-4 py-3.5">
                        <span className="font-bold text-white block">
                          ৳{p.sale_price.toLocaleString('en-BD')}
                        </span>
                        {p.regular_price > p.sale_price && (
                          <span className="text-[10px] text-zinc-500 line-through">
                            ৳{p.regular_price.toLocaleString('en-BD')}
                          </span>
                        )}
                      </td>

                      {/* Total Inventory Stock */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            isOut
                              ? 'bg-red-500/20 text-red-400'
                              : isLow
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-emerald-500/15 text-emerald-400'
                          }`}
                        >
                          {p.total_stock !== undefined ? `${p.total_stock} in stock` : 'Variants'}
                        </span>
                      </td>

                      {/* Active Status */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.is_active
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          {p.is_active ? 'Active' : 'Draft'}
                        </span>
                      </td>

                      {/* Action Buttons */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/product/${p.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
                            title="Preview on Store"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>

                          <Link
                            to={`/admin/products/edit/${p.id}`}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-brand-orange hover:bg-zinc-800"
                            title="Edit Product & Variants"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>

                          <button
                            onClick={() => setDeleteModalProduct(p)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-zinc-800"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#181818] border border-zinc-800 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Delete Shoe?</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Are you sure you want to permanently delete <strong>"{deleteModalProduct.name}"</strong>? All associated images and size/color variant stock will be removed.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                disabled={deleting}
                onClick={() => setDeleteModalProduct(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                disabled={deleting}
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors"
              >
                {deleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
