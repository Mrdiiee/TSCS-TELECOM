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


create table if not exists public.package_change_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  order_id uuid references public.orders(id) on delete cascade not null,
  current_plan_name text not null,
  current_speed_mbps integer not null,
  target_plan_id text not null,
  target_plan_name text not null,
  target_speed_mbps integer not null,
  target_amount numeric(12,2) not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz default now(),
  processed_at timestamptz
);

alter table public.package_change_requests enable row level security;

create policy "customers read own package change requests"
on public.package_change_requests for select using (auth.uid() = user_id);

create or replace function public.create_package_change_request(
  p_order_id uuid, p_target_plan_id text, p_target_plan_name text,
  p_target_speed_mbps integer, p_target_amount numeric
)
returns public.package_change_requests
language plpgsql security definer set search_path = public
as $$
declare current_order public.orders; created_request public.package_change_requests;
begin
  select * into current_order from public.orders
  where id=p_order_id and user_id=auth.uid() and status='completed' and payment_status='paid';
  if current_order.id is null then raise exception 'Layanan aktif tidak ditemukan'; end if;
  if p_target_plan_id=current_order.plan_id then raise exception 'Paket tujuan sama dengan paket saat ini'; end if;
  if exists(select 1 from public.package_change_requests where order_id=p_order_id and status='pending') then
    raise exception 'Masih ada pengajuan perubahan paket yang sedang diproses';
  end if;
  insert into public.package_change_requests
    (user_id,order_id,current_plan_name,current_speed_mbps,target_plan_id,target_plan_name,target_speed_mbps,target_amount)
  values
    (auth.uid(),current_order.id,current_order.plan_name,current_order.speed_mbps,p_target_plan_id,p_target_plan_name,p_target_speed_mbps,p_target_amount)
  returning * into created_request;
  return created_request;
end;
$$;

create or replace function public.admin_list_package_change_requests()
returns setof public.package_change_requests
language sql security definer set search_path = public
as $$
  select r.* from public.package_change_requests r
  where coalesce(auth.jwt() -> 'app_metadata' ->> 'role','')='admin'
  order by r.created_at desc;
$$;

create or replace function public.admin_update_package_change_request(p_request_id uuid,p_status text)
returns public.package_change_requests
language plpgsql security definer set search_path = public
as $$
declare req public.package_change_requests; updated_req public.package_change_requests;
begin
  if coalesce(auth.jwt() -> 'app_metadata' ->> 'role','') <> 'admin' then raise exception 'Akses admin diperlukan'; end if;
  if p_status not in ('approved','rejected') then raise exception 'Status pengajuan tidak valid'; end if;
  select * into req from public.package_change_requests where id=p_request_id;
  if req.id is null then raise exception 'Pengajuan tidak ditemukan'; end if;
  if req.status <> 'pending' then raise exception 'Pengajuan sudah diproses'; end if;
  update public.package_change_requests set status=p_status,processed_at=now() where id=p_request_id returning * into updated_req;
  if p_status='approved' then
    update public.orders set plan_id=req.target_plan_id,plan_name=req.target_plan_name,
      speed_mbps=req.target_speed_mbps,amount=req.target_amount where id=req.order_id;
  end if;
  return updated_req;
end;
$$;

revoke all on function public.create_package_change_request(uuid,text,text,integer,numeric) from public;
grant execute on function public.create_package_change_request(uuid,text,text,integer,numeric) to authenticated;
revoke all on function public.admin_list_package_change_requests() from public;
grant execute on function public.admin_list_package_change_requests() to authenticated;
revoke all on function public.admin_update_package_change_request(uuid,text) from public;
grant execute on function public.admin_update_package_change_request(uuid,text) to authenticated;
