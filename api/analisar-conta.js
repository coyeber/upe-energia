const DEFAULT_MODEL = 'gemini-2.5-flash'
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models'

const asNumber = (v) => {
  if (v === null || v === undefined || v === '') return null
  if (typeof v === 'string') {
    let s = v.trim().replace(/R\$\s?/gi, '').replace(/\s/g, '')
    if (s.includes(',') && s.includes('.')) s = s.replace(/\./g, '').replace(',', '.')
    else if (s.includes(',')) s = s.replace(',', '.')
    const x = Number(s)
    return Number.isFinite(x) ? x : null
  }
  const x = Number(v)
  return Number.isFinite(x) ? x : null
}
const arr = v => Array.isArray(v) ? v : []
const text = v => v === null || v === undefined || v === '' ? null : String(v)

function normalize(data = {}) {
  return {
    concessionaria: text(data.concessionaria),
    unidade_consumidora: text(data.unidade_consumidora),
    mes_referencia: text(data.mes_referencia),
    data_emissao: text(data.data_emissao),
    data_vencimento: text(data.data_vencimento),
    periodo_leitura_inicio: text(data.periodo_leitura_inicio),
    periodo_leitura_fim: text(data.periodo_leitura_fim),
    proxima_leitura: text(data.proxima_leitura),
    dias_faturados: asNumber(data.dias_faturados),
    leitura_anterior: asNumber(data.leitura_anterior),
    leitura_atual: asNumber(data.leitura_atual),
    consumo_kwh: asNumber(data.consumo_kwh),
    demanda_kw: asNumber(data.demanda_kw),
    demanda_contratada_kw: asNumber(data.demanda_contratada_kw),
    valor_total: asNumber(data.valor_total),
    classe_consumidora: text(data.classe_consumidora),
    tipo_fornecimento: text(data.tipo_fornecimento),
    bandeira_tarifaria: text(data.bandeira_tarifaria),
    historico_consumo: arr(data.historico_consumo)
      .map(x => ({ mes: text(x?.mes), kwh: asNumber(x?.kwh), dias: asNumber(x?.dias) }))
      .filter(x => x.mes && x.kwh !== null),
    componentes_fatura: arr(data.componentes_fatura)
      .map(x => ({ nome: text(x?.nome) || 'Componente', valor: asNumber(x?.valor), unidade: text(x?.unidade), quantidade: asNumber(x?.quantidade) })),
    diagnostico: {
      resumo: text(data.diagnostico?.resumo) || '',
      leitura_executiva: text(data.diagnostico?.leitura_executiva) || '',
      causas_provaveis: arr(data.diagnostico?.causas_provaveis).map(String),
      acoes_prioritarias: arr(data.diagnostico?.acoes_prioritarias).map(String),
      oportunidades_economia: arr(data.diagnostico?.oportunidades_economia).map(String),
      alertas: arr(data.diagnostico?.alertas).map(String),
      observacoes_tecnicas: arr(data.diagnostico?.observacoes_tecnicas).map(String)
    },
    confianca: {
      geral: ['alta','media','baixa'].includes(String(data.confianca?.geral || '').toLowerCase()) ? String(data.confianca.geral).toLowerCase() : 'media',
      observacoes: arr(data.confianca?.observacoes).map(String)
    }
  }
}

function extractText(payload) {
  const parts = payload?.candidates?.[0]?.content?.parts
  if (!Array.isArray(parts)) return ''
  return parts.map(p => p?.text || '').join('').trim()
}

function safeJson(value = '') {
  const clean = String(value).replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
  try { return JSON.parse(clean) } catch {}
  const first = clean.indexOf('{'), last = clean.lastIndexOf('}')
  if (first >= 0 && last > first) return JSON.parse(clean.slice(first, last + 1))
  throw new Error('O Gemini não retornou JSON válido.')
}

