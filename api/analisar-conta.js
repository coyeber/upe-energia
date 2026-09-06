const model = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
const apiKey = process.env.GEMINI_API_KEY;

const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: `
Você é especialista em contas de energia elétrica brasileiras.

Analise o texto da conta e retorne JSON.

Extraia:
- concessionaria
- unidade_consumidora
- mes_referencia
- data_vencimento
- consumo_kwh
- demanda_kw
- demanda_contratada_kw
- valor_total
- historico_consumo
- componentes_fatura
- possiveis_causas_gasto
- recomendacoes_economia

Regras:
- Nunca confunda kWh com kW.
- Se demanda não existir, retorne null.
- Não invente valores.
- Use apenas informações encontradas na conta.

TEXTO:
${textoExtraido}
              `
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            concessionaria: { type: "STRING", nullable: true },
            unidade_consumidora: { type: "STRING", nullable: true },
            mes_referencia: { type: "STRING", nullable: true },
            data_vencimento: { type: "STRING", nullable: true },
            consumo_kwh: { type: "NUMBER", nullable: true },
            demanda_kw: { type: "NUMBER", nullable: true },
            demanda_contratada_kw: { type: "NUMBER", nullable: true },
            valor_total: { type: "NUMBER", nullable: true },
            historico_consumo: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  mes: { type: "STRING" },
                  kwh: { type: "NUMBER" }
                }
              }
            },
            componentes_fatura: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  nome: { type: "STRING" },
                  valor: { type: "NUMBER" }
                }
              }
            },
            possiveis_causas_gasto: {
              type: "ARRAY",
              items: { type: "STRING" }
            },
            recomendacoes_economia: {
              type: "ARRAY",
              items: { type: "STRING" }
            }
          }
        }
      }
    })
  }
);