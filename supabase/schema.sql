-- Create schema for flower shop application

-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profile table for users (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL PRIMARY KEY,
  name TEXT,
  role TEXT CHECK (role IN ('admin', 'user', 'staff')) NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Flowers table
CREATE TABLE IF NOT EXISTS flowers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  scientific_name TEXT,
  description TEXT,
  colors TEXT[] NOT NULL DEFAULT '{}',
  in_stock INTEGER NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER NOT NULL DEFAULT 5,
  price DECIMAL(10, 2) NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Bouquets table
CREATE TABLE IF NOT EXISTS bouquets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  discount_price DECIMAL(10, 2),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  image TEXT,
  featured BOOLEAN NOT NULL DEFAULT false,
  in_stock BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Junction table for bouquets and flowers
CREATE TABLE IF NOT EXISTS bouquet_flowers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  bouquet_id UUID REFERENCES bouquets(id) ON DELETE CASCADE NOT NULL,
  flower_id UUID REFERENCES flowers(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (bouquet_id, flower_id)
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')) NOT NULL DEFAULT 'pending',
  total_amount DECIMAL(10, 2) NOT NULL,
  shipping_address JSONB NOT NULL,
  payment_intent_id TEXT,
  payment_status TEXT CHECK (status IN ('pending', 'paid', 'failed')) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  bouquet_id UUID REFERENCES bouquets(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price_at_purchase DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create trigger functions for updated_at timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at timestamp
CREATE TRIGGER update_profiles_timestamp
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_categories_timestamp
BEFORE UPDATE ON categories
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_tags_timestamp
BEFORE UPDATE ON tags
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_flowers_timestamp
BEFORE UPDATE ON flowers
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_bouquets_timestamp
BEFORE UPDATE ON bouquets
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_bouquet_flowers_timestamp
BEFORE UPDATE ON bouquet_flowers
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_orders_timestamp
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_order_items_timestamp
BEFORE UPDATE ON order_items
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Row Level Security Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE flowers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bouquets ENABLE ROW LEVEL SECURITY;
ALTER TABLE bouquet_flowers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Profile policies
CREATE POLICY "Users can view their own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Admin users can view all profiles"
ON profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admin users can update all profiles"
ON profiles FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Public data policies
-- Anyone can view published bouquets, categories, tags, and flowers
CREATE POLICY "Anyone can view categories"
ON categories FOR SELECT
USING (true);

CREATE POLICY "Anyone can view tags"
ON tags FOR SELECT
USING (true);

CREATE POLICY "Anyone can view flowers"
ON flowers FOR SELECT
USING (true);

CREATE POLICY "Anyone can view bouquets"
ON bouquets FOR SELECT
USING (true);

CREATE POLICY "Anyone can view bouquet_flowers"
ON bouquet_flowers FOR SELECT
USING (true);

-- Admin-only write policies
-- Only admins can create/update/delete inventory
CREATE POLICY "Only admins can create categories"
ON categories FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Only admins can update categories"
ON categories FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Only admins can delete categories"
ON categories FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Similar policies for tags
CREATE POLICY "Only admins can create tags"
ON tags FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Only admins can update tags"
ON tags FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Only admins can delete tags"
ON tags FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Similar policies for flowers
CREATE POLICY "Only admins can create flowers"
ON flowers FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Only admins can update flowers"
ON flowers FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Only admins can delete flowers"
ON flowers FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Similar policies for bouquets
CREATE POLICY "Only admins can create bouquets"
ON bouquets FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Only admins can update bouquets"
ON bouquets FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Only admins can delete bouquets"
ON bouquets FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Similar policies for bouquet_flowers
CREATE POLICY "Only admins can create bouquet_flowers"
ON bouquet_flowers FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Only admins can update bouquet_flowers"
ON bouquet_flowers FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Only admins can delete bouquet_flowers"
ON bouquet_flowers FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Order policies
-- Users can see their own orders
CREATE POLICY "Users can view their own orders"
ON orders FOR SELECT
USING (auth.uid() = user_id);

-- Admins can see all orders
CREATE POLICY "Admins can view all orders"
ON orders FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Admins can update all orders
CREATE POLICY "Admins can update all orders"
ON orders FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Users can create orders
CREATE POLICY "Users can create orders"
ON orders FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Order items policies
-- Users can see their own order items
CREATE POLICY "Users can view their own order items"
ON order_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
  )
);

-- Admins can see all order items
CREATE POLICY "Admins can view all order items"
ON order_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Admins can update all order items
CREATE POLICY "Admins can update all order items"
ON order_items FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Users can create order items
CREATE POLICY "Users can create order items"
ON order_items FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
  )
);

