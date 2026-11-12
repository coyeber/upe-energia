const DEFAULT_MODEL = 'gemini-3.5-flash-lite'
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
const moneyItems = v => arr(v).map(x=>({descricao:text(x?.descricao)||'Item',valor:asNumber(x?.valor)})).filter(x=>x.valor!==null)
const tariff = v => ({
  consumo_kwh: asNumber(v?.consumo_kwh),
  demanda_maxima_kw: asNumber(v?.demanda_maxima_kw),
  tusd_consumo_kwh: asNumber(v?.tusd_consumo_kwh),
  tusd_valor: asNumber(v?.tusd_valor),
  tusd_tarifa: asNumber(v?.tusd_tarifa)
})

const positiveNumber=v=>{
  const value=asNumber(v)
  return value!==null&&value>0?value:null
}

// A quantidade em kW da linha Uso Sistema Fio corresponde ao limite contratado.
function reconcileInvoiceReading(data={}){
  const components=arr(data.componentes_fatura)
  const fio=components.find(item=>/uso\s*(?:sistema|sist\.?)\s*fio\b/i.test(String(item?.nome||'')))
  const fioKw=fio&&/\bkw\b/i.test(String(fio.unidade||'kW'))?positiveNumber(fio.quantidade):null
  const contracted=fioKw??positiveNumber(data.demanda_contratada_kw)??positiveNumber(data.demanda_kw)
  const current=data.tarifas_horarias||{}
  const byPost=(slot,post)=>{
    const next={...slot}
    const suffix=post==='ponta'?'NP':'FP'
    const pattern=post==='ponta'?/uso\s*(?:sistema|sist\.?)\s*(?:encar\.?|energ\.?|energia|encargos)\s*\.?\s*n\.?p\b/i:/uso\s*(?:sistema|sist\.?)\s*(?:encar\.?|energ\.?|energia|encargos)\s*\.?\s*f\.?p\b/i
    const line=components.find(item=>pattern.test(String(item?.nome||'')))
    if(line){
      if(next.tusd_consumo_kwh==null&&/kwh/i.test(String(line.unidade||'')))next.tusd_consumo_kwh=asNumber(line.quantidade)
      if(next.tusd_valor==null)next.tusd_valor=asNumber(line.valor)
    }
    return next
  }
  return {...data,demanda_contratada_kw:contracted,tarifas_horarias:{
    ...current,ponta:byPost(current.ponta||{},'ponta'),fora_ponta:byPost(current.fora_ponta||{},'fora_ponta')
  }}
}

