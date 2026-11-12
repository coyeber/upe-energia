# POLI Energia — V10

Dashboard de acompanhamento energético da Escola Politécnica de Pernambuco (POLI), com foco em leitura simples, navegação por indicador e análise automática das faturas.

## Referências da unidade
- Área construída: **8.860,00 m²**
- Pessoas: **2.392** — referência **2025**
- Endereço: **Rua Prof. Benedito Monteiro, 455**
- Classificação: **A4 Livre Verde - Poder Público**

## Páginas principais
- **Visão geral**: resumo executivo e atalhos clicáveis.
- **Consumo**: histórico mensal, Ponta (17h30–20h30), Fora de Ponta, média anual tracejada, kWh/m² e kWh per capita.
- **Demanda**: um gráfico dedicado apenas à Demanda máxima Ponta e Demanda máxima Fora de Ponta, com demanda contratada tracejada, médias anuais e quadro de ultrapassagens.
- **Uso do sistema (NP/FP)**: quantidades, tarifa NP/FP e valores de fatura por posto tarifário.
- **Enviar conta**: extração automática do PDF; a revisão detalhada é opcional.

## Regras tarifárias
Ponta (NP) e Fora de Ponta (FP) não são misturadas. "Uso Sistema Fio" alimenta a demanda contratada (kW); as demandas máximas medidas dos postos continuam independentes. Os preços das tarifas vêm dos valores explícitos da fatura, não de um custo combinado.

## Variáveis de ambiente
No Vercel:

```text
GEMINI_API_KEY=sua_chave
GEMINI_MODEL=gemini-3.5-flash-lite
```

Essas variáveis ficam apenas no backend e não aparecem na interface do site.

## Desenvolvimento
```bash
npm install
npm run dev
```

Para testar as funções serverless localmente, use `vercel dev`.
