-- Adicionar novas colunas à tabela location_coupons
ALTER TABLE public.location_coupons
ADD COLUMN IF NOT EXISTS external_id text,
ADD COLUMN IF NOT EXISTS offer_link text,
ADD COLUMN IF NOT EXISTS image_link text,
ADD COLUMN IF NOT EXISTS original_price numeric,
ADD COLUMN IF NOT EXISTS sale_price numeric,
ADD COLUMN IF NOT EXISTS currency text DEFAULT 'BRL',
ADD COLUMN IF NOT EXISTS availability text,
ADD COLUMN IF NOT EXISTS category_id integer,
ADD COLUMN IF NOT EXISTS original_name text,
ADD COLUMN IF NOT EXISTS import_batch_id uuid REFERENCES public.coupon_import_batches(id);

-- Criar índice para external_id para evitar duplicatas
CREATE INDEX IF NOT EXISTS idx_location_coupons_external_id 
ON public.location_coupons(external_id);

-- Criar índice composto para busca por place_id e status ativo
CREATE INDEX IF NOT EXISTS idx_location_coupons_place_active 
ON public.location_coupons(place_id, is_active);