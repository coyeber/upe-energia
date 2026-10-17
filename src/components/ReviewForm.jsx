import { useState } from 'react'
import { CalendarDays, CheckCircle2, Gauge, Save, ShieldCheck, Sparkles, Zap, Clock3, ReceiptText } from 'lucide-react'
import { makeId } from '../utils/format'

const groups=[
 {title:'Identificação',fields:[['concessionaria','Concessionária','text'],['unidade_consumidora','Unidade consumidora','text']]},
 {title:'Período',fields:[['mes_referencia','Referência','month'],['data_vencimento','Vencimento','date'],['dias_faturados','Dias faturados','number']]},
 {title:'Dados principais',fields:[['consumo_kwh','Consumo total (kWh)','number'],['demanda_kw','Demanda geral (kW)','number'],['demanda_contratada_kw','Demanda contratada (kW)','number'],['valor_total','Valor total da fatura (R$)','number']]},
 {title:'Cobranças adicionais',fields:[['iluminacao_publica_valor','Iluminação pública (R$)','number'],['impostos_total','Impostos (R$)','number'],['multas_total','Multas (R$)','number'],['demanda_ultrapassagem_valor','Ultrapassagem de demanda (R$)','number']]}
]
const numberFields=new Set(['dias_faturados','consumo_kwh','demanda_kw','demanda_contratada_kw','demanda_ultrapassagem_valor','valor_total','iluminacao_publica_valor','impostos_total','multas_total'])
const tariffFields=[['consumo_kwh','Consumo do posto (kWh)'],['demanda_maxima_kw','Demanda máxima do posto (kW)'],['te_consumo_kwh','Quantidade TE (kWh)'],['te_valor','TE faturada (R$)'],['te_tarifa','Tarifa TE informada (R$/kWh)'],['tusd_consumo_kwh','Quantidade TUSD (kWh)'],['tusd_valor','TUSD faturada (R$)'],['tusd_tarifa','Tarifa TUSD informada (R$/kWh)']]

export default function ReviewForm({data,onSave,fileName,provider,model}){
 const [form,setForm]=useState({...data,tarifas_horarias:{ponta:{...(data.tarifas_horarias?.ponta||{})},fora_ponta:{...(data.tarifas_horarias?.fora_ponta||{})}}})
 const [showDetails,setShowDetails]=useState(false)
 const set=(k,v)=>setForm(s=>({...s,[k]:numberFields.has(k)?(v===''?null:Number(v)):v}))
 const setTariff=(slot,k,v)=>setForm(s=>({...s,tarifas_horarias:{...s.tarifas_horarias,[slot]:{...(s.tarifas_horarias?.[slot]||{}),[k]:v===''?null:Number(v)}}}))
 function save(){onSave({...form,id:makeId(),uploaded_at:new Date().toISOString(),source_file:fileName,status_extracao:'sucesso',provider,model})}
 return <section className="card review-card animate-enter">
  <div className="review-head"><div><div className="label text-[#123b73]">Análise concluída</div><h2 className="section-title">Dados identificados automaticamente</h2><p className="section-subtitle">Você pode salvar imediatamente. A revisão detalhada é opcional e serve apenas para conferir o que foi lido na fatura.</p></div><span className="review-badge"><ShieldCheck size={15}/>Análise + validação</span></div>
  <div className="review-summary"><Summary icon={Zap} label="Consumo" value={form.consumo_kwh!=null?`${form.consumo_kwh} kWh`:'Não identificado'}/><Summary icon={Gauge} label="Demanda máxima Ponta" value={form.tarifas_horarias?.ponta?.demanda_maxima_kw!=null?`${form.tarifas_horarias.ponta.demanda_maxima_kw} kW`:'Não informada'}/><Summary icon={Gauge} label="Demanda máxima FP" value={form.tarifas_horarias?.fora_ponta?.demanda_maxima_kw!=null?`${form.tarifas_horarias.fora_ponta.demanda_maxima_kw} kW`:'Não informada'}/><Summary icon={CalendarDays} label="Ciclo" value={form.dias_faturados!=null?`${form.dias_faturados} dias`:'A confirmar'}/></div>
  <div className="review-auto-actions mt-5"><button className="btn-secondary" type="button" onClick={()=>setShowDetails(v=>!v)}><ReceiptText size={16}/>{showDetails?'Ocultar campos detalhados':'Revisar campos extraídos (opcional)'}</button><span>O preenchimento manual não é obrigatório para salvar.</span></div>
  {showDetails&&<>
  <div className="space-y-5 mt-6">{groups.map(g=><div key={g.title}><div className="review-group-title">{g.title}</div><div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4 mt-3">{g.fields.map(([k,l,t])=><label key={k} className="field-label">{l}<input className="field mt-1.5" type={t} step="any" value={form[k]??''} onChange={e=>set(k,e.target.value)}/></label>)}</div></div>)}</div>

  <div className="tariff-review-grid mt-7">
   <TariffEditor title="Ponta (P)" subtitle="17h30 às 20h30 • tarifa mais cara" icon={Clock3} data={form.tarifas_horarias?.ponta} onChange={(k,v)=>setTariff('ponta',k,v)}/>
   <TariffEditor title="Fora de Ponta (FP)" subtitle="Demais horários" icon={Clock3} data={form.tarifas_horarias?.fora_ponta} onChange={(k,v)=>setTariff('fora_ponta',k,v)}/>
  </div>

  <div className="grid lg:grid-cols-3 gap-4 mt-6"><MetaCard title="Confiabilidade da leitura" text={`${form.confianca?.geral||'não informada'} • ${(form.confianca?.observacoes||[]).join(' ')||'Sem observações.'}`}/><MetaCard title="Componentes da fatura" text={`${form.componentes_fatura?.length||0} item(ns) identificado(s) na análise.`}/><MetaCard title="Cobranças específicas" text={`${form.multas?.length||0} multa(s) • ${form.impostos?.length||0} imposto(s) • iluminação pública ${form.iluminacao_publica_valor!=null?'identificada':'não identificada'}.`}/></div>
  <div className="review-warning"><CheckCircle2 size={17}/><div><strong>Revisão simplificada</strong><p>Ponta e Fora de Ponta usam apenas a Demanda máxima. Os campos duplicados de demanda foram removidos. TE e TUSD continuam separados por quantidade, valor e tarifa.</p></div></div>
  </>}
  <div className="mt-6 flex justify-end"><button className="btn-primary btn-large" onClick={save}><Save size={18}/>Salvar análise no dashboard</button></div>
 </section>
}
function TariffEditor({title,subtitle,icon:Icon,data={},onChange}){return <div className="tariff-review-card"><div className="tariff-review-head"><div className="tariff-review-icon"><Icon size={18}/></div><div><strong>{title}</strong><span>{subtitle}</span></div></div><div className="grid sm:grid-cols-2 gap-3 mt-4">{tariffFields.map(([k,l])=><label className="field-label" key={k}>{l}<input className="field mt-1.5" type="number" step="any" value={data?.[k]??''} onChange={e=>onChange(k,e.target.value)}/></label>)}</div></div>}
function Summary({icon:Icon,label,value}){return <div className="review-summary-item"><Icon size={17}/><div><span>{label}</span><strong>{value}</strong></div></div>}
function MetaCard({title,text}){return <div className="meta-card"><strong>{title}</strong><p>{text}</p></div>}