function normalize(data = {}) {
  const multas=moneyItems(data.multas), impostos=moneyItems(data.impostos)
  const multasTotal=asNumber(data.multas_total) ?? (multas.length?multas.reduce((s,x)=>s+x.valor,0):null)
  const impostosTotal=asNumber(data.impostos_total) ?? (impostos.length?impostos.reduce((s,x)=>s+x.valor,0):null)
  return {
    concessionaria: text(data.concessionaria), unidade_consumidora: text(data.unidade_consumidora), mes_referencia: text(data.mes_referencia),
    data_emissao: text(data.data_emissao), data_vencimento: text(data.data_vencimento), periodo_leitura_inicio: text(data.periodo_leitura_inicio),
    periodo_leitura_fim: text(data.periodo_leitura_fim), proxima_leitura: text(data.proxima_leitura), dias_faturados: asNumber(data.dias_faturados),
    leitura_anterior: asNumber(data.leitura_anterior), leitura_atual: asNumber(data.leitura_atual), consumo_kwh: asNumber(data.consumo_kwh),
    consumo_faturado_kwh: asNumber(data.consumo_faturado_kwh), demanda_contratada_kw: positiveNumber(data.demanda_contratada_kw) ?? positiveNumber(data.demanda_kw),
    demanda_ultrapassagem_kw: asNumber(data.demanda_ultrapassagem_kw), demanda_ultrapassagem_valor: asNumber(data.demanda_ultrapassagem_valor),
    valor_total: asNumber(data.valor_total), classe_consumidora: text(data.classe_consumidora), tipo_fornecimento: text(data.tipo_fornecimento),
    bandeira_tarifaria: text(data.bandeira_tarifaria), iluminacao_publica_valor: asNumber(data.iluminacao_publica_valor),
    multas, multas_total: multasTotal, impostos, impostos_total: impostosTotal,
    tarifas_horarias: { ponta: tariff(data.tarifas_horarias?.ponta), fora_ponta: tariff(data.tarifas_horarias?.fora_ponta) },
    historico_consumo: arr(data.historico_consumo).map(x=>({mes:text(x?.mes),kwh:asNumber(x?.kwh),dias:asNumber(x?.dias)})).filter(x=>x.mes&&x.kwh!==null),
    historico_demanda: arr(data.historico_demanda).map(x=>({mes:text(x?.mes),demanda_faturada_kw:asNumber(x?.demanda_faturada_kw),demanda_contratada_kw:asNumber(x?.demanda_contratada_kw),demanda_maxima_ponta_kw:asNumber(x?.demanda_maxima_ponta_kw),demanda_maxima_fora_ponta_kw:asNumber(x?.demanda_maxima_fora_ponta_kw),ultrapassagem_kw:asNumber(x?.ultrapassagem_kw),ultrapassagem_valor:asNumber(x?.ultrapassagem_valor)})).filter(x=>x.mes),
    campos_extras: arr(data.campos_extras).map(x=>({nome:text(x?.nome)||'Campo',valor:text(x?.valor),unidade:text(x?.unidade)})),
    componentes_fatura: arr(data.componentes_fatura).map(x=>({nome:text(x?.nome)||'Componente',valor:asNumber(x?.valor),unidade:text(x?.unidade),quantidade:asNumber(x?.quantidade)})),
    diagnostico: {
      resumo:text(data.diagnostico?.resumo)||'', leitura_executiva:text(data.diagnostico?.leitura_executiva)||'',
      causas_provaveis:arr(data.diagnostico?.causas_provaveis).map(String), acoes_prioritarias:arr(data.diagnostico?.acoes_prioritarias).map(String),
      oportunidades_economia:arr(data.diagnostico?.oportunidades_economia).map(String), alertas:arr(data.diagnostico?.alertas).map(String),
      observacoes_tecnicas:arr(data.diagnostico?.observacoes_tecnicas).map(String)
    },
    confianca:{geral:['alta','media','baixa'].includes(String(data.confianca?.geral||'').toLowerCase())?String(data.confianca.geral).toLowerCase():'media',observacoes:arr(data.confianca?.observacoes).map(String)}
  }
}

