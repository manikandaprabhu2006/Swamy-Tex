/*
# SWAMY TEX — Core E-Commerce Schema

1. Overview
This migration builds the complete data model for the SWAMY TEX premium fashion
e-commerce platform (Tirunelveli, Tamil Nadu). It is a multi-user app with Supabase
Auth: customers sign in to browse/buy, and admins manage the store. All tables carry
owner-scoped RLS policies so a customer can only touch their own cart, wishlist,
addresses, orders, and reviews.

2. New Tables
- profiles: customer/admin profile linked to auth.users, with role (USER/ADMIN), full_name, phone.
- categories: product categories (Men, Women, Kids, Shirts, Group Shirts, ...). Admin-managed.
- products: full product record — slug, sku, price, original_price, stock, sizes, colors, flags (featured/new_arrival/best_seller/group_shirt/offer), weight, dimensions, status.
- product_images: multiple images per product with position + is_main.
- addresses: customer shipping addresses (full address, city, state, pincode, phone).
- cart_items: per-user cart lines (product_id, quantity, size, color).
- wishlist_items: per-user wishlist (product_id).
- orders: order header — user, status, subtotal, delivery_charge, discount, total, razorpay ids, shipping address snapshot, pincode, shipment ids.
- order_items: order lines (product snapshot, qty, price).
- payments: payment records (razorpay payment_id, amount, status).
- shipments: delhivery shipment tracking (shipment_id, awb, status, events, eta).
- reviews: product reviews (rating, comment) by customers.

3. Security (RLS)
- profiles: owner read/update; admins read all.
- categories, products, product_images: public read (anon+authenticated); admin write via service role / policies scoped to role = ADMIN.
- cart_items, wishlist_items, addresses: owner-scoped CRUD (auth.uid = user_id).
- orders: owner read; owner insert (creates own order); admin read all.
- order_items, payments, shipments: read via parent order ownership; admin read all.
- reviews: public read; owner insert/update/delete own review.

4. Notes
- Owner columns default to auth.uid() so client inserts omitting user_id still pass WITH CHECK.
- role lives in profiles.role; admin write policies check profiles.role = 'ADMIN' for the current user.
- Indexes on common query columns (slug, sku, category, status flags, user_id FKs).
*/

-- profiles
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  phone text,
  role text NOT NULL DEFAULT 'USER' CHECK (role IN ('USER','ADMIN')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON profiles;
CREATE POLICY "profiles_select_own_or_admin" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'ADMIN'));
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- categories
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  parent_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  image_url text,
  sort_order int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "categories_read_public" ON categories;
CREATE POLICY "categories_read_public" ON categories FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "categories_write_admin" ON categories;
CREATE POLICY "categories_write_admin" ON categories FOR ALL
  TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'ADMIN'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'ADMIN'));

-- products
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  sku text UNIQUE,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  subcategory text,
  brand text,
  description text,
  short_description text,
  price numeric(10,2) NOT NULL DEFAULT 0,
  original_price numeric(10,2),
  weight_grams int DEFAULT 500,
  length_cm numeric(6,2) DEFAULT 30,
  width_cm numeric(6,2) DEFAULT 25,
  height_cm numeric(6,2) DEFAULT 5,
  sizes text[] DEFAULT '{}',
  colors text[] DEFAULT '{}',
  stock int NOT NULL DEFAULT 0,
  low_stock_threshold int DEFAULT 5,
  status text NOT NULL DEFAULT 'IN STOCK' CHECK (status IN ('IN STOCK','LOW STOCK','OUT OF STOCK')),
  featured boolean DEFAULT false,
  new_arrival boolean DEFAULT false,
  best_seller boolean DEFAULT false,
  group_shirt boolean DEFAULT false,
  offer boolean DEFAULT false,
  rating numeric(3,2) DEFAULT 0,
  review_count int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_flags ON products USING gin (to_tsvector('english', coalesce(name,'') || ' ' || coalesce(short_description,'')));
DROP POLICY IF EXISTS "products_read_public" ON products;
CREATE POLICY "products_read_public" ON products FOR SELECT
  TO anon, authenticated USING (is_active = true);
DROP POLICY IF EXISTS "products_write_admin" ON products;
CREATE POLICY "products_write_admin" ON products FOR ALL
  TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'ADMIN'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'ADMIN'));

-- product_images
CREATE TABLE IF NOT EXISTS product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url text NOT NULL,
  alt text,
  position int DEFAULT 0,
  is_main boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);
DROP POLICY IF EXISTS "product_images_read_public" ON product_images;
CREATE POLICY "product_images_read_public" ON product_images FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "product_images_write_admin" ON product_images;
CREATE POLICY "product_images_write_admin" ON product_images FOR ALL
  TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'ADMIN'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'ADMIN'));

-- addresses
CREATE TABLE IF NOT EXISTS addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  label text,
  full_name text NOT NULL,
  phone text NOT NULL,
  address_line text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  pincode text NOT NULL,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_addresses_user ON addresses(user_id);
