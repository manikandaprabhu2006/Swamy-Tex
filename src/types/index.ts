export type Role = "USER" | "ADMIN";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: Role;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt: string | null;
  position: number;
  is_main: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  category_id: string | null;
  subcategory: string | null;
  brand: string | null;
  description: string | null;
  short_description: string | null;
  price: number;
  original_price: number | null;
  weight_grams: number;
  length_cm: number;
  width_cm: number;
  height_cm: number;
  sizes: string[];
  colors: string[];
  stock: number;
  low_stock_threshold: number;
  status: "IN STOCK" | "LOW STOCK" | "OUT OF STOCK";
  featured: boolean;
  new_arrival: boolean;
  best_seller: boolean;
  group_shirt: boolean;
  offer: boolean;
  rating: number;
  review_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  product_images?: ProductImage[];
  category?: Category | null;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  size: string | null;
  color: string | null;
  product?: Product;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  product?: Product;
}

export interface Address {
  id: string;
  user_id: string;
  label: string | null;
  full_name: string;
  phone: string;
  address_line: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
}

export type OrderStatus =
  | "ORDER PLACED"
  | "PAYMENT CONFIRMED"
  | "PROCESSING"
  | "PACKED"
  | "SHIPPED"
  | "OUT FOR DELIVERY"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURNED";

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_slug: string | null;
  product_image: string | null;
  size: string | null;
  color: string | null;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  status: OrderStatus;
  subtotal: number;
  delivery_charge: number;
  discount: number;
  total: number;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  payment_status: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  shipping_name: string | null;
  shipping_phone: string | null;
  shipping_address: string | null;
  shipping_city: string | null;
  shipping_state: string | null;
  shipping_pincode: string | null;
  delhivery_shipment_id: string | null;
  awb: string | null;
  tracking_status: string | null;
  estimated_delivery: string | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

export interface Shipment {
  id: string;
  order_id: string;
  shipment_id: string | null;
  awb: string | null;
  status: string | null;
  events: Array<{ status: string; location: string; timestamp: string }>;
  estimated_delivery: string | null;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  created_at: string;
}

export interface DeliveryQuote {
  serviceable: boolean;
  deliveryCharge: number;
  currency: string;
  estimatedDeliveryDays: number;
  courier: string;
  error?: string;
}
