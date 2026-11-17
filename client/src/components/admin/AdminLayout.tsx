import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Layers,
  Tag,
  Ticket,
  Image as ImageIcon,
  Users,
  Truck,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ShieldCheck,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLayout: React.FC = () => {
  const { user, isAdmin, logout, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // If auth is loaded and user is not admin, redirect
  if (!loading && !isAdmin) {
    navigate('/admin/login');
    return null;
  }

  const navItems = [
    { label: 'Overview Dashboard', path: '/admin', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Products & Inventory', path: '/admin/products', icon: <Package className="w-4 h-4" /> },
    { label: 'Customer Orders', path: '/admin/orders', icon: <ShoppingBag className="w-4 h-4" /> },
    { label: 'Shoe Categories', path: '/admin/categories', icon: <Layers className="w-4 h-4" /> },
    { label: 'Footwear Brands', path: '/admin/brands', icon: <Tag className="w-4 h-4" /> },
    { label: 'Coupons & Discounts', path: '/admin/coupons', icon: <Ticket className="w-4 h-4" /> },
    { label: 'Hero Banners', path: '/admin/banners', icon: <ImageIcon className="w-4 h-4" /> },
    { label: 'Customers', path: '/admin/customers', icon: <Users className="w-4 h-4" /> },
    { label: 'Delivery Settings', path: '/admin/settings', icon: <Truck className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-zinc-100 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Admin Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#121212] border-r border-zinc-800/80 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Logo & Brand */}
          <div className="h-20 px-6 border-b border-zinc-800/80 flex items-center justify-between">
            <Link to="/admin" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-orange flex items-center justify-center font-black text-black shadow-glow-orange">
                JG
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black text-white tracking-wide flex items-center gap-1">
                  ADMIN <span className="text-brand-orange">PORTAL</span>
                </span>
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                  Jutar Ghor BD
                </span>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path ||
                (item.path !== '/admin' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-brand-orange text-white shadow-glow-orange'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer with Store Link & Logout */}
        <div className="p-4 border-t border-zinc-800/80 space-y-2">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-brand-orange hover:border-brand-orange/40 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Flame className="w-3.5 h-3.5 text-brand-orange" />
              Live Storefront
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
          </Link>

          <div className="pt-2 flex items-center justify-between px-2">
            <div className="flex flex-col min-w-0 pr-2">
              <span className="text-xs font-bold text-white truncate">{user?.full_name}</span>
              <span className="text-[10px] text-brand-orange font-bold uppercase">Store Manager</span>
            </div>
            <button
              onClick={() => {
                logout();
                navigate('/admin/login');
              }}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-zinc-900 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Navbar */}
        <header className="h-16 bg-[#121212]/90 backdrop-blur-md border-b border-zinc-800/80 px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="font-medium">Jutar Ghor Store Database (Connected)</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/products/new"
              className="px-3.5 py-1.5 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold shadow-glow-orange transition-all"
            >
              + Add Shoe
            </Link>
          </div>
        </header>

        {/* Dynamic Nested Route Content */}
        <main className="p-6 md:p-8 flex-1 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
