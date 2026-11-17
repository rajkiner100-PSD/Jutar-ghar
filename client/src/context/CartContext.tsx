import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, ProductVariant, CartItem, Coupon } from '../types';
import { useToast } from './ToastContext';
import api from '../services/api';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, variant: ProductVariant, quantity?: number) => boolean;
  removeFromCart: (variantId: number) => void;
  updateQuantity: (variantId: number, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  subtotal: number;
  totalItems: number;
  coupon: Coupon | null;
  couponDiscount: number;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  district: string;
  setDistrict: (district: string) => void;
  deliveryFee: number;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useToast();
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('jutar_ghor_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [coupon, setCoupon] = useState<Coupon | null>(() => {
    try {
      const saved = localStorage.getItem('jutar_ghor_coupon');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [couponDiscount, setCouponDiscount] = useState<number>(() => {
    const saved = localStorage.getItem('jutar_ghor_coupon_discount');
    return saved ? Number(saved) : 0;
  });

  const [district, setDistrict] = useState<string>('Dhaka');

  // Persist cart
  useEffect(() => {
    localStorage.setItem('jutar_ghor_cart', JSON.stringify(cart));
  }, [cart]);

  // Persist coupon
  useEffect(() => {
    if (coupon) {
      localStorage.setItem('jutar_ghor_coupon', JSON.stringify(coupon));
      localStorage.setItem('jutar_ghor_coupon_discount', String(couponDiscount));
    } else {
      localStorage.removeItem('jutar_ghor_coupon');
      localStorage.removeItem('jutar_ghor_coupon_discount');
    }
  }, [coupon, couponDiscount]);

  const subtotal = cart.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Delivery Fee logic (Dhaka = ৳80, Outside = ৳150, Free over ৳4,000)
  const isDhaka = district.trim().toLowerCase().includes('dhaka');
  let deliveryFee = isDhaka ? 80 : 150;
  if (subtotal >= 4000 || subtotal === 0) {
    deliveryFee = 0;
  }

  const total = Math.max(0, subtotal + (subtotal > 0 ? deliveryFee : 0) - couponDiscount);

  const addToCart = (product: Product, variant: ProductVariant, quantity: number = 1): boolean => {
    if (!variant || variant.stock_quantity <= 0) {
      showToast('Out of Stock', 'The selected shoe size/color is out of stock.', 'error');
      return false;
    }

    const existingIndex = cart.findIndex((item) => item.variant.id === variant.id);
    const unitPrice = product.sale_price + (variant.additional_price || 0);

    if (existingIndex > -1) {
      const currentQty = cart[existingIndex].quantity;
      const newQty = currentQty + quantity;

      if (newQty > variant.stock_quantity) {
        showToast(
          'Maximum Stock Reached',
          `Only ${variant.stock_quantity} pairs available in stock for Size ${variant.size}.`,
          'warning'
        );
        return false;
      }

      const updated = [...cart];
      updated[existingIndex].quantity = newQty;
      setCart(updated);
    } else {
      if (quantity > variant.stock_quantity) {
        showToast(
          'Insufficient Stock',
          `Only ${variant.stock_quantity} pairs available in stock for Size ${variant.size}.`,
          'warning'
        );
        return false;
      }

      setCart((prev) => [
        ...prev,
        {
          product,
          variant,
          quantity,
          selected_size: variant.size,
          selected_color: variant.color,
          unit_price: unitPrice,
        },
      ]);
    }

    showToast(
      'Added to Cart',
      `${product.name} (Size: ${variant.size}, ${variant.color}) added to your bag.`,
      'success'
    );
    setIsCartOpen(true);
    return true;
  };

  const removeFromCart = (variantId: number) => {
    setCart((prev) => prev.filter((item) => item.variant.id !== variantId));
    showToast('Item Removed', 'The shoe was removed from your bag.', 'info');
  };

  const updateQuantity = (variantId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(variantId);
      return;
    }

    setCart((prev) =>
      prev.map((item) => {
        if (item.variant.id === variantId) {
          if (quantity > item.variant.stock_quantity) {
            showToast(
              'Stock Limit',
              `Only ${item.variant.stock_quantity} units available.`,
              'warning'
            );
            return { ...item, quantity: item.variant.stock_quantity };
          }
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    setCoupon(null);
    setCouponDiscount(0);
  };

  const applyCoupon = async (code: string): Promise<{ success: boolean; message: string }> => {
    if (!code.trim()) {
      return { success: false, message: 'Please enter a coupon code.' };
    }

    try {
      const res = await api.post('/coupons/validate', {
        code: code.trim(),
        subtotal,
      });

      if (res.data.valid) {
        setCoupon({
          id: 0,
          code: res.data.code,
          discount_type: res.data.discount_type,
          discount_value: res.data.discount_value,
          is_active: 1,
        });
        setCouponDiscount(res.data.calculated_discount);
        showToast('Coupon Applied!', res.data.message, 'success');
        return { success: true, message: res.data.message };
      }
      return { success: false, message: 'Failed to apply coupon.' };
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Invalid or expired coupon code.';
      showToast('Coupon Error', msg, 'error');
      return { success: false, message: msg };
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    setCouponDiscount(0);
    showToast('Coupon Removed', 'Coupon discount has been removed.', 'info');
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        subtotal,
        totalItems,
        coupon,
        couponDiscount,
        applyCoupon,
        removeCoupon,
        district,
        setDistrict,
        deliveryFee,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
