-- Tornar code opcional (nem todos os cupons têm código)
ALTER TABLE public.location_coupons 
ALTER COLUMN code DROP NOT NULL;

-- Política para admins inserirem cupons
CREATE POLICY "Admins can insert location_coupons" 
ON public.location_coupons 
FOR INSERT 
TO authenticated 
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'moderator')
);