function normalizeModel(value) {
  return String(value || DEFAULT_MODEL).trim().replace(/^models\//i, '').replace(/^\/+/, '')
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido.' })

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY não configurada no Vercel.', code: 'GEMINI_KEY_MISSING' })

  const texto = String(req.body?.texto || '').trim()
  if (texto.length < 80) return res.status(400).json({ error: 'O texto extraído do PDF é insuficiente para análise.' })
  if (texto.length > 160000) return res.status(400).json({ error: 'O texto do PDF é grande demais. Divida o documento ou reduza páginas anexas.' })

  const model = normalizeModel(process.env.GEMINI_MODEL)
  const prompt = `Você é um engenheiro de energia e analista financeiro especializado em contas de energia elétrica brasileiras e gestão energética universitária.
O objetivo é extrair dados confiáveis de uma fatura para o Dashboard UPE Energia da Universidade de Pernambuco.

REGRAS OBRIGATÓRIAS:
- Retorne SOMENTE um objeto JSON válido, sem markdown e sem comentários fora do JSON.
- Nunca invente números, datas, demanda, tarifas ou cobranças.
- kWh é energia; kW é demanda/potência. Nunca misture as grandezas.
- Se demanda medida/contratada não estiver explícita, use null.
- Converta moeda brasileira corretamente: R$ 1.406,25 => 1406.25.
- Datas devem ser YYYY-MM-DD quando identificáveis. Referência deve ser YYYY-MM.
- Extraia TODO o histórico mensal de consumo existente na fatura, não apenas o mês principal.
- Se o histórico trouxer número de dias por mês, capture também.
- Identifique datas de leitura, dias faturados, próxima leitura, leitura anterior e atual quando existirem.
- Em causas prováveis, escreva como hipótese quando a fatura não provar a causa física.
- Não afirme multa por demanda, fator de potência, energia reativa ou ultrapassagem sem evidência explícita.
- Recomendações devem ser úteis para campus universitário: climatização, horários de uso, iluminação, equipamentos, demanda, manutenção e gestão, mas separar claramente recomendações gerais de fatos observados.

JSON ESPERADO:
{
  "concessionaria": string|null,
  "unidade_consumidora": string|null,
  "mes_referencia": string|null,
  "data_emissao": string|null,
  "data_vencimento": string|null,
  "periodo_leitura_inicio": string|null,
  "periodo_leitura_fim": string|null,
  "proxima_leitura": string|null,
  "dias_faturados": number|null,
  "leitura_anterior": number|null,
  "leitura_atual": number|null,
  "consumo_kwh": number|null,
  "demanda_kw": number|null,
  "demanda_contratada_kw": number|null,
  "valor_total": number|null,
  "classe_consumidora": string|null,
  "tipo_fornecimento": string|null,
  "bandeira_tarifaria": string|null,
  "historico_consumo": [{"mes":"YYYY-MM","kwh":number,"dias":number|null}],
  "componentes_fatura": [{"nome":string,"valor":number|null,"unidade":string|null,"quantidade":number|null}],
  "diagnostico": {
    "resumo": string,
    "leitura_executiva": string,
    "causas_provaveis": [string],
    "acoes_prioritarias": [string],
    "oportunidades_economia": [string],
    "alertas": [string],
    "observacoes_tecnicas": [string]
  },
  "confianca": {"geral":"alta"|"media"|"baixa","observacoes":[string]}
}

TEXTO EXTRAÍDO DA FATURA:
${texto}`

  try {
    const url = `${BASE_URL}/${model}:generateContent`
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.05, responseMimeType: 'application/json', maxOutputTokens: 10000 }
      })
    })

    const raw = await response.text()
    let payload = {}
    try { payload = raw ? JSON.parse(raw) : {} } catch { payload = { raw } }

    if (!response.ok) {
      const detail = payload?.error?.message || payload?.message || payload?.raw || `HTTP ${response.status}`
      console.error('Gemini API error:', response.status, detail)
      return res.status(response.status).json({ error: `Google Gemini (HTTP ${response.status}): ${detail}`, code: payload?.error?.status || `HTTP_${response.status}` })
    }

    const finishReason = payload?.candidates?.[0]?.finishReason
    if (finishReason && finishReason !== 'STOP') return res.status(502).json({ error: `O Gemini encerrou a resposta antes de concluir (${finishReason}). Tente novamente.` })

    const content = extractText(payload)
    if (!content) {
      const reason = payload?.promptFeedback?.blockReason
      return res.status(502).json({ error: reason ? `O Gemini bloqueou a solicitação (${reason}).` : 'O Gemini não retornou conteúdo analisável.' })
    }

    const parsed = safeJson(content)
    return res.status(200).json({ ok: true, provider: 'Google Gemini', model, data: normalize(parsed) })
  } catch (error) {
    console.error('Erro Gemini:', error)
    return res.status(500).json({ error: `Erro interno ao consultar o Gemini: ${error?.message || 'erro desconhecido'}` })
  }
}
