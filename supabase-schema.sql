-- Unlimited Topup - Supabase orders table
-- Run this in Supabase SQL Editor, then redeploy the Vercel site.

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  username text not null,
  player_id text not null,
  bundle text not null,
  game text not null,
  item text,
  customer_email text,
  amount numeric(10,2) not null,
  uid text,
  account_username text,
  email text,
  points_earned integer default 0,
  status text default 'pending_payment',
  created_at timestamptz default now()
);

alter table public.orders
add column if not exists customer_email text;

alter table public.orders enable row level security;

drop policy if exists "Anyone can create orders" on public.orders;
create policy "Anyone can create orders"
on public.orders
for insert
to anon, authenticated
with check (
  username is not null
  and player_id is not null
  and customer_email is not null
  and bundle is not null
  and game is not null
  and amount is not null
);

drop policy if exists "Anyone can read orders" on public.orders;
create policy "Anyone can read orders"
on public.orders
for select
to anon, authenticated
using (true);
