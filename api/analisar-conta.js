const DEFAULT_MODEL = 'gemini-2.5-flash'
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models'

function normalize(data = {}) {
  const num = (v) => {
    if (v === null || v === undefined || v === '') return null
    if (typeof v === 'string') {
      const cleaned = v.trim().replace(/R\$\s?/gi, '').replace(/\./g, '').replace(',', '.')
      const n = Number(cleaned)
      return Number.isFinite(n) ? n : null
    }
    const n = Number(v)
    return Number.isFinite(n) ? n : null
  }
  const arr = (v) => Array.isArray(v) ? v : []
  return {
    concessionaria: data.concessionaria ?? null,
    unidade_consumidora: data.unidade_consumidora != null ? String(data.unidade_consumidora) : null,
    mes_referencia: data.mes_referencia ?? null,
    consumo_kwh: num(data.consumo_kwh),
    demanda_kw: num(data.demanda_kw),
    demanda_contratada_kw: num(data.demanda_contratada_kw),
    valor_total: num(data.valor_total),
    data_vencimento: data.data_vencimento ?? null,
    classe_consumidora: data.classe_consumidora ?? null,
    historico_consumo: arr(data.historico_consumo)
      .map(x => ({ mes: x?.mes ?? null, kwh: num(x?.kwh) }))
      .filter(x => x.mes && x.kwh !== null),
    componentes_fatura: arr(data.componentes_fatura)
      .map(x => ({ nome: x?.nome ?? 'Componente', valor: num(x?.valor), unidade: x?.unidade ?? null })),
    diagnostico: {
      resumo: data.diagnostico?.resumo ?? '',
      causas_provaveis: arr(data.diagnostico?.causas_provaveis),
      acoes_prioritarias: arr(data.diagnostico?.acoes_prioritarias),
      oportunidades_economia: arr(data.diagnostico?.oportunidades_economia),
      alertas: arr(data.diagnostico?.alertas)
    },
    confianca: {
      geral: ['alta','media','baixa'].includes(data.confianca?.geral) ? data.confianca.geral : 'media',
      observacoes: arr(data.confianca?.observacoes)
    }
  }
}

function extractText(payload) {
  const parts = payload?.candidates?.[0]?.content?.parts
  if (!Array.isArray(parts)) return ''
  return parts.map(p => p?.text || '').join('').trim()
}

function safeJson(text = '') {
  const clean = String(text).replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
  try { return JSON.parse(clean) } catch {}
  const first = clean.indexOf('{')
  const last = clean.lastIndexOf('}')
  if (first >= 0 && last > first) return JSON.parse(clean.slice(first, last + 1))
  throw new Error('O Gemini não retornou um JSON válido.')
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido.' })

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return res.status(500).json({
      error: 'GEMINI_API_KEY não configurada no Vercel.',
      code: 'GEMINI_KEY_MISSING'
    })
  }

  const texto = String(req.body?.texto || '').trim()
  if (texto.length < 80) return res.status(400).json({ error: 'O texto extraído do PDF é insuficiente para análise.' })
  if (texto.length > 140000) return res.status(400).json({ error: 'O texto do PDF é grande demais para esta versão do analisador.' })

  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL
  const prompt = `Você é um especialista em contas de energia elétrica brasileiras, gestão energética universitária e eficiência energética.
Analise o texto da fatura abaixo para o dashboard de energia da Universidade de Pernambuco (UPE).

REGRAS CRÍTICAS:
- Retorne somente um objeto JSON válido. Não use markdown.
- Nunca invente números ou informações que não estejam na fatura.
- Nunca confunda kWh (energia) com kW (demanda/potência).
- Se demanda ou demanda contratada não aparecer explicitamente, retorne null.
- Não transforme histórico de consumo em demanda.
- Converta valores brasileiros: R$ 1.406,25 deve ser 1406.25.
- Preserve mês de referência como YYYY-MM e vencimento como YYYY-MM-DD quando possível.
- Procure o histórico mensal de consumo existente na própria fatura.
- Em causas e recomendações, diferencie fatos da fatura de hipóteses.
- Não afirme multa por ultrapassagem de demanda sem evidência explícita.

FORMATO DO JSON:
{
  "concessionaria": string|null,
  "unidade_consumidora": string|null,
  "mes_referencia": string|null,
  "consumo_kwh": number|null,
  "demanda_kw": number|null,
  "demanda_contratada_kw": number|null,
  "valor_total": number|null,
  "data_vencimento": string|null,
  "classe_consumidora": string|null,
  "historico_consumo": [{"mes": string, "kwh": number}],
  "componentes_fatura": [{"nome": string, "valor": number|null, "unidade": string|null}],
  "diagnostico": {
    "resumo": string,
    "causas_provaveis": [string],
    "acoes_prioritarias": [string],
    "oportunidades_economia": [string],
    "alertas": [string]
  },
  "confianca": {"geral": "alta"|"media"|"baixa", "observacoes": [string]}
}

TEXTO DA FATURA:
${texto}`

  try {
    const url = `${BASE_URL}/${encodeURIComponent(model)}:generateContent`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json',
          maxOutputTokens: 8192
        }
      })
    })

    const raw = await response.text()
    let payload
    try { payload = raw ? JSON.parse(raw) : {} }
    catch { payload = { raw } }

    if (!response.ok) {
      const detail = payload?.error?.message || payload?.message || payload?.raw || `HTTP ${response.status}`
      console.error('Gemini API error:', response.status, detail)
      return res.status(response.status).json({
        error: `Google Gemini (HTTP ${response.status}): ${detail}`,
        code: payload?.error?.status || `HTTP_${response.status}`
      })
    }

    const finishReason = payload?.candidates?.[0]?.finishReason
    if (finishReason && finishReason !== 'STOP') {
      return res.status(502).json({
        error: `O Gemini encerrou a resposta antes de concluir (${finishReason}). Tente novamente.`
      })
    }

    const content = extractText(payload)
    if (!content) {
      const blockReason = payload?.promptFeedback?.blockReason
      return res.status(502).json({
        error: blockReason
          ? `O Gemini bloqueou a solicitação (${blockReason}).`
          : 'O Gemini não retornou conteúdo analisável.'
      })
    }

    const parsed = safeJson(content)
    return res.status(200).json({
      ok: true,
      provider: 'Google Gemini',
      model,
      data: normalize(parsed)
    })
  } catch (error) {
    console.error('Erro Gemini:', error)
    return res.status(500).json({
      error: `Erro interno ao consultar o Gemini: ${error?.message || 'erro desconhecido'}`
    })
  }
}
