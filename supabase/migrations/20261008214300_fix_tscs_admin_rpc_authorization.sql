create or replace function public.is_tscs_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid())
    or coalesce(auth.jwt() -> 'app_metadata' ->> 'role','') = 'admin';
$$;

revoke all on function public.is_tscs_admin() from public;
grant execute on function public.is_tscs_admin() to authenticated;

create or replace function public.admin_list_orders()
returns setof public.orders
language sql security definer set search_path = public
as $$
  select o.* from public.orders o
  where public.is_tscs_admin()
  order by o.created_at desc;
$$;

create or replace function public.admin_update_order_status(p_order_id uuid, p_status text)
returns public.orders
language plpgsql security definer set search_path = public
as $$
declare updated_order public.orders;
begin
  if not public.is_tscs_admin() then raise exception 'Akses admin diperlukan'; end if;
  if p_status not in ('pending','processing','installation','completed','cancelled') then raise exception 'Status pesanan tidak valid'; end if;
  update public.orders set status=p_status where id=p_order_id returning * into updated_order;
  if updated_order.id is null then raise exception 'Pesanan tidak ditemukan'; end if;
  return updated_order;
end;
$$;

create or replace function public.admin_list_package_change_requests()
returns setof public.package_change_requests
language sql security definer set search_path = public
as $$
  select r.* from public.package_change_requests r
  where public.is_tscs_admin()
  order by r.created_at desc;
$$;

create or replace function public.admin_update_package_change_request(p_request_id uuid,p_status text)
returns public.package_change_requests
language plpgsql security definer set search_path = public
as $$
declare req public.package_change_requests; updated_req public.package_change_requests;
begin
  if not public.is_tscs_admin() then raise exception 'Akses admin diperlukan'; end if;
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

create or replace function public.admin_list_products()
returns setof public.products
language sql security definer set search_path = public
as $$
  select p.* from public.products p
  where public.is_tscs_admin()
  order by p.display_order asc, p.created_at asc;
$$;

create or replace function public.admin_upsert_product(
  p_id uuid, p_name text, p_speed_mbps integer, p_price numeric,
  p_category text, p_benefit text, p_installation_fee numeric,
  p_fup text, p_prepaid_enabled boolean, p_postpaid_enabled boolean,
  p_label text, p_display_order integer, p_is_recommended boolean, p_is_active boolean
)
returns public.products
language plpgsql security definer set search_path = public
as $$
declare result_product public.products;
begin
  if not public.is_tscs_admin() then raise exception 'Akses admin diperlukan'; end if;
  if p_id is null then
    insert into public.products(name,speed_mbps,price,category,benefit,installation_fee,fup,prepaid_enabled,postpaid_enabled,label,display_order,is_recommended,is_active)
    values(p_name,p_speed_mbps,p_price,p_category,p_benefit,p_installation_fee,p_fup,p_prepaid_enabled,p_postpaid_enabled,p_label,p_display_order,p_is_recommended,p_is_active)
    returning * into result_product;
  else
    update public.products set name=p_name,speed_mbps=p_speed_mbps,price=p_price,category=p_category,
      benefit=p_benefit,installation_fee=p_installation_fee,fup=p_fup,prepaid_enabled=p_prepaid_enabled,
      postpaid_enabled=p_postpaid_enabled,label=p_label,display_order=p_display_order,
      is_recommended=p_is_recommended,is_active=p_is_active
    where id=p_id returning * into result_product;
  end if;
  if result_product.id is null then raise exception 'Produk tidak ditemukan'; end if;
  return result_product;
end;
$$;
