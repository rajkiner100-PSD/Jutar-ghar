export interface ProductImage {
  id?: number;
  product_id?: number;
  image_url: string;
  is_primary?: number | boolean;
  display_order?: number;
}

export interface ProductVariant {
  id?: number;
  product_id?: number;
  size: string;
  color: string;
  color_hex?: string;
  sku?: string;
  stock_quantity: number;
  additional_price?: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  display_order?: number;
  product_count?: number;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo_url?: string;
  description?: string;
  product_count?: number;
}

export interface Review {
  id: number;
  product_id: number;
  product_name?: string;
  user_name: string;
  rating: number;
  comment: string;
  is_approved?: number;
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  sku?: string;
  brand_id?: number;
  brand_name?: string;
  brand_slug?: string;
  brand_logo?: string;
  category_id?: number;
  category_name?: string;
  category_slug?: string;
  regular_price: number;
  sale_price: number;
  discount_percentage?: number;
  description: string;
  short_description?: string;
  gender?: 'Men' | 'Women' | 'Kids' | 'Unisex';
  is_featured?: number | boolean;
  is_trending?: number | boolean;
  is_new_arrival?: number | boolean;
  is_active?: number | boolean;
  primary_image?: string;
  images?: ProductImage[];
  variants?: ProductVariant[];
  available_sizes?: string[];
  available_colors?: string[];
  total_stock?: number;
  avg_rating?: number;
  review_count?: number;
  reviews?: Review[];
  related_products?: Product[];
  created_at?: string;
}

export interface CartItem {
  product: Product;
  variant: ProductVariant;
  quantity: number;
  selected_size: string;
  selected_color: string;
  unit_price: number;
}

export interface OrderItem {
  id?: number;
  order_id?: number;
  product_id: number;
  variant_id?: number;
  product_name: string;
  product_image?: string;
  size: string;
  color: string;
  price: number;
  quantity: number;
  total: number;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';
export type PaymentMethod = 'cod' | 'bkash' | 'nagad';

export interface Order {
  id: number;
  order_number: string;
  customer_id?: number | null;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  district: string;
  area: string;
  full_address: string;
  notes?: string;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  subtotal: number;
  delivery_fee: number;
  discount: number;
  coupon_code?: string;
  total_amount: number;
  bkash_transaction_id?: string;
  nagad_transaction_id?: string;
  created_at: string;
  updated_at?: string;
  items?: OrderItem[];
  item_count?: number;
}

export interface Coupon {
  id: number;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount?: number;
  max_discount_amount?: number;
  valid_from?: string;
  valid_until?: string;
  usage_limit?: number;
  used_count?: number;
  is_active: number;
  created_at?: string;
}

export interface Banner {
  id: number;
  title: string;
  subtitle?: string;
  badge?: string;
  image_url: string;
  link_url?: string;
  button_text?: string;
  is_active: number;
  display_order?: number;
}

export interface DeliverySettings {
  id: number;
  inside_dhaka_fee: number;
  outside_dhaka_fee: number;
  free_delivery_threshold: number;
  estimated_days_inside_dhaka: string;
  estimated_days_outside_dhaka: string;
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  role: 'admin' | 'customer';
  created_at?: string;
  order_count?: number;
  total_spent?: number;
}
