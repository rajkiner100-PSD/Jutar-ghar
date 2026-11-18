import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Plus, Trash2, Edit, X } from 'lucide-react';
import { Banner } from '../../types';
import { useToast } from '../../context/ToastContext';
import { fallbackBanners } from '../../data/mockData';
import api from '../../services/api';

export const AdminBannersPage: React.FC = () => {
  const { showToast } = useToast();
  const [banners, setBanners] = useState<Banner[]>(fallbackBanners);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [badge, setBadge] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('/shop');
  const [buttonText, setButtonText] = useState('Shop Now');
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await api.get('/banners?all=true');
      if (res.data?.banners) {
        setBanners(res.data.banners);
      }
    } catch (err: any) {
      showToast('Error', 'Failed to fetch banners', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const openAddModal = () => {
    setEditingBanner(null);
    setTitle('');
    setSubtitle('');
    setBadge('LIMITED EDITION');
    setImageUrl('');
    setLinkUrl('/shop');
    setButtonText('Explore Kicks');
    setDisplayOrder(banners.length + 1);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (b: Banner) => {
    setEditingBanner(b);
    setTitle(b.title);
    setSubtitle(b.subtitle || '');
    setBadge(b.badge || '');
    setImageUrl(b.image_url);
    setLinkUrl(b.link_url || '/shop');
    setButtonText(b.button_text || 'Shop Now');
    setDisplayOrder(b.display_order || 0);
    setIsActive(Boolean(b.is_active));
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim()) return;

    try {
      setSaving(true);
      const payload = {
        title: title.trim(),
        subtitle: subtitle.trim() || null,
        badge: badge.trim() || null,
        image_url: imageUrl.trim(),
        link_url: linkUrl.trim() || '/shop',
        button_text: buttonText.trim() || 'Shop Now',
        display_order: Number(displayOrder),
        is_active: isActive ? 1 : 0,
      };

      if (editingBanner) {
        await api.put(`/banners/${editingBanner.id}`, payload);
        showToast('Updated', `Banner "${title}" updated`, 'success');
      } else {
        await api.post('/banners', payload);
        showToast('Created', `Banner "${title}" published`, 'success');
      }

      setIsModalOpen(false);
      fetchBanners();
    } catch (err: any) {
      showToast('Error', err.response?.data?.error || 'Failed to save banner', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (b: Banner) => {
    if (!window.confirm(`Delete hero banner "${b.title}"?`)) return;
    try {
      await api.delete(`/banners/${b.id}`);
      showToast('Deleted', 'Banner deleted successfully', 'success');
      fetchBanners();
    } catch (err: any) {
      showToast('Error', err.response?.data?.error || 'Failed to delete banner', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">
            Hero Banners & Highlights
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Manage top hero sliders and campaign announcements on the storefront.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold uppercase tracking-wider shadow-glow-orange transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Banner</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map((ban) => (
          <div
            key={ban.id}
            className="rounded-3xl bg-[#141414] border border-zinc-800 overflow-hidden shadow-xl flex flex-col justify-between"
          >
            <div className="relative aspect-video bg-zinc-950 overflow-hidden">
              <img src={ban.image_url} alt="" className="w-full h-full object-cover" />
              {ban.badge && (
                <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-brand-orange text-white text-[10px] font-black uppercase">
                  {ban.badge}
                </span>
              )}
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h3 className="text-sm font-black text-white uppercase line-clamp-1">{ban.title}</h3>
                <p className="text-xs text-zinc-400 line-clamp-2 mt-1">{ban.subtitle || 'No subtitle'}</p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-zinc-800 text-xs">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${ban.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-500'}`}>
                  {ban.is_active ? 'Active' : 'Draft'}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(ban)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(ban)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-zinc-800"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <form onSubmit={handleSave} className="bg-[#181818] border border-zinc-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white uppercase tracking-wider">
                {editingBanner ? 'Edit Banner' : 'New Hero Banner'}
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
              <label className="text-xs font-semibold text-zinc-400 block mb-1">Banner Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. ICONIC SNEAKER DROP"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-brand-orange"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-400 block mb-1">Subtitle</label>
              <input
                type="text"
                placeholder="Short campaign description..."
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-brand-orange"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">Badge Callout</label>
                <input
                  type="text"
                  placeholder="e.g. NEW RELEASE"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-orange"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">Button Text</label>
                <input
                  type="text"
                  placeholder="e.g. Shop Now"
                  value={buttonText}
                  onChange={(e) => setButtonText(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-orange"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-400 block mb-1">Image URL *</label>
              <input
                type="url"
                required
                placeholder="https://images.unsplash.com/..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-brand-orange"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">Target Link</label>
                <input
                  type="text"
                  placeholder="/shop?category=sneakers"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-orange"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">Display Order</label>
                <input
                  type="number"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-orange"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 text-xs text-zinc-300 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="accent-brand-orange"
                />
                <span>Active Banner</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
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
                {saving ? 'Saving...' : 'Save Banner'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
