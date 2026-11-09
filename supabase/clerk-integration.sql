-- Clerk + Supabase para o POLI Energia
-- Mantém as tabelas legadas do Supabase Auth e adiciona a identidade do Clerk.

create table if not exists public.clerk_profiles (
  user_id text primary key,
  nome text,
  perfil text not null default 'visualizador' check (perfil in ('admin','visualizador')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.clerk_profiles enable row level security;

drop policy if exists "clerk usuario le proprio perfil" on public.clerk_profiles;
create policy "clerk usuario le proprio perfil"
on public.clerk_profiles
for select
to authenticated
using ((select auth.jwt()->>'sub') = user_id);

drop policy if exists "clerk usuario cria proprio perfil" on public.clerk_profiles;
create policy "clerk usuario cria proprio perfil"
on public.clerk_profiles
for insert
to authenticated
with check (
  (select auth.jwt()->>'sub') = user_id
  and perfil = 'visualizador'
);

drop policy if exists "clerk usuario atualiza proprio nome" on public.clerk_profiles;
create policy "clerk usuario atualiza proprio nome"
on public.clerk_profiles
for update
to authenticated
using ((select auth.jwt()->>'sub') = user_id)
with check (
  (select auth.jwt()->>'sub') = user_id
  and perfil = 'visualizador'
);

alter table public.contas_energia
  add column if not exists clerk_user_id text;

create index if not exists contas_energia_clerk_user_idx
  on public.contas_energia(clerk_user_id);

drop policy if exists "clerk usuario cria conta propria" on public.contas_energia;
create policy "clerk usuario cria conta propria"
on public.contas_energia
for insert
to authenticated
with check ((select auth.jwt()->>'sub') = clerk_user_id);

drop policy if exists "clerk usuario atualiza conta propria" on public.contas_energia;
create policy "clerk usuario atualiza conta propria"
on public.contas_energia
for update
to authenticated
using ((select auth.jwt()->>'sub') = clerk_user_id)
with check ((select auth.jwt()->>'sub') = clerk_user_id);

drop policy if exists "clerk usuario exclui conta propria" on public.contas_energia;
create policy "clerk usuario exclui conta propria"
on public.contas_energia
for delete
to authenticated
using ((select auth.jwt()->>'sub') = clerk_user_id);
