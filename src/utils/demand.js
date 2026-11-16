// Grandezas independentes: demanda contratada, faturada e máximas medidas.
export const DEMAND_TOLERANCE=0.05 // REN ANEEL 1.000/2021, art. 301, II
export const demandNumber=v=>{
 if(v==null||v==='')return null
 const s=typeof v==='string'?v.trim().replace(/\s/g,''):v
 const x=Number(typeof s==='string'&&s.includes(',')?s.replace(/\./g,'').replace(',','.'):s)
 return Number.isFinite(x)&&x>=0?x:null
}
const positive=v=>{const x=demandNumber(v);return x>0?x:null}
const eq=(a,b)=>a!=null&&b!=null&&Math.abs(a-b)<0.005
export function measuredDemand(p,fp){
 const values=[demandNumber(p),demandNumber(fp)].filter(x=>x!=null)
 return values.length?Math.max(...values):null
}
export function resolveContract(bill={}){
 const p=demandNumber(bill.tarifas_horarias?.ponta?.demanda_maxima_kw??bill.demanda_maxima_ponta_kw)
 const fp=demandNumber(bill.tarifas_horarias?.fora_ponta?.demanda_maxima_kw??bill.demanda_maxima_fora_ponta_kw)
 const maximum=measuredDemand(p,fp)
 const direct=positive(bill.demanda_contratada_kw)
 const source=bill.demanda_contratada_fonte
 const fio=(Array.isArray(bill.componentes_fatura)?bill.componentes_fatura:[]).find(x=>/uso\s*(?:sistema|sist\.?)\s*fio\b/i.test(String(x?.nome||''))&&/^kw$/i.test(String(x?.unidade||'').trim()))
 const billed=positive(fio?.quantidade)??positive(bill.demanda_faturada_kw)
 if(source==='manual')return {value:direct,source:direct?'manual':null,billed,needsReview:!direct}
 if(source==='fatura'&&direct)return {value:direct,source:'fatura',billed,needsReview:false}
 // Art. 294: demanda faturada pode ser a medida OU a contratada.
 // Inferência só quando ambas as máximas são conhecidas e inferiores ao faturado.
 if(billed!=null&&p!=null&&fp!=null&&billed-maximum>=0.005)
  return {value:billed,source:'fio_inferido',billed,needsReview:false}
 // Registros anteriores não informavam proveniência. Não promover valor genérico,
 // faturado ou coincidente com medição a contratado sem confirmação.
 if(direct!=null&&p!=null&&fp!=null&&!eq(direct,maximum)&&!eq(direct,billed)&&source!=='fio_inferido')
  return {value:direct,source:'registro_anterior',billed,needsReview:true}
 return {value:null,source:null,billed,needsReview:true}
}
export function contractSourceLabel(source){
 return ({manual:'Valor informado na revisão da fatura',fatura:'Demanda contratada discriminada na fatura',fio_inferido:'Inferida do Uso Sistema Fio, superior às duas máximas medidas',registro_anterior:'Registro anterior; origem contratual a confirmar',historico:'Demanda contratada informada no histórico'})[source]||'Demanda contratada não identificada; confirme na fatura ou no contrato.'
}
export function demandAssessment(row={}){
 const p=demandNumber(row.demandaMaximaPontaKw??row.ponta?.demandaMaximaKw)
 const fp=demandNumber(row.demandaMaximaForaPontaKw??row.foraPonta?.demandaMaximaKw)
 const maximum=measuredDemand(p,fp)
 const contracted=positive(row.demandaContratada)
 const limit=contracted==null?null:contracted*(1+DEMAND_TOLERANCE)
 const exceeded=maximum!=null&&limit!=null&&maximum-limit>1e-8
 const comparable=limit!=null&&((p!=null&&fp!=null)||exceeded)
 const explicitKw=positive(row.demandaUltrapassagemKw),charge=positive(row.demandaUltrapassagemValor)
 return {maximum,contracted,limit,comparable,exceeded,excess:exceeded?maximum-contracted:null,charge,conflict:!exceeded&&(explicitKw!=null||charge!=null)}
}
