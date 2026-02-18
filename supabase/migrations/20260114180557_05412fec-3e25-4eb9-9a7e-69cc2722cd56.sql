-- Add new columns to coupon_import_items for the feed data
ALTER TABLE coupon_import_items ADD COLUMN IF NOT EXISTS external_id text;
ALTER TABLE coupon_import_items ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE coupon_import_items ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE coupon_import_items ADD COLUMN IF NOT EXISTS offer_link text;
ALTER TABLE coupon_import_items ADD COLUMN IF NOT EXISTS image_link text;
ALTER TABLE coupon_import_items ADD COLUMN IF NOT EXISTS original_price numeric;
ALTER TABLE coupon_import_items ADD COLUMN IF NOT EXISTS sale_price numeric;
ALTER TABLE coupon_import_items ADD COLUMN IF NOT EXISTS currency text DEFAULT 'BRL';
ALTER TABLE coupon_import_items ADD COLUMN IF NOT EXISTS availability text;
ALTER TABLE coupon_import_items ADD COLUMN IF NOT EXISTS category_id integer;