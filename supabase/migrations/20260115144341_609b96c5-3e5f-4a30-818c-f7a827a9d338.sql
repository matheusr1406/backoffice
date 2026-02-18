-- Remover o índice parcial existente
DROP INDEX IF EXISTS idx_coupon_import_items_external_id;

-- Criar constraint UNIQUE absoluta na coluna external_id
ALTER TABLE coupon_import_items 
ADD CONSTRAINT uq_coupon_import_items_external_id UNIQUE (external_id);