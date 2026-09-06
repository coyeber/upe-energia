# UPE Energia — Gemini V8 Electric Premium

Dashboard institucional de análise energética da Universidade de Pernambuco, com identidade visual UPE, Google Gemini via backend seguro do Vercel, PDF.js, OCR de fallback e persistência local.

## Destaques da V8

- Tela de inicialização com **reator elétrico/raio**, progresso e status técnicos.
- Fundo energético discreto com grid, partículas e fluxo de dados.
- Transições animadas entre Visão Geral, Upload, Análises, Relatório e Histórico.
- Microinterações em cards, botões, menu lateral e indicadores.
- Barra superior com status de monitoramento e fluxo visual de energia.
- Upload/processamento com overlay elétrico, etapas, corrente animada e progresso.
- Animações mantidas sutis dentro do dashboard para preservar legibilidade.
- Respeita `prefers-reduced-motion` para acessibilidade.
- Mantém a paleta institucional: azul, branco e vermelho.

## Variáveis no Vercel

Obrigatória:

```env
GEMINI_API_KEY=sua_chave
```

Modelo (use o modelo válido configurado na sua conta):

```env
GEMINI_MODEL=seu_modelo_gemini
```

Depois de alterar variáveis, faça um novo deploy.

## Desenvolvimento local

```bash
npm install
vercel dev
```

Abra o endereço informado pelo Vercel CLI, normalmente `http://localhost:3000`.

## Segurança

A chave Gemini permanece apenas no backend. O PDF original é processado no navegador; apenas o texto extraído é enviado ao endpoint de análise.
