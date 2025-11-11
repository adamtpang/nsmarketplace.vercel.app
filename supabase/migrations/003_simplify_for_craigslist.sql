-- Simplify schema for Craigslist-style marketplace
-- Run this in your Supabase SQL Editor

-- Add contact and category fields
ALTER TABLE listings ADD COLUMN IF NOT EXISTS seller_name TEXT DEFAULT 'Seller';
ALTER TABLE listings ADD COLUMN IF NOT EXISTS whatsapp TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS telegram TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS available BOOLEAN DEFAULT true;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'other';
ALTER TABLE listings ADD COLUMN IF NOT EXISTS subcategory TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;

-- Update existing listings
UPDATE listings
SET
  seller_name = COALESCE(seller_name, 'Seller'),
  available = COALESCE(available, true),
  category = CASE
    WHEN type = 'sale' THEN 'for-sale'
    WHEN type = 'rent' THEN 'for-sale'
    ELSE 'other'
  END
WHERE seller_name IS NULL OR category IS NULL;

-- Create index for category filtering
CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category);
CREATE INDEX IF NOT EXISTS idx_listings_available ON listings(available);

-- Add view counter function
CREATE OR REPLACE FUNCTION increment_listing_views(listing_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE listings
  SET views = COALESCE(views, 0) + 1
  WHERE id = listing_id;
END;
$$ LANGUAGE plpgsql;
