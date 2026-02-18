-- Política para admins verem todas as denúncias
CREATE POLICY "Admins podem ver todas as denúncias"
ON post_reports FOR SELECT
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'moderator'));

-- Política para admins atualizarem status das denúncias
CREATE POLICY "Admins podem atualizar status das denúncias"
ON post_reports FOR UPDATE
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'moderator'));