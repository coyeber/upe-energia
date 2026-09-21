# Correção Nemotron — JSON / Thinking

Esta versão corrige o erro `Failed to parse chat completion response` observado no NVIDIA NIM.

Mudanças em `api/analisar-conta.js`:

- `chat_template_kwargs: { enable_thinking: false }` para a etapa de extração estruturada;
- `response_format: { type: 'json_object' }` para forçar JSON válido;
- `stream: false`;
- leitura da resposta como texto antes do `JSON.parse`, preservando erros não-JSON do gateway;
- mensagens de erro agora incluem o código HTTP real da NVIDIA.

## Vercel

Mantenha apenas:

- `NVIDIA_API_KEY`
- `NVIDIA_MODEL=nvidia/nemotron-3.5-lightning-30b-a3b`
- `NVIDIA_API_URL=https://integrate.api.nvidia.com/v1/chat/completions`

Depois faça um Redeploy.
