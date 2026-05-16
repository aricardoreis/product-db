-- Reordered from Supabase schema visualizer export: stores → products → sales → price_history
CREATE TABLE public.stores (
  id character varying NOT NULL,
  name character varying,
  address character varying,
  CONSTRAINT stores_pkey PRIMARY KEY (id)
);

CREATE TABLE public.products (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  name character varying NOT NULL,
  code character varying,
  amount numeric,
  type character varying,
  is_ean boolean,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT products_pkey PRIMARY KEY (id)
);

CREATE TABLE public.sales (
  id character varying NOT NULL,
  date timestamp without time zone NOT NULL,
  total numeric,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  store_id character varying,
  invoice_url text,
  CONSTRAINT sales_pkey PRIMARY KEY (id),
  CONSTRAINT sales_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id)
);

CREATE TABLE public.price_history (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  product_id bigint NOT NULL,
  sale_id character varying,
  value numeric NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  date date NOT NULL,
  CONSTRAINT price_history_pkey PRIMARY KEY (id),
  CONSTRAINT price_history_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id),
  CONSTRAINT price_history_sale_id_fkey FOREIGN KEY (sale_id) REFERENCES public.sales(id)
);
