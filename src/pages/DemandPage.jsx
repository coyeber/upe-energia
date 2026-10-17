import { useMemo, useState } from 'react'
import { AlertTriangle, Gauge, ReceiptText, ShieldCheck } from 'lucide-react'
import { Bar, CartesianGrid, ComposedChart, Legend, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { DetailHeader, DetailMetric, EmptyDetail, YearSelector } from '../components/DetailUI'
import { annualAverage, buildMonthlySeries, demandExceeded, yearRows } from '../utils/analytics'
import { brl, monthLabel, num } from '../utils/format'

const tip={border:'1px solid #dbe5f1',borderRadius:14,boxShadow:'0 12px 28px rgba(18,59,115,.12)',fontSize:12}
const n=v=>v===null||v===undefined||v===''?null:Number(v)

export default function DemandPage({bills,onBack}){
  const monthly=useMemo(()=>buildMonthlySeries(bills),[bills])
  const years=useMemo(()=>[...new Set(monthly.map(x=>x.mes?.slice(0,4)).filter(Boolean))].sort().reverse(),[monthly])
  const [year,setYear]=useState(years[0]||String(new Date().getFullYear()))
  const rows=useMemo(()=>yearRows(monthly,year),[monthly,year])
  const latestContracted=[...rows].reverse().find(x=>n(x.demandaContratada)!=null)?.demandaContratada??null
  const getP=x=>x.demandaMaximaPontaKw??x.ponta?.demandaMaximaKw
  const getFP=x=>x.demandaMaximaForaPontaKw??x.foraPonta?.demandaMaximaKw
  const avgP=annualAverage(rows,getP)
  const avgFP=annualAverage(rows,getFP)
  const maxPonta=rows.map(x=>n(getP(x))).filter(Number.isFinite).reduce((a,b)=>a==null?b:Math.max(a,b),null)
  const maxForaPonta=rows.map(x=>n(getFP(x))).filter(Number.isFinite).reduce((a,b)=>a==null?b:Math.max(a,b),null)
  const maxDemand=[maxPonta,maxForaPonta].filter(Number.isFinite).reduce((a,b)=>a==null?b:Math.max(a,b),null)
  const exceeded=rows.filter(demandExceeded)
  const overrunCost=exceeded.map(x=>n(x.demandaUltrapassagemValor)).filter(Number.isFinite).reduce((a,b)=>a+b,0)
  const hasOverrunCost=exceeded.some(x=>n(x.demandaUltrapassagemValor)!=null)
  const data=rows.map(x=>({label:monthLabel(x.mes),mes:x.mes,contratada:x.demandaContratada,maxPonta:getP(x),maxForaPonta:getFP(x),ultrapassagem:x.demandaUltrapassagemKw,valorUltrapassagem:x.demandaUltrapassagemValor}))
  return <div className="space-y-5 page-enter">
    <DetailHeader icon={Gauge} kicker="Análise detalhada" title="Demanda de potência" subtitle="Uma única visão para acompanhar Demanda máxima Ponta, Demanda máxima Fora de Ponta, limite contratado e ultrapassagens." onBack={onBack}/>
    <YearSelector years={years.length?years:[year]} year={year} setYear={setYear}/>
    {!rows.length?<EmptyDetail text="Envie contas que contenham demanda em kW para formar este histórico."/>:<>
      <section className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <DetailMetric icon={Gauge} label="Demanda contratada" value={latestContracted==null?'—':`${num(latestContracted,2)} kW`} note="Limite contratado informado nas contas"/>
        <DetailMetric icon={Gauge} label="Demanda máxima Ponta" value={maxPonta==null?'—':`${num(maxPonta,2)} kW`} note="Maior valor identificado no horário de Ponta" tone="red"/>
        <DetailMetric icon={Gauge} label="Demanda máxima Fora de Ponta" value={maxForaPonta==null?'—':`${num(maxForaPonta,2)} kW`} note="Maior valor identificado Fora de Ponta"/>
        <DetailMetric icon={Gauge} label="Maior demanda do ano" value={maxDemand==null?'—':`${num(maxDemand,2)} kW`} note="Maior valor entre Ponta e Fora de Ponta" tone="amber"/>
        <DetailMetric icon={AlertTriangle} label="Meses com ultrapassagem" value={String(exceeded.length)} note="Comparação com a demanda contratada" tone={exceeded.length?'red':'green'}/>
        <DetailMetric icon={ReceiptText} label="Custo de ultrapassagem" value={hasOverrunCost?brl(overrunCost):'Não identificado'} note="Somente valores explícitos das faturas" tone="amber"/>
      </section>

      <section className="card premium-card p-5 md:p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4"><div><div className="label text-[#123b73]">Demanda mensal</div><h2 className="section-title">Demanda máxima Ponta x Fora de Ponta — {year}</h2><p className="section-subtitle">Vermelho: Demanda máxima Ponta. Azul-turquesa: Demanda máxima Fora de Ponta. Linha escura tracejada: demanda contratada. Linhas adicionais: médias anuais de cada faixa.</p></div><span className="data-chip"><ShieldCheck size={13}/>Unidade correta: kW</span></div>
        <div className="h-[430px] mt-5"><ResponsiveContainer><ComposedChart data={data}><CartesianGrid strokeDasharray="4 6" vertical={false}/><XAxis dataKey="label" height={48} label={{value:'Meses',position:'insideBottom',offset:-7,style:{fill:'#64748b',fontSize:11,fontWeight:800}}}/><YAxis width={72} label={{value:'kW',angle:-90,position:'insideLeft',style:{fill:'#64748b',fontSize:11,fontWeight:800,textAnchor:'middle'}}}/><Tooltip contentStyle={tip} formatter={(v,nm)=>[`${num(v,2)} kW`,nm]}/><Bar dataKey="maxPonta" name="Demanda máxima Ponta" fill="#ef4444" radius={[7,7,0,0]} maxBarSize={34}/><Bar dataKey="maxForaPonta" name="Demanda máxima Fora de Ponta" fill="#06b6d4" radius={[7,7,0,0]} maxBarSize={34}/><Line type="stepAfter" dataKey="contratada" name="Demanda contratada" stroke="#0f172a" strokeWidth={2.6} strokeDasharray="8 6" dot={{r:3}} connectNulls/>{avgP!=null&&<ReferenceLine y={avgP} stroke="#f59e0b" strokeDasharray="5 5" label={{value:'Média P',fill:'#b45309',fontSize:11}}/>}{avgFP!=null&&<ReferenceLine y={avgFP} stroke="#8b5cf6" strokeDasharray="5 5" label={{value:'Média FP',fill:'#6d28d9',fontSize:11}}/>}<Legend/></ComposedChart></ResponsiveContainer></div>
      </section>

      <section className="card p-5 md:p-6 overflow-x-auto">
        <div className="flex items-center gap-3"><div className="report-section-icon red"><AlertTriangle size={18}/></div><div><div className="label">Ultrapassagens</div><h2 className="section-title !mt-0">Meses acima da demanda contratada</h2></div></div>
        {exceeded.length?<table className="detail-table mt-5"><thead><tr><th>Mês</th><th>Máx. Ponta</th><th>Máx. Fora de Ponta</th><th>Contratada</th><th>Excedente</th><th>Valor da ultrapassagem</th></tr></thead><tbody>{exceeded.map(r=>{const p=n(getP(r));const fp=n(getFP(r));const maximum=[p,fp].filter(Number.isFinite).reduce((a,b)=>a==null?b:Math.max(a,b),null);const contracted=n(r.demandaContratada);const exc=n(r.demandaUltrapassagemKw)??(maximum!=null&&contracted!=null?Math.max(0,maximum-contracted):null);return <tr key={r.mes}><td>{monthLabel(r.mes)}</td><td>{p==null?'—':`${num(p,2)} kW`}</td><td>{fp==null?'—':`${num(fp,2)} kW`}</td><td>{contracted==null?'—':`${num(contracted,2)} kW`}</td><td>{exc==null?'—':`${num(exc,2)} kW`}</td><td>{r.demandaUltrapassagemValor==null?'Não identificado na fatura':brl(r.demandaUltrapassagemValor)}</td></tr>})}</tbody></table>:<div className="demand-ok mt-5"><ShieldCheck size={20}/><div><strong>Nenhuma ultrapassagem detectada em {year}</strong><p>Com base nos meses que possuem Demanda máxima e limite contratado.</p></div></div>}
      </section>
    </>}
  </div>
}