-- Create seed data for admin user
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
VALUES (
  uuid_generate_v4(),
  'admin@flowershop.com',
  crypt('admin123', gen_salt('bf')),
  now(),
  '{"name": "Admin User"}'
) ON CONFLICT DO NOTHING;

-- Set up admin profile
INSERT INTO profiles (id, name, role)
SELECT id, 'Admin User', 'admin'
FROM auth.users
WHERE email = 'admin@flowershop.com'
ON CONFLICT DO NOTHING;

-- Seed categories
INSERT INTO categories (name, description)
VALUES 
('Romance', 'Bouquets perfect for romantic occasions'),
('Seasonal', 'Seasonal flower arrangements'),
('Wedding', 'Wedding bouquets and decorations'),
('Sympathy', 'Arrangements for expressing condolences'),
('Birthday', 'Celebratory birthday flowers')
ON CONFLICT DO NOTHING;

-- Seed flowers
INSERT INTO flowers (name, scientific_name, description, colors, in_stock, low_stock_threshold, price, is_available)
VALUES
('Red Rose', 'Rosa gallica', 'Classic red rose symbolizing love and romance', ARRAY['Red'], 45, 15, 2.99, true),
('White Lily', 'Lilium candidum', 'Elegant white lily often used in wedding arrangements', ARRAY['White'], 12, 10, 3.50, true),
('Purple Orchid', 'Phalaenopsis', 'Exotic purple orchid for luxury arrangements', ARRAY['Purple', 'White'], 8, 5, 6.99, true),
('Sunflower', 'Helianthus annuus', 'Bright and cheerful flower perfect for summer bouquets', ARRAY['Yellow'], 30, 10, 1.99, true),
('Pink Carnation', 'Dianthus caryophyllus', 'Long-lasting pink carnations for various arrangements', ARRAY['Pink', 'Light Pink'], 60, 20, 1.50, true),
('Blue Hydrangea', 'Hydrangea macrophylla', 'Voluminous blue hydrangea flowers for statement bouquets', ARRAY['Blue'], 0, 5, 4.99, false)
ON CONFLICT DO NOTHING;

-- Seed tags
INSERT INTO tags (name)
VALUES
('Valentine''s Day'),
('Anniversary'),
('Wedding'),
('Birthday'),
('Sympathy'),
('Get Well Soon'),
('Congratulations'),
('Spring'),
('Summer'),
('Autumn'),
('Winter')
ON CONFLICT DO NOTHING;

-- Get category IDs for reference
DO $$
DECLARE 
  romance_id UUID;
  seasonal_id UUID;
  wedding_id UUID;
  sympathy_id UUID;
  birthday_id UUID;
