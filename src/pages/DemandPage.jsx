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
  const avg=annualAverage(rows,x=>x.demandaFaturadaKw??x.demanda)
  const latest=[...rows].reverse().find(x=>(x.demandaFaturadaKw??x.demanda)!=null)
  const maxDemand=rows.map(x=>n(x.demandaFaturadaKw??x.demanda)).filter(Number.isFinite).reduce((a,b)=>a==null?b:Math.max(a,b),null)
  const exceeded=rows.filter(demandExceeded)
  const overrunCost=exceeded.map(x=>n(x.demandaUltrapassagemValor)).filter(Number.isFinite).reduce((a,b)=>a+b,0)
  const hasOverrunCost=exceeded.some(x=>n(x.demandaUltrapassagemValor)!=null)
  const data=rows.map(x=>({label:monthLabel(x.mes),mes:x.mes,demanda:x.demandaFaturadaKw??x.demanda,contratada:x.demandaContratada,ultrapassagem:x.demandaUltrapassagemKw,valorUltrapassagem:x.demandaUltrapassagemValor}))
  return <div className="space-y-5 page-enter">
    <DetailHeader icon={Gauge} kicker="Análise detalhada" title="Demanda de potência" subtitle="Uma única visão para acompanhar demanda mês a mês, limite contratado, média anual e ultrapassagens." onBack={onBack}/>
    <YearSelector years={years.length?years:[year]} year={year} setYear={setYear}/>
    {!rows.length?<EmptyDetail text="Envie contas que contenham demanda em kW para formar este histórico."/>:<>
      <section className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <DetailMetric icon={Gauge} label="Demanda mais recente" value={latest?(latest.demandaFaturadaKw??latest.demanda)!=null?`${num(latest.demandaFaturadaKw??latest.demanda,2)} kW`:'—':'—'} note={latest?monthLabel(latest.mes):'Sem referência'}/>
        <DetailMetric icon={Gauge} label="Maior demanda do ano" value={maxDemand==null?'—':`${num(maxDemand,2)} kW`} note={`Ano ${year}`} tone="red"/>
        <DetailMetric icon={AlertTriangle} label="Meses com ultrapassagem" value={String(exceeded.length)} note="Comparação com a demanda contratada" tone={exceeded.length?'red':'green'}/>
        <DetailMetric icon={ReceiptText} label="Custo de ultrapassagem" value={hasOverrunCost?brl(overrunCost):'Não identificado'} note="Somente valores explícitos das faturas" tone="amber"/>
      </section>

      <section className="card premium-card p-5 md:p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4"><div><div className="label text-[#123b73]">Demanda mensal</div><h2 className="section-title">Demanda faturada x limite contratado — {year}</h2><p className="section-subtitle">Barras: demanda faturada/paga. Linha azul tracejada: limite contratado informado na fatura. Linha vermelha tracejada: média anual da demanda faturada.</p></div><span className="data-chip"><ShieldCheck size={13}/>Unidade correta: kW</span></div>
        <div className="h-[430px] mt-5"><ResponsiveContainer><ComposedChart data={data}><CartesianGrid strokeDasharray="4 6" vertical={false}/><XAxis dataKey="label"/><YAxis/><Tooltip contentStyle={tip} formatter={(v,nm)=>[`${num(v,2)} kW`,nm]}/><Bar dataKey="demanda" name="Demanda faturada/paga" fill="#1d5cad" radius={[7,7,0,0]} maxBarSize={42}/><Line type="stepAfter" dataKey="contratada" name="Limite contratado" stroke="#123b73" strokeWidth={2.5} strokeDasharray="8 6" dot={{r:3}} connectNulls/>{avg!=null&&<ReferenceLine y={avg} stroke="#ed1c2e" strokeDasharray="7 6" label={{value:'Média anual',fill:'#ed1c2e',fontSize:11}}/>}<Legend/></ComposedChart></ResponsiveContainer></div>
      </section>

      <section className="card p-5 md:p-6 overflow-x-auto">
        <div className="flex items-center gap-3"><div className="report-section-icon red"><AlertTriangle size={18}/></div><div><div className="label">Ultrapassagens</div><h2 className="section-title !mt-0">Meses acima da demanda contratada</h2></div></div>
        {exceeded.length?<table className="detail-table mt-5"><thead><tr><th>Mês</th><th>Demanda faturada</th><th>Contratada</th><th>Excedente</th><th>Valor da ultrapassagem</th></tr></thead><tbody>{exceeded.map(r=>{const billed=n(r.demandaFaturadaKw??r.demanda);const contracted=n(r.demandaContratada);const exc=n(r.demandaUltrapassagemKw)??(billed!=null&&contracted!=null?Math.max(0,billed-contracted):null);return <tr key={r.mes}><td>{monthLabel(r.mes)}</td><td>{billed==null?'—':`${num(billed,2)} kW`}</td><td>{contracted==null?'—':`${num(contracted,2)} kW`}</td><td>{exc==null?'—':`${num(exc,2)} kW`}</td><td>{r.demandaUltrapassagemValor==null?'Não identificado na fatura':brl(r.demandaUltrapassagemValor)}</td></tr>})}</tbody></table>:<div className="demand-ok mt-5"><ShieldCheck size={20}/><div><strong>Nenhuma ultrapassagem detectada em {year}</strong><p>Com base nos meses que possuem simultaneamente demanda faturada e limite contratado.</p></div></div>}
      </section>
    </>}
  </div>
}
