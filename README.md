# POLI Energia — V10

Dashboard de acompanhamento energético da Escola Politécnica de Pernambuco (POLI), com foco em leitura simples, navegação por indicador e análise automática das faturas.

## Referências da unidade
- Área construída: **8.860,00 m²**
- Pessoas: **2.392** — referência **2025**
- Endereço: **Rua Prof. Benedito Monteiro, 455**
- Classificação: **A4 - Horo-Sazonal Verde - Poder Público**

## Páginas principais
- **Visão geral**: resumo executivo e atalhos clicáveis.
- **Consumo**: histórico mensal, Ponta (17h30–20h30), Fora de Ponta, média anual tracejada, kWh/m² e kWh per capita.
- **Demanda**: um gráfico dedicado com demanda faturada/paga, limite contratado tracejado, média anual tracejada e quadro de ultrapassagens com valores quando identificados na fatura.
- **TE**: quantidade e custo de Tarifa de Energia, separados em Ponta e Fora de Ponta, com médias anuais tracejadas.
- **TUSD**: quantidade e custo de Tarifa de Uso do Sistema de Distribuição, separados em Ponta e Fora de Ponta, com médias anuais tracejadas.
- **Enviar conta**: extração automática do PDF; a revisão detalhada é opcional.

## Regras tarifárias
Ponta e Fora de Ponta nunca são misturadas. TE e TUSD também permanecem independentes. O custo efetivo de cada componente é calculado apenas com o valor e o kWh correspondentes ao mesmo componente e ao mesmo posto tarifário.

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