BEGIN
  SELECT id INTO romance_id FROM categories WHERE name = 'Romance' LIMIT 1;
  SELECT id INTO seasonal_id FROM categories WHERE name = 'Seasonal' LIMIT 1;
  SELECT id INTO wedding_id FROM categories WHERE name = 'Wedding' LIMIT 1;
  SELECT id INTO sympathy_id FROM categories WHERE name = 'Sympathy' LIMIT 1;
  SELECT id INTO birthday_id FROM categories WHERE name = 'Birthday' LIMIT 1;

  -- Seed bouquets
  INSERT INTO bouquets (name, description, price, discount_price, category_id, tags, image, featured, in_stock)
  VALUES
  (
    'Romantic Red Roses', 
    'A beautiful bouquet of red roses, perfect for Valentine''s Day', 
    49.99, 
    39.99, 
    romance_id, 
    ARRAY['Valentine''s Day', 'Anniversary'], 
    '/bouquets/red-roses.jpg', 
    true, 
    true
  ),
  (
    'Spring Celebration', 
    'Colorful spring flowers to brighten any room', 
    34.99, 
    NULL, 
    seasonal_id, 
    ARRAY['Spring', 'Easter'], 
    '/bouquets/spring-mix.jpg', 
    true, 
    true
  ),
  (
    'White Wedding', 
    'Elegant white flowers for the perfect wedding', 
    129.99, 
    NULL, 
    wedding_id, 
    ARRAY['Wedding', 'Luxury', 'White'], 
    '/bouquets/white-wedding.jpg', 
    false, 
    true
  ),
  (
    'Sympathy Arrangement', 
    'A thoughtful arrangement to express your condolences', 
    59.99, 
    NULL, 
    sympathy_id, 
    ARRAY['Sympathy', 'Funeral'], 
    '/bouquets/sympathy.jpg', 
    false, 
    false
  ),
  (
    'Birthday Surprise', 
    'Colorful celebration bouquet', 
    44.99, 
    NULL, 
    birthday_id, 
    ARRAY['Birthday', 'Celebration'], 
    '/bouquets/birthday.jpg', 
    true, 
    true
  )
  ON CONFLICT DO NOTHING;
END $$;

-- Get flower and bouquet IDs for bouquet_flowers junction table
DO $$
DECLARE 
  red_rose_id UUID;
  white_lily_id UUID;
  purple_orchid_id UUID;
  sunflower_id UUID;
  pink_carnation_id UUID;
  blue_hydrangea_id UUID;
  
  romantic_roses_id UUID;
  spring_celebration_id UUID;
  white_wedding_id UUID;
  sympathy_arrangement_id UUID;
  birthday_surprise_id UUID;
BEGIN
  -- Get flower IDs
  SELECT id INTO red_rose_id FROM flowers WHERE name = 'Red Rose' LIMIT 1;
  SELECT id INTO white_lily_id FROM flowers WHERE name = 'White Lily' LIMIT 1;
  SELECT id INTO purple_orchid_id FROM flowers WHERE name = 'Purple Orchid' LIMIT 1;
  SELECT id INTO sunflower_id FROM flowers WHERE name = 'Sunflower' LIMIT 1;
  SELECT id INTO pink_carnation_id FROM flowers WHERE name = 'Pink Carnation' LIMIT 1;
  SELECT id INTO blue_hydrangea_id FROM flowers WHERE name = 'Blue Hydrangea' LIMIT 1;
  
  -- Get bouquet IDs
  SELECT id INTO romantic_roses_id FROM bouquets WHERE name = 'Romantic Red Roses' LIMIT 1;
  SELECT id INTO spring_celebration_id FROM bouquets WHERE name = 'Spring Celebration' LIMIT 1;
  SELECT id INTO white_wedding_id FROM bouquets WHERE name = 'White Wedding' LIMIT 1;
  SELECT id INTO sympathy_arrangement_id FROM bouquets WHERE name = 'Sympathy Arrangement' LIMIT 1;
  SELECT id INTO birthday_surprise_id FROM bouquets WHERE name = 'Birthday Surprise' LIMIT 1;

  -- Create bouquet_flowers associations
  INSERT INTO bouquet_flowers (bouquet_id, flower_id, quantity)
  VALUES
  (romantic_roses_id, red_rose_id, 12),
  (spring_celebration_id, sunflower_id, 3),
  (spring_celebration_id, pink_carnation_id, 5),
  (white_wedding_id, white_lily_id, 8),
  (sympathy_arrangement_id, white_lily_id, 6),
  (birthday_surprise_id, sunflower_id, 2),
  (birthday_surprise_id, pink_carnation_id, 3),
  (birthday_surprise_id, purple_orchid_id, 1)
  ON CONFLICT DO NOTHING;
END $$; 