create extension if not exists "uuid-ossp";

create table if not exists public.cats (
  id uuid primary key default uuid_generate_v4(),
  name text,
  description text,
  photo_url text,
  whatsapp text,
  lat float8,
  lng float8,
  created_at timestamptz default now()
);

insert into storage.buckets (id, name, public)
values ('cat-images', 'cat-images', true)
on conflict (id) do nothing;
