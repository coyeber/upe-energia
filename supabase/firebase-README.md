# Firebase Authentication + Supabase (contas de energia)

- Login, cadastro e recuperação são feitos no Firebase `poli-energia`.
- Faturas são gravadas na tabela `public.contas_energia`, uma por registro, com o UID Firebase em `firebase_user_id`.
- O conteúdo completo da análise do PDF vai em `dados` (JSONB). O PDF original não é enviado para armazenamento.
- O cliente Supabase usa `accessToken` com `firebaseAuth.currentUser.getIdToken()`.
- RLS restringe leitura, criação, edição e exclusão usando `sub`, `iss` e `aud`; nenhuma política antiga de leitura global permanece.
- A instância hospedada do Supabase **precisa ter a integração Firebase Third-Party Auth configurada** com Project ID `poli-energia` em Authentication → Third-Party Auth.
- O Firebase ID Token padrão não possui o claim `role`; o banco aceita a role `anon` **apenas** quando a token JWT foi validada e bate com emissor, audiência e UID. Tokens sem autenticação não satisfazem as políticas.
- Contas antigas no localStorage são somente backup e não aparecem como registros do usuário. Um botão explícito permite importar as contas para o usuário autenticado após confirmação.
- A importação é idempotente por `(firebase_user_id, client_import_key)`; não apaga arquivos locais.
- Nenhum dado local é vinculado automaticamente a um usuário diferente.
- Se o Supabase falhar, o site informa erro; nunca afirma que salvou quando a operação falhar.