DROP POLICY IF EXISTS "addresses_select_own" ON addresses;
CREATE POLICY "addresses_select_own" ON addresses FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "addresses_insert_own" ON addresses;
CREATE POLICY "addresses_insert_own" ON addresses FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "addresses_update_own" ON addresses;
CREATE POLICY "addresses_update_own" ON addresses FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "addresses_delete_own" ON addresses;
CREATE POLICY "addresses_delete_own" ON addresses FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- cart_items
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity int NOT NULL DEFAULT 1 CHECK (quantity > 0),
  size text,
  color text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_cart_user ON cart_items(user_id);
DROP POLICY IF EXISTS "cart_select_own" ON cart_items;
CREATE POLICY "cart_select_own" ON cart_items FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "cart_insert_own" ON cart_items;
CREATE POLICY "cart_insert_own" ON cart_items FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "cart_update_own" ON cart_items;
CREATE POLICY "cart_update_own" ON cart_items FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "cart_delete_own" ON cart_items;
CREATE POLICY "cart_delete_own" ON cart_items FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- wishlist_items
CREATE TABLE IF NOT EXISTS wishlist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, product_id)
);
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlist_items(user_id);
DROP POLICY IF EXISTS "wishlist_select_own" ON wishlist_items;
CREATE POLICY "wishlist_select_own" ON wishlist_items FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "wishlist_insert_own" ON wishlist_items;
CREATE POLICY "wishlist_insert_own" ON wishlist_items FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "wishlist_delete_own" ON wishlist_items;
CREATE POLICY "wishlist_delete_own" ON wishlist_items FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- orders
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'ORDER PLACED' CHECK (status IN ('ORDER PLACED','PAYMENT CONFIRMED','PROCESSING','PACKED','SHIPPED','OUT FOR DELIVERY','DELIVERED','CANCELLED','RETURNED')),
  subtotal numeric(10,2) NOT NULL DEFAULT 0,
  delivery_charge numeric(10,2) NOT NULL DEFAULT 0,
  discount numeric(10,2) NOT NULL DEFAULT 0,
  total numeric(10,2) NOT NULL DEFAULT 0,
  razorpay_order_id text,
  razorpay_payment_id text,
  razorpay_signature text,
  payment_status text DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING','PAID','FAILED','REFUNDED')),
  shipping_name text,
  shipping_phone text,
  shipping_address text,
  shipping_city text,
  shipping_state text,
  shipping_pincode text,
  delhivery_shipment_id text,
  awb text,
  tracking_status text,
  estimated_delivery date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
DROP POLICY IF EXISTS "orders_select_own_or_admin" ON orders;
CREATE POLICY "orders_select_own_or_admin" ON orders FOR SELECT
  TO authenticated USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'ADMIN'));
DROP POLICY IF EXISTS "orders_insert_own" ON orders;
CREATE POLICY "orders_insert_own" ON orders FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "orders_update_own_or_admin" ON orders;
CREATE POLICY "orders_update_own_or_admin" ON orders FOR UPDATE
  TO authenticated USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'ADMIN'))
  WITH CHECK (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'ADMIN'));

-- order_items
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  product_slug text,
  product_image text,
  size text,
  color text,
  quantity int NOT NULL CHECK (quantity > 0),
  price numeric(10,2) NOT NULL
);
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
DROP POLICY IF EXISTS "order_items_select_own_or_admin" ON order_items;
CREATE POLICY "order_items_select_own_or_admin" ON order_items FOR SELECT
  TO authenticated USING (EXISTS (SELECT 1 FROM orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'ADMIN'))));

-- payments
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  razorpay_payment_id text,
  amount numeric(10,2) NOT NULL,
  currency text DEFAULT 'INR',
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','PAID','FAILED','REFUNDED')),
  method text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
DROP POLICY IF EXISTS "payments_select_own_or_admin" ON payments;
CREATE POLICY "payments_select_own_or_admin" ON payments FOR SELECT
  TO authenticated USING (EXISTS (SELECT 1 FROM orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'ADMIN'))));

-- shipments
CREATE TABLE IF NOT EXISTS shipments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  shipment_id text,
  awb text,
  status text,
  events jsonb DEFAULT '[]'::jsonb,
  estimated_delivery date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_shipments_order ON shipments(order_id);
DROP POLICY IF EXISTS "shipments_select_own_or_admin" ON shipments;
CREATE POLICY "shipments_select_own_or_admin" ON shipments FOR SELECT
  TO authenticated USING (EXISTS (SELECT 1 FROM orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'ADMIN'))));

-- reviews
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title text,
  comment text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
DROP POLICY IF EXISTS "reviews_read_public" ON reviews;
CREATE POLICY "reviews_read_public" ON reviews FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "reviews_insert_own" ON reviews;
CREATE POLICY "reviews_insert_own" ON reviews FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "reviews_update_own" ON reviews;
CREATE POLICY "reviews_update_own" ON reviews FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "reviews_delete_own" ON reviews;
CREATE POLICY "reviews_delete_own" ON reviews FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- updated_at trigger helper
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_profiles_updated ON profiles;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS trg_products_updated ON products;
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS trg_addresses_updated ON addresses;
CREATE TRIGGER trg_addresses_updated BEFORE UPDATE ON addresses FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS trg_orders_updated ON orders;
CREATE TRIGGER trg_orders_updated BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS trg_shipments_updated ON shipments;
CREATE TRIGGER trg_shipments_updated BEFORE UPDATE ON shipments FOR EACH ROW EXECUTE FUNCTION set_updated_at();
