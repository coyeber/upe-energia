import { useState } from 'react'
import { CalendarDays, CheckCircle2, Gauge, Save, ShieldCheck, Sparkles, Zap, Clock3, ReceiptText } from 'lucide-react'
import { makeId } from '../utils/format'

const groups=[
 {title:'Identificação',fields:[['concessionaria','Concessionária','text'],['unidade_consumidora','Unidade consumidora','text'],['classe_consumidora','Classe consumidora','text'],['tipo_fornecimento','Tipo de fornecimento','text']]},
 {title:'Período e leituras',fields:[['mes_referencia','Referência','month'],['data_emissao','Emissão','date'],['data_vencimento','Vencimento','date'],['periodo_leitura_inicio','Leitura anterior - data','date'],['periodo_leitura_fim','Leitura atual - data','date'],['proxima_leitura','Próxima leitura','date'],['dias_faturados','Dias faturados','number']]},
 {title:'Energia, demanda e financeiro',fields:[['consumo_kwh','Consumo medido (kWh)','number'],['consumo_faturado_kwh','Consumo faturado/pago (kWh)','number'],['demanda_kw','Demanda medida (kW)','number'],['demanda_faturada_kw','Demanda faturada/paga (kW)','number'],['demanda_contratada_kw','Demanda contratada (kW)','number'],['valor_total','Valor total (R$)','number'],['iluminacao_publica_valor','Iluminação pública (R$)','number'],['impostos_total','Impostos (R$)','number'],['multas_total','Multas (R$)','number']]}
]
const numberFields=new Set(['dias_faturados','consumo_kwh','consumo_faturado_kwh','demanda_kw','demanda_faturada_kw','demanda_contratada_kw','valor_total','iluminacao_publica_valor','impostos_total','multas_total','leitura_anterior','leitura_atual'])
const tariffFields=[['consumo_kwh','Consumo do posto (kWh)'],['demanda_faturada_kw','Demanda faturada/paga (kW)'],['te_consumo_kwh','Quantidade TE (kWh)'],['te_valor','TE faturada (R$)'],['te_tarifa','Tarifa TE informada (R$/kWh)'],['tusd_consumo_kwh','Quantidade TUSD (kWh)'],['tusd_valor','TUSD faturada (R$)'],['tusd_tarifa','Tarifa TUSD informada (R$/kWh)']]

export default function ReviewForm({data,onSave,fileName,provider,model}){
 const [form,setForm]=useState({...data,tarifas_horarias:{ponta:{...(data.tarifas_horarias?.ponta||{})},fora_ponta:{...(data.tarifas_horarias?.fora_ponta||{})}}})
 const set=(k,v)=>setForm(s=>({...s,[k]:numberFields.has(k)?(v===''?null:Number(v)):v}))
 const setTariff=(slot,k,v)=>setForm(s=>({...s,tarifas_horarias:{...s.tarifas_horarias,[slot]:{...(s.tarifas_horarias?.[slot]||{}),[k]:v===''?null:Number(v)}}}))
 function save(){onSave({...form,id:makeId(),uploaded_at:new Date().toISOString(),source_file:fileName,status_extracao:'sucesso',provider,model})}
 return <section className="card review-card animate-enter">
  <div className="review-head"><div><div className="label text-[#123b73]">Conferência obrigatória</div><h2 className="section-title">Revise os dados antes de alimentar o dashboard</h2><p className="section-subtitle">O sistema organiza a fatura automaticamente. Confirme especialmente Ponta, Fora de Ponta, TE e TUSD. TE e TUSD permanecem independentes e nunca são somadas para formar um custo efetivo único.</p></div><span className="review-badge"><ShieldCheck size={15}/>Análise + validação</span></div>
  <div className="review-summary"><Summary icon={Zap} label="Consumo pago" value={form.consumo_faturado_kwh!=null?`${form.consumo_faturado_kwh} kWh`:'Não identificado'}/><Summary icon={Gauge} label="Demanda paga" value={form.demanda_faturada_kw!=null?`${form.demanda_faturada_kw} kW`:'Não informada'}/><Summary icon={CalendarDays} label="Ciclo" value={form.dias_faturados!=null?`${form.dias_faturados} dias`:'A confirmar'}/><Summary icon={Sparkles} label="Histórico" value={`${form.historico_consumo?.length||0} mês(es)`}/></div>
  <div className="space-y-5 mt-6">{groups.map(g=><div key={g.title}><div className="review-group-title">{g.title}</div><div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4 mt-3">{g.fields.map(([k,l,t])=><label key={k} className="field-label">{l}<input className="field mt-1.5" type={t} step="any" value={form[k]??''} onChange={e=>set(k,e.target.value)}/></label>)}</div></div>)}</div>

  <div className="tariff-review-grid mt-7">
   <TariffEditor title="Ponta (P)" subtitle="17h30 às 20h30 • tarifa mais cara" icon={Clock3} data={form.tarifas_horarias?.ponta} onChange={(k,v)=>setTariff('ponta',k,v)}/>
   <TariffEditor title="Fora de Ponta (FP)" subtitle="Demais horários" icon={Clock3} data={form.tarifas_horarias?.fora_ponta} onChange={(k,v)=>setTariff('fora_ponta',k,v)}/>
  </div>

  <div className="grid lg:grid-cols-3 gap-4 mt-6"><MetaCard title="Confiabilidade da leitura" text={`${form.confianca?.geral||'não informada'} • ${(form.confianca?.observacoes||[]).join(' ')||'Sem observações.'}`}/><MetaCard title="Componentes da fatura" text={`${form.componentes_fatura?.length||0} item(ns) identificado(s) na análise.`}/><MetaCard title="Cobranças específicas" text={`${form.multas?.length||0} multa(s) • ${form.impostos?.length||0} imposto(s) • iluminação pública ${form.iluminacao_publica_valor!=null?'identificada':'não identificada'}.`}/></div>
  <div className="review-warning"><CheckCircle2 size={17}/><div><strong>Antes de salvar</strong><p>Não misture Ponta e Fora de Ponta. TE e TUSD também permanecem separados: cada componente terá seu próprio valor, quantidade e custo efetivo. Se a fatura não informar um campo, deixe-o vazio.</p></div></div>
  <div className="mt-6 flex justify-end"><button className="btn-primary btn-large" onClick={save}><Save size={18}/>Confirmar e salvar no dashboard</button></div>
 </section>
}
function TariffEditor({title,subtitle,icon:Icon,data={},onChange}){return <div className="tariff-review-card"><div className="tariff-review-head"><div className="tariff-review-icon"><Icon size={18}/></div><div><strong>{title}</strong><span>{subtitle}</span></div></div><div className="grid sm:grid-cols-2 gap-3 mt-4">{tariffFields.map(([k,l])=><label className="field-label" key={k}>{l}<input className="field mt-1.5" type="number" step="any" value={data?.[k]??''} onChange={e=>onChange(k,e.target.value)}/></label>)}</div></div>}
function Summary({icon:Icon,label,value}){return <div className="review-summary-item"><Icon size={17}/><div><span>{label}</span><strong>{value}</strong></div></div>}
function MetaCard({title,text}){return <div className="meta-card"><strong>{title}</strong><p>{text}</p></div>}
