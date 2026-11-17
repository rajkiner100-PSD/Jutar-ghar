import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, Edit, X } from 'lucide-react';
import { Brand } from '../../types';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

export const AdminBrandsPage: React.FC = () => {
  const { showToast } = useToast();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [name, setName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const res = await api.get('/brands');
      if (res.data?.brands) {
        setBrands(res.data.brands);
      }
    } catch (err: any) {
      showToast('Error', 'Failed to fetch brands', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const openAddModal = () => {
    setEditingBrand(null);
    setName('');
    setLogoUrl('');
    setDescription('');
    setIsModalOpen(true);
  };

  const openEditModal = (b: Brand) => {
    setEditingBrand(b);
    setName(b.name);
    setLogoUrl(b.logo_url || '');
    setDescription(b.description || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setSaving(true);
      const payload = {
        name: name.trim(),
        logo_url: logoUrl.trim() || null,
        description: description.trim() || null,
      };

      if (editingBrand) {
        await api.put(`/brands/${editingBrand.id}`, payload);
        showToast('Updated', `Brand "${name}" updated`, 'success');
      } else {
        await api.post('/brands', payload);
        showToast('Created', `Brand "${name}" added`, 'success');
      }

      setIsModalOpen(false);
      fetchBrands();
    } catch (err: any) {
      showToast('Error', err.response?.data?.error || 'Failed to save brand', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (b: Brand) => {
    if (!window.confirm(`Are you sure you want to delete brand "${b.name}"?`)) return;
    try {
      await api.delete(`/brands/${b.id}`);
      showToast('Deleted', `Brand "${b.name}" deleted`, 'success');
      fetchBrands();
    } catch (err: any) {
      showToast('Error', err.response?.data?.error || 'Failed to delete brand', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">
            Footwear Brands
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Manage global and local brands (Nike, Adidas, Jordan, Apex, Bata, Lotto).
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold uppercase tracking-wider shadow-glow-orange transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Brand</span>
        </button>
      </div>

      <div className="rounded-2xl bg-[#141414] border border-zinc-800/80 overflow-hidden shadow-xl">
        <table className="w-full text-xs text-left">
          <thead className="bg-zinc-900 text-zinc-400 uppercase font-bold text-[10px] tracking-wider border-b border-zinc-800">
            <tr>
              <th className="px-4 py-3.5">Brand</th>
              <th className="px-4 py-3.5">Slug</th>
              <th className="px-4 py-3.5">Description</th>
              <th className="px-4 py-3.5">Shoes in Store</th>
              <th className="px-4 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
            {brands.map((b) => (
              <tr key={b.id} className="hover:bg-zinc-800/30">
                <td className="px-4 py-3.5 font-bold text-white flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center p-1 overflow-hidden shrink-0">
                    {b.logo_url ? (
                      <img src={b.logo_url} alt="" className="max-h-full max-w-full object-contain filter invert" />
                    ) : (
                      <Tag className="w-4 h-4 text-brand-orange" />
                    )}
                  </div>
                  <span>{b.name}</span>
                </td>
                <td className="px-4 py-3.5 font-mono text-zinc-400 text-[11px]">{b.slug}</td>
                <td className="px-4 py-3.5 text-zinc-400 max-w-xs truncate">{b.description || '—'}</td>
                <td className="px-4 py-3.5">
                  <span className="px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 font-bold text-[10px] text-zinc-300">
                    {b.product_count || 0} models
                  </span>
                </td>
                <td className="px-4 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => openEditModal(b)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(b)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-zinc-800"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <form onSubmit={handleSave} className="bg-[#181818] border border-zinc-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white uppercase tracking-wider">
                {editingBrand ? 'Edit Brand' : 'Add New Brand'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-400 block mb-1">Brand Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Puma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-brand-orange"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-400 block mb-1">Brand Logo URL</label>
              <input
                type="url"
                placeholder="https://..."
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-brand-orange"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-400 block mb-1">Description / Slogan</label>
              <textarea
                rows={2}
                placeholder="Brand heritage or tagline..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-brand-orange"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold uppercase shadow-glow-orange"
              >
                {saving ? 'Saving...' : 'Save Brand'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
