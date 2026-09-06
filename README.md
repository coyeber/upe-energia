# UPE Energia — NVIDIA Nemotron V5

Dashboard acadêmico para análise de contas de energia da Universidade de Pernambuco (UPE), com identidade visual azul, branca e vermelha e análise via NVIDIA NIM / Nemotron.

## Fluxo

PDF → pdf.js → OCR local (se necessário) → `/api/analisar-conta` → NVIDIA Nemotron → conferência → localStorage → dashboard.

A chave da NVIDIA fica **somente no backend**. Não coloque a chave em arquivos dentro de `src/`.

## 1) NVIDIA API

No NVIDIA Build, gere uma API Key para o modelo Nemotron. Este projeto está configurado para:

- URL: `https://integrate.api.nvidia.com/v1/chat/completions`
- Modelo: `nvidia/nemotron-3.5-lightning-30b-a3b`

## 2) Configurar no Vercel

Project → Settings → Environment Variables:

```text
NVIDIA_API_KEY = nvapi-xxxxxxxxxxxxxxxx
NVIDIA_MODEL = nvidia/nemotron-3.5-lightning-30b-a3b
NVIDIA_API_URL = https://integrate.api.nvidia.com/v1/chat/completions
```

`NVIDIA_MODEL` e `NVIDIA_API_URL` são opcionais porque o código já possui esses valores como padrão. A única variável obrigatória é `NVIDIA_API_KEY`.

Depois faça **Redeploy**.

### Teste do backend

Abra:

```text
https://SEU-SITE.vercel.app/api/health
```

O esperado é:

```json
{
  "ok": true,
  "provider": "NVIDIA NIM",
  "model": "nvidia/nemotron-3.5-lightning-30b-a3b",
  "apiKeyConfigured": true
}
```

## 3) Testar localmente

O Vite sozinho não executa as Vercel Functions. A maneira mais fiel é usar Vercel CLI:

```bash
npm install
npm i -g vercel
cp .env.example .env.local
```

Coloque sua chave em `.env.local` e execute:

```bash
vercel dev
```

Normalmente abrirá em `http://localhost:3000`.

## Funcionalidades

- Upload de PDF.
- Extração de texto com pdf.js.
- OCR local com Tesseract.js quando o PDF tiver pouco texto selecionável.
- Extração por NVIDIA Nemotron.
- Conferência manual antes de salvar.
- Consumo em kWh separado de demanda em kW.
- Filtros mensal/anual.
- Gastos e média histórica.
- Histórico de consumo da própria fatura.
- Consumo x média.
- Consumo x demanda.
- Custo médio por kWh.
- Simulador de economia de 5% a 30%.
- Projeção de economia anual.
- Ranking de meses críticos.
- Componentes da fatura.
- Diagnóstico de possíveis causas.
- Plano de ações e oportunidades de economia.
- Alertas de demanda quando existirem dados suficientes.
- Histórico em localStorage.

## Segurança

Nunca use `VITE_NVIDIA_API_KEY`. Variáveis `VITE_*` são expostas ao navegador. A chave deve ser `NVIDIA_API_KEY` e usada somente nas funções em `/api`.

## Correção para `vercel dev`

Esta versão remove o proxy `/api -> localhost:3000` do Vite e o rewrite global para `index.html`, pois ambos interferem no servidor local do Vercel. Para testar localmente:

```bash
npm install
vercel dev
```

Acesse a URL indicada pelo terminal e depois `/api/health`.
