import { useState } from 'react'
import { Save, ShieldCheck } from 'lucide-react'
import { makeId } from '../utils/format'
const fields=[
 ['concessionaria','Concessionária','text'],['unidade_consumidora','Unidade consumidora','text'],['mes_referencia','Referência','month'],
 ['consumo_kwh','Consumo (kWh)','number'],['demanda_kw','Demanda medida (kW)','number'],['demanda_contratada_kw','Demanda contratada (kW)','number'],
 ['valor_total','Valor total (R$)','number'],['data_vencimento','Vencimento','date'],['classe_consumidora','Classe consumidora','text']
]
export default function ReviewForm({data,onSave,fileName,provider,model}){
 const [form,setForm]=useState({...data})
 const set=(k,v)=>setForm(s=>({...s,[k]:['consumo_kwh','demanda_kw','demanda_contratada_kw','valor_total'].includes(k)?(v===''?null:Number(v)):v}))
 function save(){ onSave({...form,id:makeId(),uploaded_at:new Date().toISOString(),source_file:fileName,status_extracao:'sucesso',provider,model}) }
 return <div className="card p-5 md:p-7">
  <div className="flex items-start justify-between gap-4 mb-5"><div><div className="label text-[#123b73]">Conferência dos dados</div><h3 className="text-xl font-extrabold mt-1">Revise antes de salvar</h3><p className="text-sm text-slate-500 mt-1">A IA pode errar. Corrija qualquer campo antes de alimentar o dashboard.</p></div><span className="badge bg-blue-50 text-[#123b73]"><ShieldCheck size={14}/> IA + validação</span></div>
  <div className="grid md:grid-cols-3 gap-4">{fields.map(([k,l,t])=><label key={k} className="text-sm font-bold text-slate-700">{l}<input className="field mt-1.5" type={t} step="any" value={form[k]??''} onChange={e=>set(k,e.target.value)}/></label>)}</div>
  <div className="mt-5 grid lg:grid-cols-2 gap-4">
   <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4"><div className="font-extrabold text-sm">Histórico identificado</div><div className="text-xs text-slate-500 mt-1">{form.historico_consumo?.length||0} mês(es) encontrados na fatura.</div></div>
   <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4"><div className="font-extrabold text-sm">Confiança da leitura</div><div className="text-xs text-slate-500 mt-1 capitalize">{form.confianca?.geral||'não informada'} • {(form.confianca?.observacoes||[]).join(' ')||'Sem observações.'}</div></div>
  </div>
  <div className="mt-6 flex justify-end"><button className="btn-primary" onClick={save}><Save size={18}/>Salvar no dashboard</button></div>
 </div>
}
