-- Executada no projeto nzplaxmbcgestdsctqwb.
-- As políticas exigem o Firebase ID Token validado pelo Supabase Auth gateway.
alter table public.contas_energia
 add column if not exists firebase_user_id text,
 add column if not exists client_import_key text;

create unique index if not exists contas_energia_firebase_import_uid_idx
 on public.contas_energia(firebase_user_id,client_import_key)
 where client_import_key is not null;

drop policy if exists "usuarios autenticados leem contas" on public.contas_energia;
drop policy if exists "clerk usuario cria conta propria" on public.contas_energia;
drop policy if exists "clerk usuario atualiza conta propria" on public.contas_energia;
drop policy if exists "clerk usuario exclui conta propria" on public.contas_energia;

alter table public.contas_energia enable row level security;
create policy "firebase apenas le suas faturas" on public.contas_energia
 for select to anon, authenticated
 using(firebase_user_id is not null
 and firebase_user_id=(select auth.jwt()->>'sub')
 and (select auth.jwt()->>'iss')='https://securetoken.google.com/poli-energia'
 and (select auth.jwt()->>'aud')='poli-energia');
create policy "firebase apenas insere suas faturas" on public.contas_energia
 for insert to anon, authenticated
 with check(firebase_user_id is not null
 and firebase_user_id=(select auth.jwt()->>'sub')
 and (select auth.jwt()->>'iss')='https://securetoken.google.com/poli-energia'
 and (select auth.jwt()->>'aud')='poli-energia');
create policy "firebase apenas atualiza suas faturas" on public.contas_energia
 for update to anon, authenticated
 using(firebase_user_id is not null
 and firebase_user_id=(select auth.jwt()->>'sub')
 and (select auth.jwt()->>'iss')='https://securetoken.google.com/poli-energia'
 and (select auth.jwt()->>'aud')='poli-energia')
 with check(firebase_user_id is not null
 and firebase_user_id=(select auth.jwt()->>'sub')
 and (select auth.jwt()->>'iss')='https://securetoken.google.com/poli-energia'
 and (select auth.jwt()->>'aud')='poli-energia');
create policy "firebase apenas exclui suas faturas" on public.contas_energia
 for delete to anon, authenticated
 using(firebase_user_id is not null
 and firebase_user_id=(select auth.jwt()->>'sub')
 and (select auth.jwt()->>'iss')='https://securetoken.google.com/poli-energia'
 and (select auth.jwt()->>'aud')='poli-energia');
revoke all on table public.contas_energia from anon,authenticated;
grant select,insert,update,delete on table public.contas_energia to anon,authenticated;
