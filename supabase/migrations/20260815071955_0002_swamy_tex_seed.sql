/*
# SWAMY TEX — Seed Categories & Products

1. Overview
Seeds the product catalog with real fashion photography from Pexels (license-free).
Creates all requested categories and ~24 products spanning men, women, kids, shirts,
group shirts, t-shirts, pants, veshti, veshti shirts, kurtis, and chudi — with flags
for new arrivals, best sellers, group shirts, and offers.

2. New Data
- 11 categories (Men's Wear, Women's Wear, Kids Wear, Shirts, Group Shirts, T-Shirts, Pants, Veshti, Veshti Shirts, Kurtis, Chudi).
- 24 products with multiple images each, realistic Indian pricing (INR), sizes, colors, weights, stock.
- Product images linked to each product (main + gallery).

3. Notes
- Uses ON CONFLICT DO NOTHING so re-running is safe.
- Products reference categories by slug via a CTE lookup.
- All images are remote Pexels URLs (no local storage needed).
*/

-- Categories
INSERT INTO categories (name, slug, sort_order, image_url) VALUES
  ('Men''s Wear', 'men', 1, 'https://images.pexels.com/photos/13624148/pexels-photo-13624148.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
  ('Women''s Wear', 'women', 2, 'https://images.pexels.com/photos/31450180/pexels-photo-31450180.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
  ('Kids Wear', 'kids', 3, 'https://images.pexels.com/photos/1620759/pexels-photo-1620759.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
  ('Shirts', 'shirts', 4, 'https://images.pexels.com/photos/14941607/pexels-photo-14941607.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
  ('Group Shirts', 'group-shirts', 5, 'https://images.pexels.com/photos/17901274/pexels-photo-17901274.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
  ('T-Shirts', 't-shirts', 6, 'https://images.pexels.com/photos/4440566/pexels-photo-4440566.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
  ('Pants', 'pants', 7, 'https://images.pexels.com/photos/4109759/pexels-photo-4109759.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
  ('Veshti', 'veshti', 8, 'https://images.pexels.com/photos/4591188/pexels-photo-4591188.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
  ('Veshti Shirts', 'veshti-shirts', 9, 'https://images.pexels.com/photos/8770944/pexels-photo-8770944.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
  ('Kurtis', 'kurtis', 10, 'https://images.pexels.com/photos/38641810/pexels-photo-38641810.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
  ('Chudi', 'chudi', 11, 'https://images.pexels.com/photos/27719404/pexels-photo-27719404.jpeg?auto=compress&cs=tinysrgb&h=650&w=940')
ON CONFLICT (slug) DO NOTHING;

-- Helper: insert product and return id by slug
CREATE OR REPLACE FUNCTION _swamy_upsert_product(
  p_name text, p_slug text, p_sku text, p_cat_slug text, p_sub text, p_brand text,
  p_desc text, p_short text, p_price numeric, p_orig numeric, p_weight int,
  p_sizes text[], p_colors text[], p_stock int, p_status text,
  p_featured boolean, p_new boolean, p_best boolean, p_group boolean, p_offer boolean,
  p_rating numeric, p_images text[]
) RETURNS uuid LANGUAGE plpgsql AS $$
DECLARE
  v_id uuid;
  v_cat uuid;
BEGIN
  SELECT id INTO v_cat FROM categories WHERE slug = p_cat_slug;
  INSERT INTO products (name, slug, sku, category_id, subcategory, brand, description, short_description,
    price, original_price, weight_grams, sizes, colors, stock, status,
    featured, new_arrival, best_seller, group_shirt, offer, rating, review_count, is_active)
  VALUES (p_name, p_slug, p_sku, v_cat, p_sub, p_brand, p_desc, p_short,
    p_price, p_orig, p_weight, p_sizes, p_colors, p_stock, p_status,
    p_featured, p_new, p_best, p_group, p_offer, p_rating, 0, true)
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, sku = EXCLUDED.sku, category_id = EXCLUDED.category_id,
    price = EXCLUDED.price, original_price = EXCLUDED.original_price, stock = EXCLUDED.stock,
    status = EXCLUDED.status, updated_at = now()
  RETURNING id INTO v_id;

  -- Replace images
  DELETE FROM product_images WHERE product_id = v_id;
  INSERT INTO product_images (product_id, url, alt, position, is_main)
  SELECT v_id, url, p_name, ord - 1, (ord = 1)
  FROM unnest(p_images) WITH ORDINALITY AS t(url, ord);

  RETURN v_id;
END $$;

SELECT _swamy_upsert_product(
  'Royal Silk Sherwani', 'royal-silk-sherwani', 'ST-MN-001', 'men', 'Sherwani', 'Swamy Tex',
  'Handcrafted silk sherwani with intricate gold zari embroidery. Perfect for weddings and festive occasions. Includes inner kurta and churidar.',
  'Silk sherwani with gold embroidery', 4999, 7999, 800,
  ARRAY['M','L','XL'], ARRAY['Maroon','Gold','Cream'], 24, 'IN STOCK',
  true, true, true, false, true, 4.8,
  ARRAY['https://images.pexels.com/photos/13624148/pexels-photo-13624148.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        'https://images.pexels.com/photos/26755749/pexels-photo-26755749.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        'https://images.pexels.com/photos/13624157/pexels-photo-13624157.jpeg?auto=compress&cs=tinysrgb&h=650&w=940']);

SELECT _swamy_upsert_product(
  'Classic Cotton Veshti', 'classic-cotton-veshti', 'ST-VS-001', 'veshti', 'Veshti', 'Swamy Tex',
  'Premium handloom cotton veshti with zari border. Lightweight, breathable, and perfect for daily and festive wear.',
  'Handloom cotton veshti with zari border', 899, 1299, 400,
  ARRAY['Free Size'], ARRAY['White','Cream','Off-White'], 60, 'IN STOCK',
  true, true, true, false, false, 4.6,
  ARRAY['https://images.pexels.com/photos/4591188/pexels-photo-4591188.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        'https://images.pexels.com/photos/8770944/pexels-photo-8770944.jpeg?auto=compress&cs=tinysrgb&h=650&w=940']);

SELECT _swamy_upsert_product(
  'Veshti Shirt Combo', 'veshti-shirt-combo', 'ST-VS-002', 'veshti-shirts', 'Shirt', 'Swamy Tex',
  'Matching cotton shirt for veshti wear. Breathable fabric with classic collar. Pairs perfectly with our cotton veshti.',
  'Cotton veshti matching shirt', 699, 999, 350,
  ARRAY['M','L','XL','XXL'], ARRAY['White','Sky Blue','Cream'], 45, 'IN STOCK',
  false, true, false, false, true, 4.5,
  ARRAY['https://images.pexels.com/photos/8770944/pexels-photo-8770944.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        'https://images.pexels.com/photos/14768018/pexels-photo-14768018.jpeg?auto=compress&cs=tinysrgb&h=650&w=940']);

SELECT _swamy_upsert_product(
  'Premium Formal Shirt', 'premium-formal-shirt', 'ST-SH-001', 'shirts', 'Formal', 'Swamy Tex',
  'Wrinkle-resistant formal shirt with tailored fit. Premium cotton blend with mother-of-pearl buttons. Office and event ready.',
  'Wrinkle-resistant tailored formal shirt', 1299, 1899, 300,
  ARRAY['S','M','L','XL','XXL'], ARRAY['White','Sky Blue','Black'], 80, 'IN STOCK',
  true, false, true, false, false, 4.7,
  ARRAY['https://images.pexels.com/photos/9558723/pexels-photo-9558723.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        'https://images.pexels.com/photos/14941607/pexels-photo-14941607.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        'https://images.pexels.com/photos/6616649/pexels-photo-6616649.jpeg?auto=compress&cs=tinysrgb&h=650&w=940']);

SELECT _swamy_upsert_product(
  'Floral Party Shirt', 'floral-party-shirt', 'ST-SH-002', 'shirts', 'Casual', 'Swamy Tex',
  'Trendy floral print shirt in breathable rayon. Relaxed fit for parties and outings. A modern statement piece.',
  'Floral print rayon party shirt', 999, 1499, 280,
  ARRAY['M','L','XL'], ARRAY['Multi','Blue Floral','Black Floral'], 35, 'IN STOCK',
  false, true, false, false, true, 4.4,
  ARRAY['https://images.pexels.com/photos/14941607/pexels-photo-14941607.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        'https://images.pexels.com/photos/30993474/pexels-photo-30993474.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        'https://images.pexels.com/photos/30710542/pexels-photo-30710542.jpeg?auto=compress&cs=tinysrgb&h=650&w=940']);

SELECT _swamy_upsert_product(
  'Group Shirt — Family Pack', 'group-shirt-family-pack', 'ST-GS-001', 'group-shirts', 'Group', 'Swamy Tex',
  'Coordinated group shirts for family functions and events. Set of 4 matching premium cotton shirts in graduated sizes.',
  'Matching family group shirt pack of 4', 2999, 4999, 1200,
  ARRAY['S','M','L','XL','XXL'], ARRAY['Navy','Maroon','Black'], 18, 'LOW STOCK',
  true, true, true, true, true, 4.9,
  ARRAY['https://images.pexels.com/photos/17901274/pexels-photo-17901274.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        'https://images.pexels.com/photos/6616649/pexels-photo-6616649.jpeg?auto=compress&cs=tinysrgb&h=650&w=940']);

SELECT _swamy_upsert_product(
  'Group Shirt — Corporate Set', 'group-shirt-corporate-set', 'ST-GS-002', 'group-shirts', 'Group', 'Swamy Tex',
  'Professional coordinated shirts for teams and corporate events. Set of 5 premium polycotton shirts with custom branding option.',
  'Corporate group shirt set of 5', 3499, 5999, 1500,
  ARRAY['S','M','L','XL','XXL'], ARRAY['White','Sky Blue','Grey'], 12, 'LOW STOCK',
  false, false, true, true, false, 4.6,
  ARRAY['https://images.pexels.com/photos/6616649/pexels-photo-6616649.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        'https://images.pexels.com/photos/18533673/pexels-photo-18533673.jpeg?auto=compress&cs=tinysrgb&h=650&w=940']);

SELECT _swamy_upsert_product(
  'Classic Crew Neck T-Shirt', 'classic-crew-neck-tshirt', 'ST-TS-001', 't-shirts', 'T-Shirt', 'Swamy Tex',
  'Soft combed cotton crew neck t-shirt. Pre-shrunk fabric with reinforced collar. Everyday essential in multiple colors.',
  'Combed cotton crew neck t-shirt', 499, 799, 200,
  ARRAY['S','M','L','XL','XXL'], ARRAY['Black','White','Navy','Olive','Grey'], 120, 'IN STOCK',
  true, false, true, false, true, 4.5,
  ARRAY['https://images.pexels.com/photos/4440566/pexels-photo-4440566.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        'https://images.pexels.com/photos/12246169/pexels-photo-12246169.jpeg?auto=compress&cs=tinysrgb&h=650&w=940']);

SELECT _swamy_upsert_product(
  'Polo Collar T-Shirt', 'polo-collar-tshirt', 'ST-TS-002', 't-shirts', 'Polo', 'Swamy Tex',
  'Premium pique cotton polo t-shirt with ribbed collar. Smart-casual staple for work and weekend.',
  'Pique cotton polo t-shirt', 699, 999, 250,
  ARRAY['S','M','L','XL','XXL'], ARRAY['Navy','Black','White','Burgundy'], 75, 'IN STOCK',
  false, true, false, false, false, 4.4,
  ARRAY['https://images.pexels.com/photos/12246169/pexels-photo-12246169.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        'https://images.pexels.com/photos/9065153/pexels-photo-9065153.jpeg?auto=compress&cs=tinysrgb&h=650&w=940']);

SELECT _swamy_upsert_product(
  'Slim Fit Chino Pants', 'slim-fit-chino-pants', 'ST-PN-001', 'pants', 'Chino', 'Swamy Tex',
  'Stretch comfort chino pants with slim fit. Tapered leg with secure button closure. Versatile for work and casual.',
  'Slim fit stretch chino pants', 1499, 2199, 450,
  ARRAY['30','32','34','36','38'], ARRAY['Khaki','Black','Navy','Olive'], 50, 'IN STOCK',
  true, false, true, false, false, 4.6,
  ARRAY['https://images.pexels.com/photos/4109759/pexels-photo-4109759.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        'https://images.pexels.com/photos/4109797/pexels-photo-4109797.jpeg?auto=compress&cs=tinysrgb&h=650&w=940']);

SELECT _swamy_upsert_product(
  'Denim Jeans — Classic Fit', 'denim-jeans-classic-fit', 'ST-PN-002', 'pants', 'Jeans', 'Swamy Tex',
  'Classic fit denim jeans with mid-rise waist. Durable stretch denim with five-pocket styling. Everyday comfort.',
  'Classic fit stretch denim jeans', 1799, 2499, 600,
  ARRAY['30','32','34','36','38'], ARRAY['Indigo','Light Blue','Black'], 40, 'IN STOCK',
  false, true, false, false, true, 4.5,
  ARRAY['https://images.pexels.com/photos/17096040/pexels-photo-17096040.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        'https://images.pexels.com/photos/4109755/pexels-photo-4109755.jpeg?auto=compress&cs=tinysrgb&h=650&w=940']);

SELECT _swamy_upsert_product(
  'Banarasi Silk Saree', 'banarasi-silk-saree', 'ST-WM-001', 'women', 'Saree', 'Swamy Tex',
  'Handwoven Banarasi silk saree with gold zari motifs. Includes matching blouse piece. A timeless heirloom piece.',
  'Banarasi silk saree with zari work', 5999, 9999, 700,
  ARRAY['Free Size'], ARRAY['Red','Maroon','Royal Blue','Gold'], 20, 'IN STOCK',
  true, true, true, false, true, 4.9,
  ARRAY['https://images.pexels.com/photos/31450180/pexels-photo-31450180.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        'https://images.pexels.com/photos/27139262/pexels-photo-27139262.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        'https://images.pexels.com/photos/20190305/pexels-photo-20190305.jpeg?auto=compress&cs=tinysrgb&h=650&w=940']);

SELECT _swamy_upsert_product(
  'Cotton Kurti — Everyday', 'cotton-kurti-everyday', 'ST-KU-001', 'kurtis', 'Kurti', 'Swamy Tex',
  'Breathable cotton kurti with block print. Side slits for comfort. Perfect for daily wear and office.',
  'Cotton block print kurti', 799, 1299, 350,
  ARRAY['S','M','L','XL','XXL'], ARRAY['Turquoise','Pink','Yellow','Green'], 65, 'IN STOCK',
  true, true, true, false, true, 4.6,
  ARRAY['https://images.pexels.com/photos/38641810/pexels-photo-38641810.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        'https://images.pexels.com/photos/7176438/pexels-photo-7176438.jpeg?auto=compress&cs=tinysrgb&h=650&w=940']);

SELECT _swamy_upsert_product(
  'Embroidered Party Kurti', 'embroidered-party-kurti', 'ST-KU-002', 'kurtis', 'Kurti', 'Swamy Tex',
  'Elegant embroidered kurti in georgette fabric. Features intricate thread work and sequin accents. Festive ready.',
  'Georgette embroidered party kurti', 1499, 2299, 400,
  ARRAY['S','M','L','XL'], ARRAY['Wine','Black','Royal Blue'], 30, 'IN STOCK',
  false, true, false, false, false, 4.7,
  ARRAY['https://images.pexels.com/photos/38537321/pexels-photo-38537321.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        'https://images.pexels.com/photos/27719404/pexels-photo-27719404.jpeg?auto=compress&cs=tinysrgb&h=650&w=940']);

SELECT _swamy_upsert_product(
  'Churidar Set — Festive', 'churidar-set-festive', 'ST-CH-001', 'chudi', 'Churidar', 'Swamy Tex',
  'Three-piece churidar set with dupatta. Rich silk top with embroidered yoke and matching bottom. Festive favorite.',
  'Silk churidar set with dupatta', 2499, 3999, 600,
  ARRAY['S','M','L','XL','XXL'], ARRAY['Mint','Peach','Lavender','Grey'], 25, 'IN STOCK',
  true, true, true, false, true, 4.8,
  ARRAY['https://images.pexels.com/photos/27719404/pexels-photo-27719404.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        'https://images.pexels.com/photos/34155072/pexels-photo-34155072.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        'https://images.pexels.com/photos/7693907/pexels-photo-7693907.jpeg?auto=compress&cs=tinysrgb&h=650&w=940']);

SELECT _swamy_upsert_product(
  'Daily Wear Churidar', 'daily-wear-churidar', 'ST-CH-002', 'chudi', 'Churidar', 'Swamy Tex',
  'Comfortable cotton churidar for everyday wear. Soft fabric with stretch waist. Easy care and breathable.',
  'Cotton daily wear churidar', 999, 1599, 400,
  ARRAY['S','M','L','XL','XXL'], ARRAY['Blue','Pink','White','Maroon'], 55, 'IN STOCK',
  false, false, false, false, true, 4.4,
  ARRAY['https://images.pexels.com/photos/8749763/pexels-photo-8749763.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        'https://images.pexels.com/photos/14928074/pexels-photo-14928074.jpeg?auto=compress&cs=tinysrgb&h=650&w=940']);

SELECT _swamy_upsert_product(
  'Kids Formal Suit', 'kids-formal-suit', 'ST-KD-001', 'kids', 'Suit', 'Swamy Tex',
  'Smart formal suit for boys. Includes jacket, trousers, and shirt. Perfect for weddings and special occasions.',
  'Boys formal suit set', 1999, 2999, 500,
  ARRAY['2-3Y','4-5Y','6-7Y','8-9Y','10-11Y'], ARRAY['Black','Navy','Grey'], 22, 'IN STOCK',
  true, true, true, false, true, 4.7,
  ARRAY['https://images.pexels.com/photos/30690921/pexels-photo-30690921.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        'https://images.pexels.com/photos/36909815/pexels-photo-36909815.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        'https://images.pexels.com/photos/30690920/pexels-photo-30690920.jpeg?auto=compress&cs=tinysrgb&h=650&w=940']);

SELECT _swamy_upsert_product(
  'Kids Casual T-Shirt', 'kids-casual-tshirt', 'ST-KD-002', 'kids', 'T-Shirt', 'Swamy Tex',
  'Soft cotton t-shirt for kids. Fun prints and comfortable fit. Easy to wash and durable.',
  'Kids cotton casual t-shirt', 399, 599, 150,
  ARRAY['2-3Y','4-5Y','6-7Y','8-9Y','10-11Y'], ARRAY['Red','Blue','Yellow','Green'], 90, 'IN STOCK',
  false, true, false, false, true, 4.3,
  ARRAY['https://images.pexels.com/photos/5693888/pexels-photo-5693888.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        'https://images.pexels.com/photos/5560083/pexels-photo-5560083.jpeg?auto=compress&cs=tinysrgb&h=650&w=940']);

SELECT _swamy_upsert_product(
  'Kids Denim Set', 'kids-denim-set', 'ST-KD-003', 'kids', 'Denim', 'Swamy Tex',
  'Trendy denim jacket and jeans set for kids. Stretch denim for comfort. Stylish and durable for everyday play.',
  'Kids denim jacket and jeans set', 1299, 1899, 600,
  ARRAY['4-5Y','6-7Y','8-9Y','10-11Y'], ARRAY['Blue','Light Blue'], 18, 'LOW STOCK',
  false, true, true, false, false, 4.5,
  ARRAY['https://images.pexels.com/photos/38778561/pexels-photo-38778561.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        'https://images.pexels.com/photos/33018404/pexels-photo-33018404.jpeg?auto=compress&cs=tinysrgb&h=650&w=940']);

SELECT _swamy_upsert_product(
  'Designer Anarkali Gown', 'designer-anarkali-gown', 'ST-WM-002', 'women', 'Anarkali', 'Swamy Tex',
  'Floor-length designer anarkali gown with heavy embroidery and layered flare. Includes dupatta. Wedding guest ready.',
  'Embroidered floor-length anarkali', 3999, 6499, 900,
  ARRAY['S','M','L','XL'], ARRAY['Teal','Wine','Gold'], 15, 'LOW STOCK',
  true, true, true, false, true, 4.8,
  ARRAY['https://images.pexels.com/photos/7176438/pexels-photo-7176438.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        'https://images.pexels.com/photos/27139274/pexels-photo-27139274.jpeg?auto=compress&cs=tinysrgb&h=650&w=940']);

SELECT _swamy_upsert_product(
  'Cotton Saree — Daily', 'cotton-saree-daily', 'ST-WM-003', 'women', 'Saree', 'Swamy Tex',
  'Lightweight cotton saree with traditional border. Comfortable for daily wear and office. Includes blouse piece.',
  'Daily cotton saree with border', 1299, 1999, 500,
  ARRAY['Free Size'], ARRAY['Blue','Green','Maroon','Yellow'], 40, 'IN STOCK',
  false, false, true, false, true, 4.5,
  ARRAY['https://images.pexels.com/photos/27139259/pexels-photo-27139259.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        'https://images.pexels.com/photos/7693907/pexels-photo-7693907.jpeg?auto=compress&cs=tinysrgb&h=650&w=940']);

SELECT _swamy_upsert_product(
  'Men''s Cotton Dhoti Set', 'mens-cotton-dhoti-set', 'ST-MN-002', 'men', 'Dhoti', 'Swamy Tex',
  'Traditional cotton dhoti with matching angavastram. Crisp finish and breathable weave. Festive and pooja ready.',
  'Cotton dhoti with angavastram', 1199, 1799, 500,
  ARRAY['Free Size'], ARRAY['White','Cream','Gold Border'], 30, 'IN STOCK',
  false, true, false, false, false, 4.5,
  ARRAY['https://images.pexels.com/photos/20431931/pexels-photo-20431931.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        'https://images.pexels.com/photos/22065583/pexels-photo-22065583.jpeg?auto=compress&cs=tinysrgb&h=650&w=940']);

SELECT _swamy_upsert_product(
  'Silk Kurti Pajama Set', 'silk-kurti-pajama-set', 'ST-MN-003', 'men', 'Kurta', 'Swamy Tex',
  'Silk blend kurta pajama set with mandarin collar. Subtle sheen and comfortable fit. Eid and festive ready.',
  'Silk blend kurta pajama set', 1799, 2799, 600,
  ARRAY['M','L','XL','XXL'], ARRAY['Ivory','Sky Blue','Maroon'], 28, 'IN STOCK',
  true, true, true, false, true, 4.7,
  ARRAY['https://images.pexels.com/photos/4411909/pexels-photo-4411909.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        'https://images.pexels.com/photos/7685575/pexels-photo-7685575.jpeg?auto=compress&cs=tinysrgb&h=650&w=940']);

SELECT _swamy_upsert_product(
  'Oversized Graphic T-Shirt', 'oversized-graphic-tshirt', 'ST-TS-003', 't-shirts', 'T-Shirt', 'Swamy Tex',
  'Trendy oversized fit graphic t-shirt with bold print. Heavyweight cotton with drop shoulders. Streetwear staple.',
  'Oversized graphic print t-shirt', 799, 1199, 280,
  ARRAY['M','L','XL','XXL'], ARRAY['Black','White','Sand'], 0, 'OUT OF STOCK',
  false, true, false, false, false, 4.4,
  ARRAY['https://images.pexels.com/photos/2897531/pexels-photo-2897531.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        'https://images.pexels.com/photos/7276048/pexels-photo-7276048.jpeg?auto=compress&cs=tinysrgb&h=650&w=940']);

SELECT _swamy_upsert_product(
  'Women''s Palazzo Set', 'womens-palazzo-set', 'ST-WM-004', 'women', 'Palazzo', 'Swamy Tex',
  'Flowy palazzo set with printed kurti and matching dupatta. Rayon fabric with comfortable flare. Summer ready.',
  'Rayon palazzo set with dupatta', 1799, 2699, 500,
  ARRAY['S','M','L','XL','XXL'], ARRAY['Coral','Teal','Mustard'], 32, 'IN STOCK',
  false, true, false, false, true, 4.5,
  ARRAY['https://images.pexels.com/photos/8749765/pexels-photo-8749765.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        'https://images.pexels.com/photos/37442997/pexels-photo-37442997.jpeg?auto=compress&cs=tinysrgb&h=650&w=940']);

DROP FUNCTION IF EXISTS _swamy_upsert_product(text, text, text, text, text, text, text, text, numeric, numeric, int, text[], text[], int, text, boolean, boolean, boolean, boolean, boolean, numeric, text[]);
