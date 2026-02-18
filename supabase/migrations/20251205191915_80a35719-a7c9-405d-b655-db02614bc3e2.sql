-- Permitir que admins vejam todas as roles de admin e moderator
CREATE POLICY "Admins podem ver roles de administração"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin') 
  AND role IN ('admin', 'moderator')
);