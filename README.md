# POLI Energia — Dashboard Profissional V9

Dashboard institucional para análise de contas de energia da POLI/UPE, com processamento via backend seguro no Vercel, PDF.js, OCR de fallback e persistência local.

## Referências fixas da POLI

- Área construída: **8.860,00 m²**
- Pessoal + alunos: **2.392 pessoas**
- Endereço: **Rua Prof. Benedito Monteiro, 455**
- Classificação: **A4 - Horo-Sazonal Verde - Poder Público**

## Ajustes da V9

- kWh/m² total e kWh per capita total.
- Consumo faturado/pago em kWh.
- Demanda faturada/paga em kW.
- Multas e impostos: quantidade e valor.
- Iluminação pública separada.
- Ponta (17h30–20h30) e Fora de Ponta exibidas em séries independentes.
- Custo efetivo calculado separadamente para Ponta e Fora de Ponta.
- TE e TUSD separadas por posto tarifário.
- Padronização para **Consumo diário normalizado**.
- Padronização para **Score de prioridade**.
- Síntese executiva calculada pelo dashboard para evitar contradições com a média histórica.
- Tela de conferência ampliada para revisar dados tarifários antes de salvar.
- Identificação da POLI no cabeçalho e ícone de raio no navegador.

## Variáveis no Vercel

Mantenha as variáveis do serviço de análise que já funcionam no seu projeto. Após qualquer alteração, faça um novo deploy.

## Desenvolvimento local

```bash
npm install
vercel dev
```

Abra o endereço informado pelo Vercel CLI, normalmente `http://localhost:3000`.

## Segurança

A credencial do serviço permanece apenas no backend. O PDF original é processado no navegador; apenas o texto extraído é enviado ao endpoint de análise.
