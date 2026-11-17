import React, { useState, useEffect } from 'react';
import { Layers, Plus, Trash2, Edit, Check, X } from 'lucide-react';
import { Category } from '../../types';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

export const AdminCategoriesPage: React.FC = () => {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/categories');
      if (res.data?.categories) {
        setCategories(res.data.categories);
      }
    } catch (err: any) {
      showToast('Error', 'Failed to fetch categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setEditingCat(null);
    setName('');
    setDescription('');
    setImageUrl('');
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCat(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setImageUrl(cat.image_url || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setSaving(true);
      const payload = {
        name: name.trim(),
        description: description.trim() || null,
        image_url: imageUrl.trim() || null,
      };

      if (editingCat) {
        await api.put(`/categories/${editingCat.id}`, payload);
        showToast('Updated', `Category "${name}" updated`, 'success');
      } else {
        await api.post('/categories', payload);
        showToast('Created', `Category "${name}" created`, 'success');
      }

      setIsModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      showToast('Error', err.response?.data?.error || 'Failed to save category', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat: Category) => {
    if (!window.confirm(`Are you sure you want to delete category "${cat.name}"?`)) return;
    try {
      await api.delete(`/categories/${cat.id}`);
      showToast('Deleted', `Category "${cat.name}" deleted`, 'success');
      fetchCategories();
    } catch (err: any) {
      showToast('Error', err.response?.data?.error || 'Failed to delete category', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">
            Footwear Categories
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Manage category classifications like Sneakers, Sports, Formals, and Sandals.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold uppercase tracking-wider shadow-glow-orange transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      <div className="rounded-2xl bg-[#141414] border border-zinc-800/80 overflow-hidden shadow-xl">
        <table className="w-full text-xs text-left">
          <thead className="bg-zinc-900 text-zinc-400 uppercase font-bold text-[10px] tracking-wider border-b border-zinc-800">
            <tr>
              <th className="px-4 py-3.5">Category</th>
              <th className="px-4 py-3.5">Slug</th>
              <th className="px-4 py-3.5">Description</th>
              <th className="px-4 py-3.5">Shoes in Stock</th>
              <th className="px-4 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
            {categories.map((c) => (
              <tr key={c.id} className="hover:bg-zinc-800/30">
                <td className="px-4 py-3.5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-950 overflow-hidden shrink-0 border border-zinc-800">
                    <img src={c.image_url || ''} alt="" className="w-full h-full object-cover" />
                  </div>
                  <span className="font-bold text-white">{c.name}</span>
                </td>
                <td className="px-4 py-3.5 text-zinc-400 font-mono text-[11px]">{c.slug}</td>
                <td className="px-4 py-3.5 text-zinc-400 max-w-xs truncate">{c.description || '—'}</td>
                <td className="px-4 py-3.5">
                  <span className="px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 font-bold text-[10px] text-zinc-300">
                    {c.product_count || 0} models
                  </span>
                </td>
                <td className="px-4 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => openEditModal(c)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(c)}
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <form onSubmit={handleSave} className="bg-[#181818] border border-zinc-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white uppercase tracking-wider">
                {editingCat ? 'Edit Category' : 'Add New Category'}
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
              <label className="text-xs font-semibold text-zinc-400 block mb-1">Category Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Lifestyle Loafers"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-brand-orange"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-400 block mb-1">Image URL</label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-brand-orange"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-400 block mb-1">Description</label>
              <textarea
                rows={2}
                placeholder="Short category summary..."
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
                {saving ? 'Saving...' : 'Save Category'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
