-- Adicionar role de admin para Eduardo Ughini (eughini@gmail.com)
INSERT INTO public.user_roles (user_id, role)
VALUES ('00803975-293c-4ec4-b260-843dde8a9800', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Adicionar role de admin para Bruna Nunes (bruna.nunes@softdesign.com.br)
INSERT INTO public.user_roles (user_id, role)
VALUES ('53204248-2a5e-410b-9f49-bad825336312', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Adicionar role de admin para Matheus Rocha (mr140603@gmail.com)
INSERT INTO public.user_roles (user_id, role)
VALUES ('49d64ba4-9a75-4758-b74f-73ef73d3abea', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;