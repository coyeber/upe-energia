import { useMemo, useState } from 'react'
import { AlertTriangle, Gauge, ReceiptText, ShieldCheck } from 'lucide-react'
import { Bar, CartesianGrid, ComposedChart, Legend, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { DetailHeader, DetailMetric, EmptyDetail, YearSelector } from '../components/DetailUI'
import { annualAverage, buildMonthlySeries, demandAssessment, contractSourceLabel, yearRows } from '../utils/analytics'
import { brl, monthLabel, num } from '../utils/format'

const tip={border:'1px solid #dbe5f1',borderRadius:14,boxShadow:'0 12px 28px rgba(18,59,115,.12)',fontSize:12}
const n=v=>v===null||v===undefined||v===''?null:Number(v)

export default function DemandPage({bills,onBack}){
  const monthly=useMemo(()=>buildMonthlySeries(bills),[bills])
  const years=useMemo(()=>[...new Set(monthly.map(x=>x.mes?.slice(0,4)).filter(Boolean))].sort().reverse(),[monthly])
  const [year,setYear]=useState(years[0]||String(new Date().getFullYear()))
  const rows=useMemo(()=>yearRows(monthly,year),[monthly,year])
  const latestContract=[...rows].reverse().find(x=>n(x.demandaContratada)>0)
  const latestContracted=latestContract?.demandaContratada??null
  const contractNote=latestContract?monthLabel(latestContract.mes)+' • '+contractSourceLabel(latestContract.demandaContratadaFonte):contractSourceLabel(null)
  const getP=x=>x.demandaMaximaPontaKw??x.ponta?.demandaMaximaKw
  const getFP=x=>x.demandaMaximaForaPontaKw??x.foraPonta?.demandaMaximaKw
  const avgP=annualAverage(rows,getP)
  const avgFP=annualAverage(rows,getFP)
  const maxPonta=rows.map(x=>n(getP(x))).filter(Number.isFinite).reduce((a,b)=>a==null?b:Math.max(a,b),null)
  const maxForaPonta=rows.map(x=>n(getFP(x))).filter(Number.isFinite).reduce((a,b)=>a==null?b:Math.max(a,b),null)
  const maxDemand=[maxPonta,maxForaPonta].filter(Number.isFinite).reduce((a,b)=>a==null?b:Math.max(a,b),null)
  const evaluated=rows.map(row=>({...row,assessment:demandAssessment(row)}))
  const exceeded=evaluated.filter(x=>x.assessment.exceeded)
  const comparable=evaluated.filter(x=>x.assessment.comparable)
  const conflicts=evaluated.filter(x=>x.assessment.conflict)
  const overrunCost=rows.map(x=>n(x.demandaUltrapassagemValor)).filter(Number.isFinite).reduce((a,b)=>a+b,0)
  const hasOverrunCost=rows.some(x=>n(x.demandaUltrapassagemValor)!=null)
  const data=evaluated.map(x=>({label:monthLabel(x.mes),mes:x.mes,contratada:x.assessment.contracted,limite:x.assessment.limit,maxPonta:getP(x),maxForaPonta:getFP(x)}))
  return <div className="space-y-5 page-enter">
    <DetailHeader icon={Gauge} kicker="Análise detalhada" title="Demanda de potência" subtitle="Acompanhamento da demanda de potência ativa medida na ponta e fora de ponta, da demanda contratada e das ultrapassagens." onBack={onBack}/>
    <YearSelector years={years.length?years:[year]} year={year} setYear={setYear}/>
    {!rows.length?<EmptyDetail text="Envie contas que contenham demanda em kW para formar este histórico."/>:<>
      <section className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <DetailMetric icon={Gauge} label="Demanda contratada" value={latestContracted==null?'—':`${num(latestContracted,2)} kW`} note={contractNote}/>
        <DetailMetric icon={Gauge} label="Demanda máxima na ponta" value={maxPonta==null?'—':`${num(maxPonta,2)} kW`} note="Maior demanda medida no posto ponta" tone="red"/>
        <DetailMetric icon={Gauge} label="Demanda máxima fora de ponta" value={maxForaPonta==null?'—':`${num(maxForaPonta,2)} kW`} note="Maior demanda medida no posto fora de ponta"/>
        <DetailMetric icon={Gauge} label="Maior demanda do ano" value={maxDemand==null?'—':`${num(maxDemand,2)} kW`} note="Maior demanda de potência ativa medida no ano" tone="amber"/>
        <DetailMetric icon={AlertTriangle} label="Meses com ultrapassagem" value={comparable.length?String(exceeded.length):'—'} note={`${comparable.length} de ${rows.length} meses avaliáveis • limite de 105% da contratada`} tone={exceeded.length?'red':comparable.length?'green':'amber'}/>
        <DetailMetric icon={ReceiptText} label="Valor faturado de ultrapassagem" value={hasOverrunCost?brl(overrunCost):'Não identificado'} note="Cobranças registradas nas faturas; não estimadas" tone="amber"/>
      </section>

      <section className="card premium-card p-5 md:p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4"><div><div className="label text-[#123b73]">Demanda mensal</div><h2 className="section-title">Demanda máxima medida por posto tarifário — {year}</h2><p className="section-subtitle">Barras: máximas medidas por posto. Linhas: demanda contratada mensal, limite de ultrapassagem (105%) e médias dos postos.</p></div><span className="data-chip"><ShieldCheck size={13}/>Potência ativa (kW)</span></div>
        <div className="h-[430px] mt-5"><ResponsiveContainer><ComposedChart data={data}><CartesianGrid strokeDasharray="4 6" vertical={false}/><XAxis dataKey="label" height={48} label={{value:'Meses',position:'insideBottom',offset:-7,style:{fill:'#64748b',fontSize:11,fontWeight:800}}}/><YAxis width={72} label={{value:'kW',angle:-90,position:'insideLeft',style:{fill:'#64748b',fontSize:11,fontWeight:800,textAnchor:'middle'}}}/><Tooltip contentStyle={tip} formatter={(v,nm)=>[`${num(v,2)} kW`,nm]}/><Bar dataKey="maxPonta" name="Demanda máxima na ponta" fill="#ef4444" radius={[7,7,0,0]} maxBarSize={34}/><Bar dataKey="maxForaPonta" name="Demanda máxima fora de ponta" fill="#06b6d4" radius={[7,7,0,0]} maxBarSize={34}/><Line type="stepAfter" dataKey="contratada" name="Demanda contratada" stroke="#0f172a" strokeWidth={2.6} strokeDasharray="8 6" dot={{r:3}} connectNulls={false}/><Line type="stepAfter" dataKey="limite" name="Limite de ultrapassagem (105%)" stroke="#b91c1c" strokeWidth={2} strokeDasharray="4 5" dot={{r:3}} connectNulls={false}/>{avgP!=null&&<ReferenceLine y={avgP} stroke="#f59e0b" strokeDasharray="5 5" label={{value:'Média P',fill:'#b45309',fontSize:11}}/>}{avgFP!=null&&<ReferenceLine y={avgFP} stroke="#8b5cf6" strokeDasharray="5 5" label={{value:'Média FP',fill:'#6d28d9',fontSize:11}}/>}<Legend/></ComposedChart></ResponsiveContainer></div>
      </section>

      <section className="card p-5 md:p-6 overflow-x-auto">
        <div className="flex items-center gap-3"><div className="report-section-icon red"><AlertTriangle size={18}/></div><div><div className="label">Ultrapassagens</div><h2 className="section-title !mt-0">Meses com ultrapassagem regulatória</h2></div></div>
        {exceeded.length?<table className="detail-table mt-5"><thead><tr><th>Mês</th><th>Máx. Ponta</th><th>Máx. Fora de Ponta</th><th>Contratada (kW)</th><th>Limite (105%)</th><th>Excedente</th><th>Valor da ultrapassagem</th></tr></thead><tbody>{exceeded.map(r=>{const p=n(getP(r));const fp=n(getFP(r));const maximum=[p,fp].filter(Number.isFinite).reduce((a,b)=>a==null?b:Math.max(a,b),null);const contracted=n(r.demandaContratada);const exc=r.assessment.excess;return <tr key={r.mes}><td>{monthLabel(r.mes)}</td><td>{p==null?'—':`${num(p,2)} kW`}</td><td>{fp==null?'—':`${num(fp,2)} kW`}</td><td>{contracted==null?'—':`${num(contracted,2)} kW`}</td><td>{r.assessment.limit==null?'—':`${num(r.assessment.limit,2)} kW`}</td><td>{exc==null?'—':`${num(exc,2)} kW`}</td><td>{r.demandaUltrapassagemValor==null?'Não identificado na fatura':brl(r.demandaUltrapassagemValor)}</td></tr>})}</tbody></table>:<div className="demand-ok mt-5"><ShieldCheck size={20}/><div><strong>{comparable.length?'Nenhuma ultrapassagem identificada nos meses avaliáveis':'Sem dados suficientes para avaliar ultrapassagens'}</strong><p>Critério: demanda máxima medida superior a 105% da contratada no mesmo mês (REN ANEEL nº 1.000/2021, art. 301, II).</p></div></div>}
      </section>
      {(conflicts.length>0||comparable.length<rows.length)&&<section className="card p-5"><div className="flex gap-3"><AlertTriangle size={20} className="text-amber-600 shrink-0"/><div><h3 className="font-bold">Dados que requerem conferência</h3><p className="text-sm text-slate-600 mt-2">{rows.length-comparable.length} mês(es) sem dados suficientes para verificar o limite contratado e as medições. Não são considerados como meses sem ultrapassagem.</p>{conflicts.length>0&&<p className="text-sm text-slate-600 mt-2">Há cobrança ou quantidade de ultrapassagem informada sem confirmação pela comparação mensal em: {conflicts.map(x=>monthLabel(x.mes)).join(', ')}. Confira as faturas e o contrato.</p>}</div></div></section>}
    </>}
  </div>
}
