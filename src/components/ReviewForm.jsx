import { useState } from 'react'
import { CalendarDays, CheckCircle2, Gauge, Save, ShieldCheck, Sparkles, Zap } from 'lucide-react'
import { makeId } from '../utils/format'

const groups=[
 {title:'Identificação',fields:[['concessionaria','Concessionária','text'],['unidade_consumidora','Unidade consumidora','text'],['classe_consumidora','Classe consumidora','text'],['tipo_fornecimento','Tipo de fornecimento','text']]},
 {title:'Período e leituras',fields:[['mes_referencia','Referência','month'],['data_emissao','Emissão','date'],['data_vencimento','Vencimento','date'],['periodo_leitura_inicio','Leitura anterior - data','date'],['periodo_leitura_fim','Leitura atual - data','date'],['proxima_leitura','Próxima leitura','date'],['dias_faturados','Dias faturados','number']]},
 {title:'Energia e financeiro',fields:[['consumo_kwh','Consumo (kWh)','number'],['demanda_kw','Demanda medida (kW)','number'],['demanda_contratada_kw','Demanda contratada (kW)','number'],['valor_total','Valor total (R$)','number'],['leitura_anterior','Leitura anterior - medidor','number'],['leitura_atual','Leitura atual - medidor','number'],['bandeira_tarifaria','Bandeira tarifária','text']]}
]
const numberFields=new Set(['dias_faturados','consumo_kwh','demanda_kw','demanda_contratada_kw','valor_total','leitura_anterior','leitura_atual'])

export default function ReviewForm({data,onSave,fileName,provider,model}){
 const [form,setForm]=useState({...data})
 const set=(k,v)=>setForm(s=>({...s,[k]:numberFields.has(k)?(v===''?null:Number(v)):v}))
 function save(){onSave({...form,id:makeId(),uploaded_at:new Date().toISOString(),source_file:fileName,status_extracao:'sucesso',provider,model})}
 return <section className="card review-card animate-enter">
  <div className="review-head"><div><div className="label text-[#123b73]">Conferência obrigatória</div><h2 className="section-title">Revise os dados antes de alimentar o dashboard</h2><p className="section-subtitle">A IA organiza a fatura, mas a confirmação humana mantém a base confiável para análises acadêmicas.</p></div><span className="review-badge"><ShieldCheck size={15}/>Gemini + validação</span></div>
  <div className="review-summary"><Summary icon={Zap} label="Consumo" value={form.consumo_kwh!=null?`${form.consumo_kwh} kWh`:'Não identificado'}/><Summary icon={Gauge} label="Demanda" value={form.demanda_kw!=null?`${form.demanda_kw} kW`:'Não informada'}/><Summary icon={CalendarDays} label="Ciclo" value={form.dias_faturados!=null?`${form.dias_faturados} dias`:'A confirmar'}/><Summary icon={Sparkles} label="Histórico" value={`${form.historico_consumo?.length||0} mês(es)`}/></div>
  <div className="space-y-5 mt-6">{groups.map(g=><div key={g.title}><div className="review-group-title">{g.title}</div><div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4 mt-3">{g.fields.map(([k,l,t])=><label key={k} className="field-label">{l}<input className="field mt-1.5" type={t} step="any" value={form[k]??''} onChange={e=>set(k,e.target.value)}/></label>)}</div></div>)}</div>
  <div className="grid lg:grid-cols-3 gap-4 mt-6"><MetaCard title="Confiança da leitura" text={`${form.confianca?.geral||'não informada'} • ${(form.confianca?.observacoes||[]).join(' ')||'Sem observações.'}`}/><MetaCard title="Componentes da fatura" text={`${form.componentes_fatura?.length||0} item(ns) identificado(s) pelo Gemini.`}/><MetaCard title="Modelo utilizado" text={`${provider||'Google Gemini'} • ${model||'modelo configurado no Vercel'}`}/></div>
  <div className="review-warning"><CheckCircle2 size={17}/><div><strong>Antes de salvar</strong><p>Confirme principalmente referência, consumo, valor e demanda. Se a fatura não informar demanda em kW, deixe o campo vazio.</p></div></div>
  <div className="mt-6 flex justify-end"><button className="btn-primary btn-large" onClick={save}><Save size={18}/>Confirmar e salvar no dashboard</button></div>
 </section>
}
function Summary({icon:Icon,label,value}){return <div className="review-summary-item"><Icon size={17}/><div><span>{label}</span><strong>{value}</strong></div></div>}
function MetaCard({title,text}){return <div className="meta-card"><strong>{title}</strong><p>{text}</p></div>}
