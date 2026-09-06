const DEFAULT_URL = 'https://integrate.api.nvidia.com/v1/chat/completions'
const DEFAULT_MODEL = 'nvidia/nemotron-3.5-lightning-30b-a3b'

const schemaHint = `{
  "concessionaria": string|null,
  "unidade_consumidora": string|null,
  "mes_referencia": "YYYY-MM"|null,
  "consumo_kwh": number|null,
  "demanda_kw": number|null,
  "demanda_contratada_kw": number|null,
  "valor_total": number|null,
  "data_vencimento": "YYYY-MM-DD"|null,
  "classe_consumidora": string|null,
  "historico_consumo": [{"mes":"YYYY-MM","kwh":number}],
  "componentes_fatura": [{"nome":string,"valor":number|null,"unidade":string|null}],
  "diagnostico": {
    "resumo": string,
    "causas_provaveis": [string],
    "acoes_prioritarias": [string],
    "oportunidades_economia": [string],
    "alertas": [string]
  },
  "confianca": {"geral":"alta|media|baixa","observacoes":[string]}
}`

function stripCodeFences(value = '') {
  return value.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
}

function normalize(data = {}) {
  const num = (v) => {
    if (v === null || v === undefined || v === '') return null
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
    historico_consumo: arr(data.historico_consumo).map(x => ({ mes: x?.mes ?? null, kwh: num(x?.kwh) })).filter(x => x.mes && x.kwh !== null),
    componentes_fatura: arr(data.componentes_fatura).map(x => ({ nome: x?.nome ?? 'Componente', valor: num(x?.valor), unidade: x?.unidade ?? null })),
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

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido.' })
  if (!process.env.NVIDIA_API_KEY) return res.status(500).json({ error: 'NVIDIA_API_KEY não configurada no Vercel.' })

  const texto = String(req.body?.texto || '').trim()
  if (texto.length < 80) return res.status(400).json({ error: 'O texto extraído do PDF é insuficiente para análise.' })
  if (texto.length > 140000) return res.status(400).json({ error: 'O texto do PDF é grande demais para esta versão do analisador.' })

  const system = `Você é um especialista em contas de energia elétrica brasileiras, gestão energética universitária e eficiência energética.
Sua função é extrair fatos da conta e gerar um diagnóstico técnico conservador.
REGRAS CRÍTICAS:
- Retorne APENAS JSON válido, sem markdown e sem texto antes/depois.
- Nunca invente números.
- Nunca confunda kWh (energia) com kW (demanda/potência).
- Se demanda não estiver explicitamente presente, use null.
- Não trate histórico de consumo como demanda.
- Valores monetários brasileiros devem virar números decimais, por exemplo R$ 1.406,25 => 1406.25.
- Para recomendações, deixe claro que causas são hipóteses quando não puderem ser comprovadas pela fatura.
- Não afirme existência de multa por demanda se a fatura não mostrar isso.
- Preserve meses em YYYY-MM e datas em YYYY-MM-DD.
- Procure histórico mensal de consumo na própria fatura.
- Identifique itens como energia, TUSD, TE, bandeiras, iluminação pública, impostos e demanda quando existirem.
Formato obrigatório:
${schemaHint}`

  const user = `Analise a conta abaixo para o dashboard de energia da Universidade de Pernambuco (UPE). Extraia os dados e produza diagnóstico e oportunidades de economia coerentes com os fatos encontrados.\n\nTEXTO DA FATURA:\n${texto}`

  try {
    const requestBody = {
      model: process.env.NVIDIA_MODEL || DEFAULT_MODEL,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user }
      ],
      // Para extração estruturada, evitamos o reasoning visível do Nemotron.
      // O thinking pode misturar raciocínio ao JSON e tornar a resposta difícil de validar.
      chat_template_kwargs: { enable_thinking: false },
      response_format: { type: 'json_object' },
      temperature: 0.2,
      top_p: 0.95,
      max_tokens: 4096,
      stream: false
    }

    const response = await fetch(process.env.NVIDIA_API_URL || DEFAULT_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    // Lemos como texto primeiro para preservar mensagens de erro não-JSON do gateway NVIDIA.
    const raw = await response.text()
    let payload = {}
    try { payload = raw ? JSON.parse(raw) : {} } catch { payload = { raw } }

    if (!response.ok) {
      const detail = payload?.detail || payload?.message || payload?.error?.message || payload?.error || payload?.raw || `HTTP ${response.status}`
      return res.status(response.status).json({
        error: `NVIDIA NIM (HTTP ${response.status}): ${typeof detail === 'string' ? detail : JSON.stringify(detail)}`
      })
    }

    const content = payload?.choices?.[0]?.message?.content
    if (!content) return res.status(502).json({ error: 'O Nemotron não retornou conteúdo analisável.' })

    let parsed
    try { parsed = JSON.parse(stripCodeFences(content)) }
    catch {
      const first = content.indexOf('{'), last = content.lastIndexOf('}')
      if (first >= 0 && last > first) parsed = JSON.parse(content.slice(first, last + 1))
      else throw new Error('JSON inválido')
    }

    return res.status(200).json({
      ok: true,
      provider: 'NVIDIA NIM',
      model: process.env.NVIDIA_MODEL || DEFAULT_MODEL,
      data: normalize(parsed)
    })
  } catch (error) {
    console.error('Erro Nemotron:', error)
    return res.status(500).json({ error: error?.message || 'Falha ao consultar o NVIDIA Nemotron.' })
  }
}
