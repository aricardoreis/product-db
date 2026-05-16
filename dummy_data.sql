-- Dummy seed data for local dev. Loaded after schema.sql by docker-entrypoint-initdb.d.

INSERT INTO public.stores (id, name, address) VALUES
  ('11111111000111', 'Supermercado Central', 'Av. Brasil, 1000 - Centro'),
  ('22222222000122', 'Mercadinho da Esquina', 'Rua das Flores, 250 - Jardim'),
  ('33333333000133', 'Atacado Bom Preço', 'Rodovia BR-101, km 42');

INSERT INTO public.sales (id, date, total, store_id, invoice_url) VALUES
  ('SALE-0001', '2026-05-10 14:32:00', 87.50,  '11111111000111', 'https://example.invoice/0001'),
  ('SALE-0002', '2026-05-12 09:15:00', 42.10,  '22222222000122', 'https://example.invoice/0002'),
  ('SALE-0003', '2026-05-14 18:47:00', 156.30, '33333333000133', 'https://example.invoice/0003');

-- products: explicit ids so we can reference them in price_history
INSERT INTO public.products (id, name, code, amount, type, is_ean) OVERRIDING SYSTEM VALUE VALUES
  (1, 'Arroz Branco 5kg',        '7891234567890', 1,   'UN', true),
  (2, 'Feijão Carioca 1kg',      '7899876543210', 2,   'UN', true),
  (3, 'Leite Integral 1L',       '7891111222233', 6,   'UN', true),
  (4, 'Banana Prata',            NULL,            1.5, 'KG', false),
  (5, 'Detergente Líquido 500ml','7894444555566', 3,   'UN', true);

-- realign the identity sequence so future inserts don't collide
SELECT setval(pg_get_serial_sequence('public.products','id'), (SELECT MAX(id) FROM public.products));

INSERT INTO public.price_history (product_id, sale_id, value, date) VALUES
  (1, 'SALE-0001', 28.90, '2026-05-10'),
  (2, 'SALE-0001', 9.80,  '2026-05-10'),
  (3, 'SALE-0001', 4.95,  '2026-05-10'),
  (4, 'SALE-0002', 6.50,  '2026-05-12'),
  (3, 'SALE-0002', 5.10,  '2026-05-12'),
  (1, 'SALE-0003', 27.50, '2026-05-14'),
  (5, 'SALE-0003', 7.20,  '2026-05-14'),
  (2, 'SALE-0003', 10.40, '2026-05-14');
