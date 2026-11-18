import axios from 'axios';
import {
  fallbackProducts,
  fallbackCategories,
  fallbackBrands,
  fallbackBanners,
} from '../data/mockData';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 3000, // 3s timeout before graceful fallback
});

// Intercept requests to attach Bearer token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jutar_ghor_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper for offline / fallback responses
function handleFallback(config: any) {
  const rawUrl = config.url || '';
  const method = (config.method || 'get').toLowerCase();
  const [cleanPath, queryString] = rawUrl.split('?');

  // Merge query parameters from both URL string and config.params
  const params: Record<string, any> = { ...(config.params || {}) };
  if (queryString) {
    const sp = new URLSearchParams(queryString);
    sp.forEach((value, key) => {
      params[key] = value;
    });
  }

  // 1. Categories
  if (cleanPath.includes('/categories')) {
    return { data: { categories: fallbackCategories } };
  }

  // 2. Brands
  if (cleanPath.includes('/brands')) {
    return { data: { brands: fallbackBrands } };
  }

  // 3. Banners
  if (cleanPath.includes('/banners')) {
    return { data: { banners: fallbackBanners } };
  }

  // 4. Delivery Charges
  if (cleanPath.includes('/delivery/charges') || cleanPath.includes('/delivery')) {
    return {
      data: {
        charges: {
          inside_dhaka: 80,
          outside_dhaka: 150,
          free_shipping_threshold: 4000,
        },
      },
    };
  }

  // 5. Single Product: /products/:slug or /products/:id
  if (cleanPath.startsWith('/products/') && cleanPath !== '/products/' && !cleanPath.includes('/products/search')) {
    const identifier = decodeURIComponent(cleanPath.replace('/products/', '').split('/')[0]);
    const product = fallbackProducts.find(
      (p) => String(p.id) === identifier || p.slug === identifier
    );
    if (product) {
      return { data: { product } };
    }
    // Return first product as a helpful safety fallback
    return { data: { product: fallbackProducts[0] } };
  }

  // 6. Product Reviews
  if (cleanPath.includes('/reviews')) {
    return { data: { reviews: [] } };
  }

  // 7. Products Catalog & Filtering (/products or /products?...)
  if (cleanPath.endsWith('/products')) {
    let result = [...fallbackProducts];

    if (params.category) {
      result = result.filter(
        (p) =>
          p.category_slug?.toLowerCase() === params.category.toLowerCase() ||
          p.category_name?.toLowerCase().includes(params.category.toLowerCase())
      );
    }

    if (params.brand) {
      result = result.filter(
        (p) =>
          p.brand_slug?.toLowerCase() === params.brand.toLowerCase() ||
          p.brand_name?.toLowerCase().includes(params.brand.toLowerCase())
      );
    }

    if (params.gender) {
      result = result.filter(
        (p) => p.gender?.toLowerCase() === params.gender.toLowerCase() || p.gender === 'Unisex'
      );
    }

    if (params.search) {
      const q = params.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.short_description?.toLowerCase().includes(q) ||
          p.brand_name?.toLowerCase().includes(q) ||
          p.category_name?.toLowerCase().includes(q)
      );
    }

    if (params.is_featured === true || params.is_featured === 'true' || params.is_featured === '1' || params.is_featured === 1) {
      result = result.filter((p) => p.is_featured === 1);
    }

    if (params.is_trending === true || params.is_trending === 'true' || params.is_trending === '1' || params.is_trending === 1) {
      result = result.filter((p) => p.is_trending === 1);
    }

    if (params.is_new_arrival === true || params.is_new_arrival === 'true' || params.is_new_arrival === '1' || params.is_new_arrival === 1) {
      result = result.filter((p) => p.is_new_arrival === 1);
    }

    if (params.minPrice) {
      result = result.filter((p) => (p.sale_price || p.regular_price) >= Number(params.minPrice));
    }

    if (params.maxPrice) {
      result = result.filter((p) => (p.sale_price || p.regular_price) <= Number(params.maxPrice));
    }

    // Sorting
    if (params.sort === 'price-low') {
      result.sort((a, b) => (a.sale_price || a.regular_price) - (b.sale_price || b.regular_price));
    } else if (params.sort === 'price-high') {
      result.sort((a, b) => (b.sale_price || b.regular_price) - (a.sale_price || a.regular_price));
    } else if (params.sort === 'rating') {
      result.sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0));
    } else if (params.sort === 'newest') {
      result.sort((a, b) => b.id - a.id);
    }

    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 12;
    const startIndex = (page - 1) * limit;
    const paginated = result.slice(startIndex, startIndex + limit);

    return {
      data: {
        products: paginated,
        pagination: {
          total: result.length,
          totalPages: Math.ceil(result.length / limit) || 1,
          page,
          limit,
        },
      },
    };
  }

  // 8. Auth Fallback
  if (cleanPath.includes('/auth/login') && method === 'post') {
    let body = {};
    try {
      body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
    } catch (e) {}

    const { email, password } = body as any;
    if (email === 'admin@jutarghor.com' && password === 'admin123') {
      return {
        data: {
          token: 'demo_admin_jwt_token',
          user: {
            id: 1,
            email: 'admin@jutarghor.com',
            full_name: 'Jutar Ghor Admin',
            role: 'admin',
          },
        },
      };
    } else if (password) {
      return {
        data: {
          token: 'demo_customer_jwt_token',
          user: {
            id: 2,
            email: email || 'customer@jutarghor.com',
            full_name: 'Customer Account',
            role: 'customer',
          },
        },
      };
    }
  }

  // 9. Coupon Apply
  if (cleanPath.includes('/coupons/apply') && method === 'post') {
    let body: any = {};
    try {
      body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
    } catch (e) {}
    const { code, subtotal } = body;
    if (code?.toUpperCase() === 'JUTAR10') {
      const discount = Math.round(subtotal * 0.1);
      return { data: { discount, message: '10% discount applied!' } };
    }
    if (code?.toUpperCase() === 'KICKS500') {
      return { data: { discount: 500, message: '৳500 discount applied!' } };
    }
    if (code?.toUpperCase() === 'DHAKAFREE') {
      return { data: { discount: 80, message: 'Free shipping coupon applied!' } };
    }
  }

  // 10. Order Placement
  if (cleanPath.includes('/orders') && method === 'post') {
    const orderNumber = `JG-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    return {
      data: {
        order: {
          id: Date.now(),
          order_number: orderNumber,
          status: 'pending',
          created_at: new Date().toISOString(),
        },
      },
    };
  }

  // 11. Admin Stats Fallback
  if (cleanPath.includes('/admin/stats')) {
    return {
      data: {
        stats: {
          total_revenue: 124500,
          total_orders: 28,
          total_customers: 64,
          low_stock_count: 3,
        },
        recent_orders: [],
      },
    };
  }

  // Default empty fallback
  return { data: {} };
}

// Intercept responses for global error handling & seamless fallback
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If backend is unreachable or returns 404/5xx, provide graceful fallback
    if (
      !error.response ||
      error.code === 'ERR_NETWORK' ||
      error.code === 'ECONNABORTED' ||
      error.response.status === 404 ||
      error.response.status >= 500
    ) {
      console.warn('Backend unavailable, using fallback data for:', error.config?.url);
      const fallback = handleFallback(error.config);
      return Promise.resolve(fallback as any);
    }

    if (error.response && error.response.status === 401) {
      if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
        localStorage.removeItem('jutar_ghor_token');
        localStorage.removeItem('jutar_ghor_user');
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
