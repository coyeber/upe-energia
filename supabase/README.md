# Login + Supabase — POLI Energia

A base de autenticação já está implementada, mas fica desligada até as variáveis do Vercel serem configuradas.

## 1. Criar o projeto
Crie um projeto no Supabase e aguarde o banco ficar disponível.

## 2. Criar as tabelas
No Supabase, abra **SQL Editor**, cole o conteúdo de `supabase/schema.sql` e execute.

## 3. Criar os usuários
Em **Authentication > Users**, crie os usuários autorizados. Nesta primeira etapa o site não possui cadastro público.

## 4. Vercel
Adicione no projeto:

```text
VITE_AUTH_ENABLED=true
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=SUA_CHAVE_PUBLICA
```

A `VITE_SUPABASE_PUBLISHABLE_KEY` é a Publishable Key usada pelo cliente com RLS. Nunca use `service_role` no frontend.

## 5. Redeploy
Faça um novo deploy. O dashboard passará a exigir login.

## Próxima etapa
Migrar as contas hoje armazenadas em `localStorage` para a tabela `contas_energia`, permitindo que os mesmos dados apareçam em qualquer computador após login.
