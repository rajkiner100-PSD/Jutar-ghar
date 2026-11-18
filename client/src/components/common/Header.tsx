import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  Search,
  User as UserIcon,
  Menu,
  X,
  Compass,
  Package,
  ShieldCheck,
  ChevronDown,
  LogOut,
  Sliders,
  Sparkles
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { totalItems, setIsCartOpen } = useCart();
  const { wishlist } = useWishlist();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { label: 'All Shoes', path: '/shop' },
    { label: 'Sneakers', path: '/shop?category=sneakers' },
    { label: 'Sports', path: '/shop?category=sports-shoes' },
    { label: 'Formal', path: '/shop?category=formal-shoes' },
    { label: 'Casual', path: '/shop?category=casual-shoes' },
    { label: 'Sandals', path: '/shop?category=sandals-slides' },
    { label: 'Men', path: '/shop?gender=Men' },
    { label: 'Women', path: '/shop?gender=Women' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0B0B0B]/95 backdrop-blur-md border-b border-zinc-800/80">
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-zinc-950 via-brand-dark to-zinc-950 py-1.5 px-4 border-b border-zinc-800/40 text-[11px] font-medium text-zinc-300 flex items-center justify-between">
        <div className="hidden sm:flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-brand-orange">
            <Sparkles className="w-3.5 h-3.5" />
            Original Footwear in Bangladesh
          </span>
          <span className="text-zinc-600">|</span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Cash on Delivery Available Nationwide
          </span>
        </div>
        <div className="mx-auto sm:mx-0 flex items-center gap-3 sm:gap-4">
          <Link
            to="/track"
            className="flex items-center gap-1.5 text-zinc-300 hover:text-brand-orange transition-colors"
          >
            <Package className="w-3.5 h-3.5 text-brand-orange" />
            <span>Track Order</span>
          </Link>
          <span className="text-zinc-600">|</span>
          <span className="text-zinc-400">Dhaka: ৳80 | Outside: ৳150</span>
          <span className="text-zinc-600">|</span>
          <Link
            to="/admin/login"
            className="flex items-center gap-1.5 text-brand-orange hover:text-white font-bold transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Portal</span>
          </Link>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-zinc-400 hover:text-white focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-orange to-brand-orange-hover flex items-center justify-center shadow-glow-orange group-hover:scale-105 transition-transform duration-300">
              <span className="text-black font-black text-xl tracking-tighter">JG</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-1">
                JUTAR <span className="text-brand-orange">GHOR</span>
              </span>
              <span className="text-[10px] tracking-widest text-zinc-400 uppercase font-semibold -mt-1">
                জুতার ঘর • Dhaka
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-sm font-medium text-zinc-300 hover:text-brand-orange transition-colors py-2 relative group"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-orange transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* Search, Wishlist, Cart & Profile Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Search Input (Desktop) */}
            <form onSubmit={handleSearchSubmit} className="hidden md:flex relative items-center">
              <input
                type="text"
                placeholder="Search sneakers, formals, brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-56 lg:w-64 bg-zinc-900/90 border border-zinc-800 text-xs text-white placeholder-zinc-500 rounded-full pl-9 pr-4 py-2 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-all"
              />
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 pointer-events-none" />
            </form>

            {/* Search Toggle (Mobile) */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="md:hidden p-2 text-zinc-300 hover:text-brand-orange transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist Link */}
            <Link
              to="/wishlist"
              className="p-2 text-zinc-300 hover:text-brand-orange transition-colors relative"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-brand-orange text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart Drawer Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 p-2 sm:px-3 sm:py-2 rounded-full bg-zinc-900 border border-zinc-800 hover:border-brand-orange text-zinc-200 hover:text-white transition-all group"
              aria-label="Shopping Cart"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 group-hover:text-brand-orange transition-colors" />
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-brand-orange text-white text-[10px] font-bold flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline text-xs font-semibold">Cart</span>
            </button>

            {/* User Dropdown */}
            <div className="relative">
              {isAuthenticated ? (
                <div>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-200 text-xs font-medium"
                  >
                    <div className="w-6 h-6 rounded-full bg-brand-orange/20 text-brand-orange flex items-center justify-center font-bold">
                      {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="hidden md:inline max-w-[100px] truncate">{user?.full_name}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                  </button>

                  {userDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-52 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl py-2 z-50 animate-slide-up"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-zinc-800">
                        <p className="text-xs text-zinc-400">Signed in as</p>
                        <p className="text-xs font-bold text-white truncate">{user?.email}</p>
                        {isAdmin && (
                          <span className="inline-block mt-1 px-2 py-0.5 rounded bg-brand-orange/20 text-brand-orange text-[10px] font-bold">
                            ADMINISTRATOR
                          </span>
                        )}
                      </div>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-2 px-4 py-2.5 text-xs text-brand-orange font-semibold hover:bg-zinc-800/80"
                        >
                          <Sliders className="w-4 h-4" />
                          Admin Dashboard
                        </Link>
                      )}

                      <Link
                        to="/my-orders"
                        className="flex items-center gap-2 px-4 py-2.5 text-xs text-zinc-200 hover:bg-zinc-800/80 hover:text-white"
                      >
                        <Package className="w-4 h-4 text-zinc-400" />
                        My Orders
                      </Link>

                      <Link
                        to="/track"
                        className="flex items-center gap-2 px-4 py-2.5 text-xs text-zinc-200 hover:bg-zinc-800/80 hover:text-white"
                      >
                        <Compass className="w-4 h-4 text-zinc-400" />
                        Track Order
                      </Link>

                      <button
                        onClick={logout}
                        className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-xs text-red-400 hover:bg-zinc-800/80 hover:text-red-300 border-t border-zinc-800 mt-1"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-semibold shadow-glow-orange transition-all"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>Login</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Input Drawer */}
        {searchOpen && (
          <div className="md:hidden pb-4">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search kicks, formal, slides..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full bg-zinc-900 border border-brand-orange text-xs text-white placeholder-zinc-500 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none"
              />
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3 pointer-events-none" />
            </form>
          </div>
        )}
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-zinc-950 border-b border-zinc-800 px-6 py-6 space-y-4 animate-slide-up">
          <div className="grid grid-cols-2 gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-lg bg-zinc-900 text-sm font-medium text-zinc-200 hover:bg-zinc-800 hover:text-brand-orange transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="pt-4 border-t border-zinc-800 flex flex-col gap-2">
            <Link
              to="/track"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 text-sm text-zinc-300 py-1"
            >
              <Package className="w-4 h-4 text-brand-orange" />
              Track Shipment Status
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-sm text-brand-orange font-semibold py-1"
              >
                <Sliders className="w-4 h-4" />
                Go to Admin Portal
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
