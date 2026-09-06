# UPE Energia — Google Gemini V6

Dashboard acadêmico para análise de contas de energia da Universidade de Pernambuco (UPE), com identidade visual azul, branca e vermelha e análise de faturas via Google Gemini.

## Arquitetura

PDF → pdf.js → OCR local (se necessário) → `/api/analisar-conta` → Google Gemini → conferência → localStorage → dashboard.

O PDF original não é enviado ao Gemini. O navegador extrai o texto e envia somente esse texto ao backend do Vercel.

## Variáveis no Vercel

Em **Project → Settings → Environment Variables**, adicione:

```text
GEMINI_API_KEY = SUA_CHAVE_DO_GOOGLE_AI_STUDIO
GEMINI_MODEL = gemini-2.5-flash
```

`GEMINI_MODEL` é opcional. O projeto usa `gemini-2.5-flash` como padrão.

Depois de alterar as variáveis, faça **Redeploy**.

## Teste do backend

Abra:

```text
https://SEU-SITE.vercel.app/api/health
```

Resultado esperado:

```json
{
  "ok": true,
  "provider": "Google Gemini",
  "model": "gemini-2.5-flash",
  "apiKeyConfigured": true
}
```

## Rodar no VS Code

```bash
npm install
npm install -g vercel
vercel dev
```

Para desenvolvimento local, copie `.env.example` para `.env.local` e coloque uma chave válida.

## Segurança

Nunca use `VITE_GEMINI_API_KEY`. Variáveis `VITE_*` são expostas no navegador. A chave deve ser `GEMINI_API_KEY` e usada somente nas funções em `/api`.

## Recursos

- Upload de PDF e extração com pdf.js.
- OCR local como fallback.
- Análise por Google Gemini.
- Validação separada de kWh e kW.
- Consumo, demanda, valor e média histórica.
- Histórico mensal da própria fatura quando disponível.
- Diagnóstico, alertas e recomendações de economia.
- Simulações e dashboard mensal/anual.
- Persistência em localStorage.
