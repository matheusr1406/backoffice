-- Remove duplicate coupon_import_items, keeping the most recent one for each external_id
DELETE FROM coupon_import_items a
WHERE a.id NOT IN (
    SELECT DISTINCT ON (external_id) id
    FROM coupon_import_items
    WHERE external_id IS NOT NULL
    ORDER BY external_id, updated_at DESC NULLS LAST, created_at DESC NULLS LAST
)
AND a.external_id IS NOT NULL;

-- Create unique partial index on external_id for upsert support
-- Partial index allows NULL values to coexist (only non-null values are unique)
CREATE UNIQUE INDEX idx_coupon_import_items_external_id 
ON coupon_import_items (external_id) 
WHERE external_id IS NOT NULL;