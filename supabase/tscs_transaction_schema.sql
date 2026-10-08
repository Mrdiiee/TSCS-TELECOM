-- TSCS transaction platform baseline
create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  speed_mbps integer not null,
  price numeric(12,2) not null,
  category text not null,
  benefit text,
  installation_fee numeric(12,2) default 0,
  fup text,
  prepaid_enabled boolean default true,
  postpaid_enabled boolean default true,
  image_url text,
  label text,
  display_order integer default 0,
  is_recommended boolean default false,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  customer_type text not null,
  plan_id text not null,
  plan_name text not null,
  speed_mbps integer not null,
  amount numeric(12,2) not null,
  billing_type text not null check (billing_type in ('prabayar','pascabayar')),
  payment_method text,
  payment_status text default 'pending' check (payment_status in ('pending','paid','failed')),
  status text default 'pending' check (status in ('pending','processing','installation','completed','cancelled')),
  address text,
  latitude double precision,
  longitude double precision,
  created_at timestamptz default now()
);

create table if not exists public.bills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  invoice_number text unique not null,
  amount numeric(12,2) not null,
  period text,
  due_date date,
  status text default 'pending' check (status in ('pending','paid','overdue')),
  created_at timestamptz default now()
);

create table if not exists public.coverage_areas (
  id uuid primary key default gen_random_uuid(),
  region_name text not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.promos (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade,
  title text not null,
  image_url text,
  discount_percent numeric(5,2),
  discount_amount numeric(12,2),
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean default true,
  created_at timestamptz default now()
);

alter table public.orders enable row level security;
alter table public.bills enable row level security;
alter table public.products enable row level security;
alter table public.coverage_areas enable row level security;
alter table public.promos enable row level security;

create policy "customers read own orders" on public.orders for select using (auth.uid() = user_id);
create policy "customers create own orders" on public.orders for insert with check (auth.uid() = user_id);
create policy "customers cancel unpaid orders" on public.orders for update using (auth.uid() = user_id and payment_status = 'pending');

create policy "customers read own bills" on public.bills for select using (auth.uid() = user_id);
create policy "public read active products" on public.products for select using (is_active = true);
create policy "public read active coverage" on public.coverage_areas for select using (is_active = true);
create policy "public read active promos" on public.promos for select using (is_active = true);

insert into public.products (name,speed_mbps,price,category,benefit,display_order,is_recommended)
values
('Basic 5',5,115000,'Basic','Cocok untuk browsing dan kebutuhan ringan.',1,true),
('Family 10',10,200000,'Family','Nyaman untuk keluarga dan beberapa perangkat.',2,true),
('Streaming 15',15,250000,'Streaming','Lebih nyaman untuk streaming dan hiburan rumah.',3,true)
on conflict do nothing;


-- Admin order operations.
-- Access is restricted to users whose Supabase app_metadata role is "admin".
create or replace function public.admin_list_orders()
returns setof public.orders
language sql
security definer
set search_path = public
as $$
  select o.*
  from public.orders o
  where coalesce(auth.jwt() -> 'app_metadata' ->> 'role','') = 'admin'
  order by o.created_at desc;
$$;

create or replace function public.admin_update_order_status(p_order_id uuid, p_status text)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_order public.orders;
begin
  if coalesce(auth.jwt() -> 'app_metadata' ->> 'role','') <> 'admin' then
    raise exception 'Akses admin diperlukan';
  end if;

  if p_status not in ('pending','processing','installation','completed','cancelled') then
    raise exception 'Status pesanan tidak valid';
  end if;

  update public.orders
  set status = p_status
  where id = p_order_id
  returning * into updated_order;

  if updated_order.id is null then
    raise exception 'Pesanan tidak ditemukan';
  end if;

  return updated_order;
end;
$$;

revoke all on function public.admin_list_orders() from public;
grant execute on function public.admin_list_orders() to authenticated;
revoke all on function public.admin_update_order_status(uuid,text) from public;
grant execute on function public.admin_update_order_status(uuid,text) to authenticated;
