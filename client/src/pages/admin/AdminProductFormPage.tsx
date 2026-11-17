import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Upload,
  Check,
  Star,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Category, Brand, ProductVariant, ProductImage } from '../../types';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

export const AdminProductFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [brandId, setBrandId] = useState<number | ''>('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [gender, setGender] = useState<'Men' | 'Women' | 'Kids' | 'Unisex'>('Unisex');
  const [regularPrice, setRegularPrice] = useState<number>(0);
  const [salePrice, setSalePrice] = useState<number>(0);
  const [shortDesc, setShortDesc] = useState('');
  const [description, setDescription] = useState('');

  // Flags
  const [isFeatured, setIsFeatured] = useState(false);
  const [isTrending, setIsTrending] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(true);
  const [isActive, setIsActive] = useState(true);

  // Images list
  const [images, setImages] = useState<{ image_url: string; is_primary: boolean }[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');

  // Variants list (Size, Color, Stock)
  const [variants, setVariants] = useState<ProductVariant[]>([
    { size: '40', color: 'Triple Black', color_hex: '#000000', stock_quantity: 10, sku: '' },
    { size: '41', color: 'Triple Black', color_hex: '#000000', stock_quantity: 10, sku: '' },
    { size: '42', color: 'Triple Black', color_hex: '#000000', stock_quantity: 10, sku: '' },
    { size: '43', color: 'Triple Black', color_hex: '#000000', stock_quantity: 8, sku: '' },
  ]);

  useEffect(() => {
    Promise.all([api.get('/categories'), api.get('/brands')]).then(([cRes, bRes]) => {
      if (cRes.data?.categories) setCategories(cRes.data.categories);
      if (bRes.data?.brands) setBrands(bRes.data.brands);
    });

    if (isEdit && id) {
      api.get(`/products/${id}`).then((res) => {
        if (res.data?.product) {
          const p = res.data.product;
          setName(p.name);
          setSku(p.sku || '');
          setBrandId(p.brand_id || '');
          setCategoryId(p.category_id || '');
          setGender(p.gender || 'Unisex');
          setRegularPrice(p.regular_price);
          setSalePrice(p.sale_price);
          setShortDesc(p.short_description || '');
          setDescription(p.description || '');
          setIsFeatured(Boolean(p.is_featured));
          setIsTrending(Boolean(p.is_trending));
          setIsNewArrival(Boolean(p.is_new_arrival));
          setIsActive(Boolean(p.is_active));

          if (p.images && p.images.length > 0) {
            setImages(p.images.map((img: ProductImage) => ({
              image_url: img.image_url,
              is_primary: Boolean(img.is_primary),
            })));
          }

          if (p.variants && p.variants.length > 0) {
            setVariants(p.variants);
          }
        }
      }).catch((err) => {
        showToast('Error', 'Failed to load product details', 'error');
      }).finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  // Image actions
  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    setImages((prev) => [
      ...prev,
      { image_url: newImageUrl.trim(), is_primary: prev.length === 0 },
    ]);
    setNewImageUrl('');
  };

  const handleSetPrimaryImage = (index: number) => {
    setImages((prev) =>
      prev.map((img, i) => ({ ...img, is_primary: i === index }))
    );
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Image File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);

    try {
      showToast('Uploading...', 'Uploading shoe image to server', 'info');
      const res = await api.post('/admin/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.url) {
        setImages((prev) => [
          ...prev,
          { image_url: res.data.url, is_primary: prev.length === 0 },
        ]);
        showToast('Uploaded', 'Shoe image attached successfully!', 'success');
      }
    } catch (err: any) {
      showToast('Upload Failed', err.response?.data?.error || 'Failed to upload image', 'error');
    }
  };

  // Variant actions
  const handleAddVariantRow = () => {
    setVariants((prev) => [
      ...prev,
      {
        size: '42',
        color: 'Classic',
        color_hex: '#000000',
        stock_quantity: 5,
        sku: '',
      },
    ]);
  };

  const handleAddPresetSizes = (colorName: string, colorHex: string) => {
    const defaultSizes = ['40', '41', '42', '43', '44'];
    const newRows = defaultSizes.map((sz) => ({
      size: sz,
      color: colorName || 'Standard',
      color_hex: colorHex || '#000000',
      stock_quantity: 8,
      sku: '',
    }));
    setVariants((prev) => [...prev, ...newRows]);
    showToast('Preset Added', `Added sizes 40-44 for ${colorName || 'Standard'}`, 'info');
  };

  const handleUpdateVariant = (index: number, field: keyof ProductVariant, value: any) => {
    setVariants((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemoveVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  // Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast('Required', 'Please enter shoe title.', 'error');
      return;
    }

    if (salePrice <= 0) {
      showToast('Required', 'Please enter a valid sale price.', 'error');
      return;
    }

    if (variants.length === 0) {
      showToast('Required', 'Please add at least one size/color variant with inventory stock.', 'error');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: name.trim(),
        sku: sku.trim() || null,
        brand_id: brandId || null,
        category_id: categoryId || null,
        gender,
        regular_price: Number(regularPrice) || Number(salePrice),
        sale_price: Number(salePrice),
        short_description: shortDesc.trim() || null,
        description: description.trim() || name.trim(),
        is_featured: isFeatured ? 1 : 0,
        is_trending: isTrending ? 1 : 0,
        is_new_arrival: isNewArrival ? 1 : 0,
        is_active: isActive ? 1 : 0,
        images: images.length > 0 ? images : [{ image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600', is_primary: 1 }],
        variants,
      };

      if (isEdit && id) {
        await api.put(`/products/${id}`, payload);
        showToast('Updated', 'Shoe details & inventory updated successfully!', 'success');
      } else {
        await api.post('/products', payload);
        showToast('Created', 'New shoe added to store catalog successfully!', 'success');
      }

      navigate('/admin/products');
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to save product';
      showToast('Error', msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-zinc-400">
        Loading product data...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-white uppercase tracking-tight">
              {isEdit ? 'Edit Shoe & Variants' : 'Add New Shoe to Store'}
            </h1>
            <p className="text-xs text-zinc-400">
              {isEdit ? `Updating product #${id}` : 'Fill in footwear details, photography, and variant stock.'}
            </p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="px-6 py-2.5 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold uppercase tracking-wider shadow-glow-orange transition-all"
        >
          {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Shoe'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Basic Information */}
        <div className="p-6 rounded-3xl bg-[#141414] border border-zinc-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider text-brand-orange">
            1. Basic Footwear Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-zinc-400 block mb-1">
                Shoe Name / Model <span className="text-brand-orange">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Nike Air Jordan 1 Retro High"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-orange"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-400 block mb-1">
                Master SKU / Model Code
              </label>
              <input
                type="text"
                placeholder="e.g. DZ5485-612"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white uppercase focus:outline-none focus:border-brand-orange"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-zinc-400 block mb-1">Brand</label>
              <select
                value={brandId}
                onChange={(e) => setBrandId(e.target.value ? Number(e.target.value) : '')}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-brand-orange cursor-pointer"
              >
                <option value="">Select Brand</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-400 block mb-1">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : '')}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-brand-orange cursor-pointer"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-400 block mb-1">Gender / Division</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-brand-orange cursor-pointer"
              >
                <option value="Unisex">Unisex</option>
                <option value="Men">Men</option>
                <option value="Women">Women</option>
                <option value="Kids">Kids</option>
              </select>
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-zinc-400 block mb-1">
                Regular Price (৳ BDT)
              </label>
              <input
                type="number"
                min="0"
                value={regularPrice}
                onChange={(e) => setRegularPrice(Number(e.target.value))}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-orange"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-400 block mb-1">
                Sale Price (৳ BDT) <span className="text-brand-orange">*</span>
              </label>
              <input
                type="number"
                min="0"
                required
                value={salePrice}
                onChange={(e) => setSalePrice(Number(e.target.value))}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-orange"
              />
            </div>
          </div>

          {/* Descriptions */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 block mb-1">Short Tagline</label>
            <input
              type="text"
              placeholder="e.g. 30% lighter BOOST material with Primeknit+ upper"
              value={shortDesc}
              onChange={(e) => setShortDesc(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-brand-orange"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-400 block mb-1">Full Description</label>
            <textarea
              rows={4}
              placeholder="Detailed description of leather quality, breathability, cushioning tech, and Bangladesh sizing advice..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-brand-orange"
            />
          </div>

          {/* Feature Badges Checkboxes */}
          <div className="pt-2 flex flex-wrap gap-6 text-xs text-zinc-300 font-semibold">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="accent-brand-orange"
              />
              <span>Active in Store</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="accent-brand-orange"
              />
              <span>Featured on Homepage</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isTrending}
                onChange={(e) => setIsTrending(e.target.checked)}
                className="accent-brand-orange"
              />
              <span>Trending Drop</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isNewArrival}
                onChange={(e) => setIsNewArrival(e.target.checked)}
                className="accent-brand-orange"
              />
              <span>New Arrival Tag</span>
            </label>
          </div>
        </div>

        {/* Section 2: Multi-Angle Imagery */}
        <div className="p-6 rounded-3xl bg-[#141414] border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-brand-orange">
              2. Shoe Image Gallery
            </h3>
            <span className="text-xs text-zinc-400">{images.length} photos attached</span>
          </div>

          {/* Add Image by URL or Upload File */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex gap-2">
              <input
                type="url"
                placeholder="Paste shoe image URL (e.g. Unsplash or CDN URL)..."
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-brand-orange"
              />
              <button
                type="button"
                onClick={handleAddImage}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold"
              >
                + Add URL
              </button>
            </div>

            {/* Local File Upload Button */}
            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs font-semibold text-zinc-300 hover:text-white">
              <Upload className="w-4 h-4 text-brand-orange" />
              <span>Upload Local Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Thumbnails preview & Primary selector */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className={`relative aspect-square rounded-2xl bg-zinc-950 overflow-hidden border-2 transition-all ${
                    img.is_primary ? 'border-brand-orange shadow-glow-orange' : 'border-zinc-800'
                  }`}
                >
                  <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                  <div className="absolute top-1.5 right-1.5 flex gap-1">
                    <button
                      type="button"
                      onClick={() => handleSetPrimaryImage(idx)}
                      className={`p-1 rounded-md text-[10px] font-bold ${
                        img.is_primary ? 'bg-brand-orange text-white' : 'bg-black/60 text-zinc-300 hover:text-white'
                      }`}
                      title="Set as Main Photo"
                    >
                      <Star className="w-3 h-3 fill-current" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="p-1 rounded-md bg-black/60 text-zinc-400 hover:text-red-400"
                      title="Remove"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 3: Variants Matrix (Size, Color, Stock Quantity) */}
        <div className="p-6 rounded-3xl bg-[#141414] border border-zinc-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider text-brand-orange">
                3. Size & Color Inventory Tracking
              </h3>
              <p className="text-[11px] text-zinc-400">
                Track exact stock for each shoe size and color combination to prevent overselling.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleAddPresetSizes('Classic Black', '#000000')}
                className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] font-semibold text-zinc-300 hover:text-white"
              >
                + Preset Sizes 40-44
              </button>
              <button
                type="button"
                onClick={handleAddVariantRow}
                className="px-3 py-1.5 rounded-lg bg-brand-orange text-white text-[11px] font-bold shadow-glow-orange"
              >
                + Add Variant Row
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-zinc-900 text-zinc-400 uppercase font-bold text-[10px] tracking-wider border-b border-zinc-800">
                  <tr>
                    <th className="px-3 py-2.5">Size (BD/EU)</th>
                    <th className="px-3 py-2.5">Colorway</th>
                    <th className="px-3 py-2.5">Color Hex</th>
                    <th className="px-3 py-2.5">Inventory Stock</th>
                    <th className="px-3 py-2.5">Variant SKU</th>
                    <th className="px-3 py-2.5 text-right">Remove</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                  {variants.map((v, idx) => (
                    <tr key={idx} className="hover:bg-zinc-800/20">
                      {/* Size */}
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          required
                          value={v.size}
                          onChange={(e) => handleUpdateVariant(idx, 'size', e.target.value)}
                          placeholder="e.g. 42"
                          className="w-16 bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs text-white font-bold"
                        />
                      </td>

                      {/* Color */}
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          required
                          value={v.color}
                          onChange={(e) => handleUpdateVariant(idx, 'color', e.target.value)}
                          placeholder="e.g. Royal Blue"
                          className="w-36 bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs text-white"
                        />
                      </td>

                      {/* Hex Color */}
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={v.color_hex || '#000000'}
                            onChange={(e) => handleUpdateVariant(idx, 'color_hex', e.target.value)}
                            className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                          />
                          <span className="text-[10px] text-zinc-500 font-mono">{v.color_hex || '#000000'}</span>
                        </div>
                      </td>

                      {/* Stock Quantity */}
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min="0"
                          required
                          value={v.stock_quantity}
                          onChange={(e) => handleUpdateVariant(idx, 'stock_quantity', Number(e.target.value))}
                          className="w-20 bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs text-white font-bold"
                        />
                      </td>

                      {/* Variant SKU */}
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={v.sku || ''}
                          onChange={(e) => handleUpdateVariant(idx, 'sku', e.target.value.toUpperCase())}
                          placeholder="Auto-generated if empty"
                          className="w-32 bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs text-white uppercase"
                        />
                      </td>

                      {/* Remove Row */}
                      <td className="px-3 py-2 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(idx)}
                          className="p-1.5 text-zinc-500 hover:text-red-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Bottom Submit */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link
            to="/admin/products"
            className="px-6 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-400 hover:text-white"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-black uppercase tracking-wider shadow-glow-orange transition-all"
          >
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Publish Shoe to Store'}
          </button>
        </div>
      </form>
    </div>
  );
};
