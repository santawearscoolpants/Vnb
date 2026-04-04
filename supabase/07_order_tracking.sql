-- VNB order tracking and fulfillment communication fields
-- Run after 01_core.sql, 02_rls.sql, and 03_checkout.sql

alter table public.orders
  add column if not exists tracking_carrier text not null default '',
  add column if not exists tracking_number text not null default '',
  add column if not exists tracking_url text not null default '',
  add column if not exists status_note text not null default '',
  add column if not exists shipped_at timestamptz,
  add column if not exists delivered_at timestamptz,
  add column if not exists estimated_delivery_date date;

create index if not exists idx_orders_tracking_number on public.orders(tracking_number);
create index if not exists idx_orders_status_updated_at on public.orders(status, updated_at desc);
