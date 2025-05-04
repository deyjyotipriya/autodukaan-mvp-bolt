/*
  # Initial schema setup for Auto-Dukaan

  1. New Tables
    - sellers
      - id (uuid, primary key)
      - name (text)
      - phone (text, unique)
      - upi_id (text)
      - language (text)
      - created_at (timestamp)
    
    - products
      - id (uuid, primary key)
      - seller_id (uuid, foreign key)
      - name (text, nullable)
      - price (numeric, nullable)
      - image_url (text)
      - source (text)
      - created_at (timestamp)
    
    - orders
      - id (uuid, primary key)
      - seller_id (uuid, foreign key)
      - product_id (uuid, foreign key)
      - customer_name (text)
      - customer_phone (text)
      - customer_address (text)
      - amount (numeric)
      - status (text)
      - transaction_id (text)
      - created_at (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated access
*/

-- Create sellers table
CREATE TABLE IF NOT EXISTS sellers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text UNIQUE NOT NULL,
  upi_id text,
  language text DEFAULT 'en',
  created_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid REFERENCES sellers(id),
  name text,
  price numeric,
  image_url text NOT NULL,
  source text NOT NULL DEFAULT 'manual',
  created_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid REFERENCES sellers(id),
  product_id uuid REFERENCES products(id),
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_address text NOT NULL,
  amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  transaction_id text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Sellers can read own data"
  ON sellers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Products are viewable by everyone"
  ON products
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Sellers can manage their products"
  ON products
  FOR ALL
  TO authenticated
  USING (seller_id = auth.uid());

CREATE POLICY "Orders are viewable by related seller"
  ON orders
  FOR SELECT
  TO authenticated
  USING (seller_id = auth.uid());

CREATE POLICY "Sellers can update their orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (seller_id = auth.uid());