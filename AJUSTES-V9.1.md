# Ajustes V9.1 — Tarifas separadas

## Regra central

O dashboard não calcula mais um custo efetivo global da fatura para análise tarifária.

Ponta e Fora de Ponta são tratadas como postos independentes. Dentro de cada posto, TE e TUSD também são componentes independentes.

### Custos efetivos

- TE Ponta = valor TE Ponta / quantidade TE Ponta (kWh)
- TUSD Ponta = valor TUSD Ponta / quantidade TUSD Ponta (kWh)
- TE Fora de Ponta = valor TE Fora de Ponta / quantidade TE Fora de Ponta (kWh)
- TUSD Fora de Ponta = valor TUSD Fora de Ponta / quantidade TUSD Fora de Ponta (kWh)

Quando a fatura não informa uma quantidade própria de TE/TUSD, o sistema usa o consumo do próprio posto como denominador. Ponta nunca é usada como denominador de Fora de Ponta e vice-versa.

## Novos gráficos separados

- kWh/m² total
- kWh per capita total
- kWh (consumo) pago
- Quantidade de kW (demanda) paga
- Quantidade de multas e impostos
- Valores de multas e impostos
- Iluminação pública
- Consumo Ponta x Fora de Ponta
- TE Ponta x TE Fora de Ponta
- TUSD Ponta x TUSD Fora de Ponta
- Custos efetivos TE/TUSD por posto

## Padronização

- “Consumo diário normalizado” em todas as telas.
- “Score de prioridade” em todas as telas.
- A síntese executiva é calculada a partir do desvio real da média histórica e não utiliza texto contraditório do diagnóstico automático.
