-- POLI Energia — segurança para cadastro público
-- Execute este arquivo uma vez no SQL Editor após o schema inicial.

-- Usuário comum pode ler o próprio perfil, mas não pode alterar o campo "perfil".
drop policy if exists "perfil proprio atualizacao" on public.profiles;

-- Função segura para verificar administradores sem expor a tabela de perfis.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1
    from public.profiles
    where id = auth.uid()
      and perfil = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- Contas continuam visíveis a usuários autenticados,
-- mas somente o criador ou um admin pode editar/excluir.
drop policy if exists "usuarios autenticados atualizam contas" on public.contas_energia;
create policy "criador ou admin atualiza contas"
on public.contas_energia for update
to authenticated
using (auth.uid() = criado_por or public.is_admin())
with check (auth.uid() = criado_por or public.is_admin());

drop policy if exists "usuarios autenticados excluem contas" on public.contas_energia;
create policy "criador ou admin exclui contas"
on public.contas_energia for delete
to authenticated
using (auth.uid() = criado_por or public.is_admin());
