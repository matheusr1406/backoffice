-- Create table for import batches (tracks each import session)
CREATE TABLE public.coupon_import_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type text NOT NULL CHECK (source_type IN ('file', 'url')),
  source_name text,
  total_items integer NOT NULL DEFAULT 0,
  auto_matched_count integer NOT NULL DEFAULT 0,
  manual_matched_count integer NOT NULL DEFAULT 0,
  pending_count integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'ready', 'completed', 'cancelled')),
  created_at timestamp with time zone DEFAULT now(),
  created_by uuid REFERENCES public.profiles(id)
);

-- Create table for import items (each location from JSON)
CREATE TABLE public.coupon_import_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  import_batch_id uuid NOT NULL REFERENCES public.coupon_import_batches(id) ON DELETE CASCADE,
  original_name text NOT NULL,
  matched_place_id text,
  matched_place_name text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('auto_matched', 'pending', 'manual_matched', 'skipped')),
  match_confidence numeric,
  suggested_places jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid REFERENCES public.profiles(id)
);

-- Create indexes for performance
CREATE INDEX idx_coupon_import_items_batch ON public.coupon_import_items(import_batch_id);
CREATE INDEX idx_coupon_import_items_status ON public.coupon_import_items(status);
CREATE INDEX idx_coupon_import_batches_status ON public.coupon_import_batches(status);

-- Enable RLS
ALTER TABLE public.coupon_import_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_import_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for batches
CREATE POLICY "Admins and moderators can view all batches"
ON public.coupon_import_batches FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE POLICY "Admins and moderators can insert batches"
ON public.coupon_import_batches FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE POLICY "Admins and moderators can update batches"
ON public.coupon_import_batches FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE POLICY "Admins and moderators can delete batches"
ON public.coupon_import_batches FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

-- RLS Policies for items
CREATE POLICY "Admins and moderators can view all items"
ON public.coupon_import_items FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE POLICY "Admins and moderators can insert items"
ON public.coupon_import_items FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE POLICY "Admins and moderators can update items"
ON public.coupon_import_items FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE POLICY "Admins and moderators can delete items"
ON public.coupon_import_items FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

-- Trigger for updated_at on items
CREATE TRIGGER update_coupon_import_items_updated_at
BEFORE UPDATE ON public.coupon_import_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();