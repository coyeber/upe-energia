import { useMemo, useState } from 'react'
import { Lightbulb, AlertTriangle, PiggyBank, Activity, ReceiptText, ArrowDownRight, Building2, ShieldAlert, BadgeDollarSign, Target, BrainCircuit } from 'lucide-react'
import { brl,num,monthLong } from '../utils/format'

export default function AnalysisPage({bills}){
 const [target,setTarget]=useState(10)
 const current=bills[0]
 const hist=useMemo(()=>current?.historico_consumo||[],[current])
 if(!current) return <div className="card p-10 text-center"><Lightbulb className="mx-auto text-[#123b73]" size={36}/><h2 className="text-xl font-extrabold mt-4">Nenhuma análise disponível</h2><p className="text-slate-500 mt-2">Envie uma conta para receber diagnóstico e recomendações.</p></div>
 const avg=hist.length?hist.reduce((s,x)=>s+(Number(x.kwh)||0),0)/hist.length:null
 const diff=avg&&current.consumo_kwh?((current.consumo_kwh-avg)/avg)*100:null
 const unitCost=current.valor_total&&current.consumo_kwh?current.valor_total/current.consumo_kwh:null
 const projected=current.valor_total?current.valor_total*(1-target/100):null
 const annualSaving=current.valor_total?current.valor_total*(target/100)*12:null
 const high=[...hist].sort((a,b)=>(b.kwh||0)-(a.kwh||0)).slice(0,3)
 const components=current.componentes_fatura||[]
 const diag=current.diagnostico||{}
 const demandExcess=current.demanda_kw!=null&&current.demanda_contratada_kw!=null?current.demanda_kw-current.demanda_contratada_kw:null
 const funcs=[
  {icon:BadgeDollarSign,title:'1. Custo médio do kWh',value:unitCost?brl(unitCost):'Não calculável',text:'Relação entre o valor total da fatura e o consumo medido. Não representa necessariamente a tarifa regulatória pura.'},
  {icon:Activity,title:'2. Comparação histórica',value:diff==null?'Sem base':`${Math.abs(diff).toFixed(1)}% ${diff>0?'acima':'abaixo'}`,text:'Compara o consumo atual com a média dos meses identificados no histórico da fatura.'},
  {icon:Target,title:'3. Meta de redução',value:`${target}%`,text:projected?`Com essa meta, uma fatura semelhante cairia aproximadamente para ${brl(projected)}.`:'Defina uma meta para simular economia.'},
  {icon:PiggyBank,title:'4. Economia anual simulada',value:annualSaving?brl(annualSaving):'—',text:'Projeção simples considerando a mesma redução durante 12 meses.'},
  {icon:ArrowDownRight,title:'5. Consumo alvo',value:current.consumo_kwh?`${num(current.consumo_kwh*(1-target/100))} kWh`:'—',text:'Referência de consumo para atingir a meta escolhida.'},
  {icon:ReceiptText,title:'6. Componentes da fatura',value:`${components.length} identificados`,text:'Separa itens como energia, TUSD, TE, bandeiras, impostos, iluminação pública e outros quando a fatura informa.'},
  {icon:ShieldAlert,title:'7. Demanda contratada',value:current.demanda_contratada_kw?`${num(current.demanda_contratada_kw,1)} kW`:'Não disponível',text:demandExcess>0?`A demanda medida ficou ${num(demandExcess,1)} kW acima da contratada. Verifique cobrança por ultrapassagem na fatura.`:'O sistema não inventa demanda quando essa grandeza não aparece.'},
  {icon:Building2,title:'8. Meses críticos',value:high.length?high.map(x=>`${x.mes}: ${num(x.kwh)} kWh`).join(' • '):'Sem histórico',text:'Ranking dos maiores consumos encontrados na própria conta.'},
  {icon:AlertTriangle,title:'9. Alertas automáticos',value:`${(diag.alertas||[]).length} alerta(s)`,text:(diag.alertas||[])[0]||'O Gemini não sinalizou alertas específicos nesta fatura.'},
  {icon:BrainCircuit,title:'10. Diagnóstico Gemini',value:current.confianca?.geral?`Confiança ${current.confianca.geral}`:'Analisado',text:diag.resumo||'O diagnóstico será gerado pela IA a partir dos dados identificados.'}
 ]
 return <div className="space-y-5">
  <section className="upe-gradient text-white rounded-[24px] p-6 md:p-8 relative overflow-hidden"><div className="absolute left-0 bottom-0 h-1 w-full bg-[#ed1c2e]"/><div className="label !text-blue-100">Inteligência energética</div><h1 className="text-3xl font-black mt-2">Análises e oportunidades de economia</h1><p className="mt-3 text-blue-100 max-w-3xl">A IA interpreta a fatura; os cálculos do painel transformam os dados em indicadores para apoiar decisões. Recomendações não substituem uma auditoria elétrica em campo.</p></section>
  <section className="card p-5"><div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between"><div><div className="label">Simulador de economia</div><div className="font-extrabold text-lg mt-1">Quanto podemos reduzir?</div></div><div className="flex items-center gap-3"><input type="range" min="5" max="30" step="5" value={target} onChange={e=>setTarget(Number(e.target.value))} className="w-44 accent-[#ed1c2e]"/><span className="badge bg-red-50 text-[#ed1c2e]">{target}%</span></div></div></section>
  <section className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">{funcs.map(({icon:Icon,title,value,text})=><div className="card p-5" key={title}><div className="flex items-start justify-between gap-3"><div className="h-10 w-10 rounded-xl bg-[#eef4fb] text-[#123b73] flex items-center justify-center"><Icon size={19}/></div><span className="text-xs font-extrabold text-slate-400">{monthLong(current.mes_referencia)}</span></div><div className="font-extrabold mt-4">{title}</div><div className="text-xl font-black text-[#123b73] mt-2">{value}</div><p className="text-sm text-slate-500 mt-2 leading-relaxed">{text}</p></div>)}</section>
  <section className="grid lg:grid-cols-2 gap-5"><div className="card p-5"><div className="label text-[#ed1c2e]">Possíveis causas</div><h3 className="font-extrabold text-lg mt-1">O que pode estar elevando os gastos</h3><div className="mt-4 space-y-3">{(diag.causas_provaveis||[]).length?(diag.causas_provaveis||[]).map((x,i)=><Bullet key={i} text={x}/>):<Bullet text="A fatura, sozinha, pode não provar a causa física do aumento. Compare horários de uso, climatização, ocupação e equipamentos."/>}</div></div><div className="card p-5"><div className="label text-emerald-700">Plano de ação</div><h3 className="font-extrabold text-lg mt-1">Como melhorar os gastos</h3><div className="mt-4 space-y-3">{[...(diag.acoes_prioritarias||[]),...(diag.oportunidades_economia||[])].slice(0,8).map((x,i)=><Bullet key={i} text={x} green/>)}{!(diag.acoes_prioritarias||[]).length&&<Bullet green text="Mapeie os maiores consumidores, estabeleça metas mensais e valide resultados com medições antes/depois."/>}</div></div></section>
  <section className="card p-5"><div className="label">Composição identificada</div><h3 className="font-extrabold text-lg mt-1">Itens encontrados pelo Gemini</h3><div className="mt-4 overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left text-slate-500 border-b"><th className="py-3">Item</th><th>Valor</th><th>Unidade</th></tr></thead><tbody>{components.length?components.map((c,i)=><tr key={i} className="border-b border-slate-100"><td className="py-3 font-bold">{c.nome}</td><td>{c.valor!=null?brl(c.valor):'—'}</td><td>{c.unidade||'—'}</td></tr>):<tr><td colSpan="3" className="py-5 text-slate-500">Nenhum componente detalhado foi identificado.</td></tr>}</tbody></table></div></section>
 </div>
}
function Bullet({text,green}){return <div className={`rounded-xl p-3 text-sm leading-relaxed border ${green?'bg-emerald-50 border-emerald-100 text-emerald-900':'bg-slate-50 border-slate-100 text-slate-700'}`}>{text}</div>}
