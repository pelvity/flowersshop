-- Add delivery_price to store_settings if it doesn't exist
INSERT INTO store_settings (id, key, value, description, created_at, updated_at)
SELECT 
  uuid_generate_v4(), 
  'delivery_price', 
  '0', 
  'Standard delivery price for orders', 
  NOW(), 
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM store_settings WHERE key = 'delivery_price'
);

-- Ensure delivery_price is a numeric value
UPDATE store_settings
SET 
  value = '0',
  description = 'Standard delivery price for orders',
  updated_at = NOW()
WHERE key = 'delivery_price' AND NOT (value ~ '^[0-9]+(\.[0-9]+)?$'); 