function extractText(payload){const parts=payload?.candidates?.[0]?.content?.parts;return Array.isArray(parts)?parts.map(p=>p?.text||'').join('').trim():''}
function repairJsonText(value=''){
  return String(value)
    .replace(/:\s*-(?=\s*[,}\]])/g,': null')
    .replace(/([,\[])\s*-(?=\s*[,}\]])/g,'$1 null')
    .replace(/:\s*(?:NaN|undefined|Infinity|-Infinity)(?=\s*[,}\]])/g,': null')
    .replace(/([,\[])\s*(?:NaN|undefined|Infinity|-Infinity)(?=\s*[,}\]])/g,'$1 null')
    .replace(/,\s*([}\]])/g,'$1')
}
function safeJson(value=''){
  const clean=String(value).replace(/^\`\`\`(?:json)?\s*/i,'').replace(/\s*\`\`\`$/i,'').trim()
  const first=clean.indexOf('{'),last=clean.lastIndexOf('}')
  const candidates=[clean]
  if(first>=0&&last>first&&!(first===0&&last===clean.length-1))candidates.push(clean.slice(first,last+1))
  for(const candidate of candidates){
    try{return JSON.parse(candidate)}catch{}
    try{return JSON.parse(repairJsonText(candidate))}catch{}
  }
  throw new Error('A análise retornou dados em formato incompleto. Tente novamente.')
}
function normalizeModel(value){return String(value||DEFAULT_MODEL).trim().replace(/^models\//i,'').replace(/^\/+/, '')}

export default async function handler(req,res){
  if(req.method!=='POST')return res.status(405).json({error:'Método não permitido.'})
  const apiKey=process.env.GEMINI_API_KEY
  if(!apiKey)return res.status(500).json({error:'Serviço de análise não configurado no servidor.',code:'ANALYSIS_CONFIG_MISSING'})
  const texto=String(req.body?.texto||'').trim()
  if(texto.length<80)return res.status(400).json({error:'O texto extraído do PDF é insuficiente para análise.'})
  if(texto.length>160000)return res.status(400).json({error:'O texto do PDF é grande demais. Divida o documento ou reduza páginas anexas.'})
  const model=normalizeModel(process.env.GEMINI_MODEL)
  const prompt=`Você é um analista técnico especializado em faturas de energia elétrica brasileiras do Grupo A e gestão energética de prédios públicos.
Extraia com máxima fidelidade os dados da conta da POLI (Escola Politécnica de Pernambuco).

REGRAS OBRIGATÓRIAS:
- Retorne SOMENTE JSON válido, sem markdown. Nunca invente valores. Campo não encontrado = null.
- Valores monetários em número decimal; datas YYYY-MM-DD; referência YYYY-MM.
- A unidade é A4 Horo-Sazonal Verde — Poder Público.
- PONTA (NP/P) = 17h30 às 20h30; FORA DE PONTA (FP) = demais horários. Não misture os postos.
- USO SISTEMA FIO: corresponde à DEMANDA CONTRATADA, em kW. Extraia a quantidade da linha "Uso Sistema Fio", e NÃO o valor R$ da linha. Coloque APENAS em demanda_contratada_kw. Se aparecer "Demanda geral" representando a mesma quantidade, use-a como fallback contratada. NÃO atribua essa quantidade a demanda máxima medida.
- Demanda máxima do posto: apenas a medida real de cada posto (em kW), em tarifas_horarias.ponta.demanda_maxima_kw e tarifas_horarias.fora_ponta.demanda_maxima_kw. Se não estiver discriminada, use null.
- USO SISTEMA ENCAR. NP, USO SIST. ENCAR. NP, USO SISTEMA ENERG. NP: são os itens de distribuição em PONTA. A QUANTIDADE em kWh da linha -> tusd_consumo_kwh; a tarifa/preço unitário "Tarifa NP" (R$/kWh) -> tusd_tarifa; o valor monetário "Valor da fatura NP" -> tusd_valor.
- USO SISTEMA ENCAR. FP, USO SIST. ENCAR. FP, USO SISTEMA ENERG. FP: são os itens de distribuição em FORA DE PONTA. A QUANTIDADE em kWh -> tusd_consumo_kwh; "Tarifa FP" -> tusd_tarifa; "Valor da fatura FP" -> tusd_valor.
- A linha Uso Sistema Fio é em kW e não pode entrar nos campos de quantidade de energia TUSD (kWh).
- O consumo de cada posto deve ser extraído independentemente e não deve ser inferido da demanda.
- Não extraia ou crie campos de outros componentes tarifários que não estejam neste esquema. As contas analisadas informam TUSD, demanda, impostos e iluminação pública.
- Extraia separadamente impostos (R$), multas (R$) e iluminação pública (R$); não trate ausência de valor como zero.
- Preserve o nome/quantidade/unidade/valor das linhas originais em componentes_fatura para auditoria.
- Extraia TODO o histórico de consumo mensal e, se existir, os valores de demanda contratada e demanda máxima por posto no histórico.
- Os diagnósticos devem ser factuais; não afirmar comparação com média histórica, nem ultrapassagem sem evidência explícita.

JSON ESPERADO:
{
 "concessionaria":string|null,"unidade_consumidora":string|null,"mes_referencia":string|null,"data_emissao":string|null,"data_vencimento":string|null,
 "periodo_leitura_inicio":string|null,"periodo_leitura_fim":string|null,"proxima_leitura":string|null,"dias_faturados":number|null,"leitura_anterior":number|null,"leitura_atual":number|null,
 "consumo_kwh":number|null,"consumo_faturado_kwh":number|null,"demanda_contratada_kw":number|null,"demanda_ultrapassagem_kw":number|null,"demanda_ultrapassagem_valor":number|null,"valor_total":number|null,
 "classe_consumidora":string|null,"tipo_fornecimento":string|null,"bandeira_tarifaria":string|null,"iluminacao_publica_valor":number|null,
 "multas":[{"descricao":string,"valor":number}],"multas_total":number|null,"impostos":[{"descricao":string,"valor":number}],"impostos_total":number|null,
 "tarifas_horarias":{
   "ponta":{"consumo_kwh":number|null,"demanda_maxima_kw":number|null,"tusd_consumo_kwh":number|null,"tusd_valor":number|null,"tusd_tarifa":number|null},
   "fora_ponta":{"consumo_kwh":number|null,"demanda_maxima_kw":number|null,"tusd_consumo_kwh":number|null,"tusd_valor":number|null,"tusd_tarifa":number|null}
 },
 "historico_consumo":[{"mes":"YYYY-MM","kwh":number,"dias":number|null}],
 "historico_demanda":[{"mes":"YYYY-MM","demanda_contratada_kw":number|null,"demanda_maxima_ponta_kw":number|null,"demanda_maxima_fora_ponta_kw":number|null,"ultrapassagem_kw":number|null,"ultrapassagem_valor":number|null}],
 "campos_extras":[{"nome":string,"valor":string|null,"unidade":string|null}],
 "componentes_fatura":[{"nome":string,"valor":number|null,"unidade":string|null,"quantidade":number|null}],
 "diagnostico":{"resumo":string,"leitura_executiva":string,"causas_provaveis":[string],"acoes_prioritarias":[string],"oportunidades_economia":[string],"alertas":[string],"observacoes_tecnicas":[string]},
 "confianca":{"geral":"alta"|"media"|"baixa","observacoes":[string]}
}

TEXTO DA FATURA:\n${texto}`
  try{
    const response=await fetch(`${BASE_URL}/${model}:generateContent`,{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':apiKey},body:JSON.stringify({contents:[{role:'user',parts:[{text:prompt}]}],generationConfig:{temperature:.03,responseMimeType:'application/json',maxOutputTokens:12000}})})
    const raw=await response.text();let payload={};try{payload=raw?JSON.parse(raw):{}}catch{payload={raw}}
    if(!response.ok){const detail=payload?.error?.message||payload?.message||payload?.raw||`HTTP ${response.status}`;console.error('Erro do serviço de análise:',response.status,detail);return res.status(response.status).json({error:`Serviço de análise (HTTP ${response.status}): ${detail}`,code:payload?.error?.status||`HTTP_${response.status}`})}
    const finishReason=payload?.candidates?.[0]?.finishReason;if(finishReason&&finishReason!=='STOP')return res.status(502).json({error:`O serviço de análise encerrou a resposta antes de concluir (${finishReason}). Tente novamente.`})
    const content=extractText(payload);if(!content)return res.status(502).json({error:'O serviço de análise não retornou conteúdo analisável.'})
    const parsed=reconcileInvoiceReading(safeJson(content))
    return res.status(200).json({ok:true,provider:'Serviço de análise',model,data:normalize(parsed)})
  }catch(error){console.error('Erro no serviço de análise:',error);return res.status(500).json({error:`Erro interno no serviço de análise: ${error?.message||'erro desconhecido'}`})}
}
