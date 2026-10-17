-- POLI Energia — estrutura inicial Supabase
-- Execute no SQL Editor do Supabase.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text,
  perfil text not null default 'visualizador' check (perfil in ('admin','visualizador')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contas_energia (
  id uuid primary key default gen_random_uuid(),
  mes_referencia text,
  unidade_consumidora text,
  concessionaria text,
  consumo_kwh numeric,
  valor_total numeric,
  demanda_contratada_kw numeric,
  demanda_maxima_ponta_kw numeric,
  demanda_maxima_fora_ponta_kw numeric,
  dados jsonb not null default '{}'::jsonb,
  criado_por uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists contas_energia_mes_idx on public.contas_energia(mes_referencia desc);

alter table public.profiles enable row level security;
alter table public.contas_energia enable row level security;

drop policy if exists "perfil proprio leitura" on public.profiles;
create policy "perfil proprio leitura"
on public.profiles for select
to authenticated
using (auth.uid() = id);

drop policy if exists "perfil proprio atualizacao" on public.profiles;
create policy "perfil proprio atualizacao"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "usuarios autenticados leem contas" on public.contas_energia;
create policy "usuarios autenticados leem contas"
on public.contas_energia for select
to authenticated
using (true);

drop policy if exists "usuarios autenticados criam contas" on public.contas_energia;
create policy "usuarios autenticados criam contas"
on public.contas_energia for insert
to authenticated
with check (auth.uid() = criado_por);

drop policy if exists "usuarios autenticados atualizam contas" on public.contas_energia;
create policy "usuarios autenticados atualizam contas"
on public.contas_energia for update
to authenticated
using (true)
with check (true);

drop policy if exists "usuarios autenticados excluem contas" on public.contas_energia;
create policy "usuarios autenticados excluem contas"
on public.contas_energia for delete
to authenticated
using (true);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id,nome)
  values (new.id, coalesce(new.raw_user_meta_data->>'nome', split_part(new.email,'@',1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
