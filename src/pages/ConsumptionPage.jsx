import { useMemo, useState } from 'react'
import { Activity, Building2, Clock3, Users, Zap } from 'lucide-react'
import { Bar, CartesianGrid, ComposedChart, Legend, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { DetailHeader, DetailMetric, EmptyDetail, YearSelector } from '../components/DetailUI'
import { annualAverage, buildMonthlySeries, POLI_AREA_M2, POLI_PEOPLE, POLI_PEOPLE_REFERENCE_YEAR, yearRows } from '../utils/analytics'
import { monthLabel, num } from '../utils/format'

const tip={border:'1px solid #dbe5f1',borderRadius:14,boxShadow:'0 12px 28px rgba(18,59,115,.12)',fontSize:12}
const n=v=>v===null||v===undefined||v===''?null:Number(v)
const sum=arr=>{const x=arr.map(n).filter(Number.isFinite);return x.length?x.reduce((a,b)=>a+b,0):null}

export default function ConsumptionPage({bills,onBack}){
  const monthly=useMemo(()=>buildMonthlySeries(bills),[bills])
  const years=useMemo(()=>[...new Set(monthly.map(x=>x.mes?.slice(0,4)).filter(Boolean))].sort().reverse(),[monthly])
  const [year,setYear]=useState(years[0]||String(new Date().getFullYear()))
  const rows=useMemo(()=>yearRows(monthly,year),[monthly,year])
  const avgTotal=annualAverage(rows,x=>x.consumoFaturadoKwh??x.kwh)
  const avgP=annualAverage(rows,x=>x.ponta?.consumoKwh)
  const avgFP=annualAverage(rows,x=>x.foraPonta?.consumoKwh)
  const total=sum(rows.map(x=>x.consumoFaturadoKwh??x.kwh))
  const totalP=sum(rows.map(x=>x.ponta?.consumoKwh))
  const totalFP=sum(rows.map(x=>x.foraPonta?.consumoKwh))
  const data=rows.map(x=>({
    label:monthLabel(x.mes),mes:x.mes,total:x.consumoFaturadoKwh??x.kwh,ponta:x.ponta?.consumoKwh,foraPonta:x.foraPonta?.consumoKwh,
    mediaTotal:avgTotal,mediaP:avgP,mediaFP:avgFP,diario:x.consumoDiario,kwhM2:(x.consumoFaturadoKwh??x.kwh)!=null?(x.consumoFaturadoKwh??x.kwh)/POLI_AREA_M2:null,
    perCapita:(x.consumoFaturadoKwh??x.kwh)!=null?(x.consumoFaturadoKwh??x.kwh)/POLI_PEOPLE:null
  }))
  return <div className="space-y-5 page-enter">
    <DetailHeader icon={Zap} kicker="Análise detalhada" title="Consumo de energia" subtitle="Histórico mensal com Ponta e Fora de Ponta separados, médias anuais e indicadores por área e população." onBack={onBack}/>
    <YearSelector years={years.length?years:[year]} year={year} setYear={setYear}/>
    {!rows.length?<EmptyDetail text="Envie contas com referência mensal para formar o histórico de consumo."/>:<>
      <section className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <DetailMetric icon={Zap} label="Consumo total do ano" value={total==null?'—':`${num(total)} kWh`} note={`${rows.length} mês(es) com dados`}/>
        <DetailMetric icon={Clock3} label="Ponta (P)" value={totalP==null?'—':`${num(totalP)} kWh`} note="17h30 às 20h30" tone="red"/>
        <DetailMetric icon={Clock3} label="Fora de Ponta (FP)" value={totalFP==null?'—':`${num(totalFP)} kWh`} note="Demais horários"/>
        <DetailMetric icon={Activity} label="Média mensal anual" value={avgTotal==null?'—':`${num(avgTotal)} kWh`} note="Linha tracejada no gráfico" tone="green"/>
      </section>

      <section className="card premium-card p-5 md:p-6">
        <div className="chart-head"><div><div className="label text-[#123b73]">Consumo horo-sazonal</div><h2 className="section-title">Ponta x Fora de Ponta — {year}</h2><p className="section-subtitle">Os dois postos tarifários permanecem separados. As linhas tracejadas representam a média mensal anual de cada faixa.</p></div></div>
        <div className="h-[390px] mt-5"><ResponsiveContainer><ComposedChart data={data}><CartesianGrid strokeDasharray="4 6" vertical={false}/><XAxis dataKey="label"/><YAxis/><Tooltip contentStyle={tip} formatter={(v,nm)=>[`${num(v)} kWh`,nm]}/><Bar dataKey="ponta" name="Ponta (P)" fill="#ed1c2e" radius={[6,6,0,0]} maxBarSize={34}/><Bar dataKey="foraPonta" name="Fora de Ponta (FP)" fill="#123b73" radius={[6,6,0,0]} maxBarSize={34}/>{avgP!=null&&<ReferenceLine y={avgP} stroke="#ed1c2e" strokeDasharray="7 6" label={{value:'Média P',fill:'#ed1c2e',fontSize:11}}/>}{avgFP!=null&&<ReferenceLine y={avgFP} stroke="#123b73" strokeDasharray="7 6" label={{value:'Média FP',fill:'#123b73',fontSize:11}}/>}<Legend/></ComposedChart></ResponsiveContainer></div>
      </section>

      <section className="card premium-card p-5 md:p-6">
        <div className="label text-[#123b73]">Consumo faturado/pago</div><h2 className="section-title">Histórico mensal total</h2><p className="section-subtitle">A linha tracejada é a média mensal do ano selecionado.</p>
        <div className="h-[340px] mt-5"><ResponsiveContainer><ComposedChart data={data}><CartesianGrid strokeDasharray="4 6" vertical={false}/><XAxis dataKey="label"/><YAxis/><Tooltip contentStyle={tip} formatter={v=>[`${num(v)} kWh`,'Consumo']}/><Bar dataKey="total" name="Consumo faturado/pago" fill="#1d5cad" radius={[7,7,0,0]} maxBarSize={42}/>{avgTotal!=null&&<ReferenceLine y={avgTotal} stroke="#ed1c2e" strokeDasharray="8 6" label={{value:'Média anual',fill:'#ed1c2e',fontSize:11}}/>}</ComposedChart></ResponsiveContainer></div>
      </section>

      <section className="grid xl:grid-cols-2 gap-5">
        <div className="card premium-card p-5 md:p-6"><div className="flex gap-3"><div className="metric-icon"><Building2 size={18}/></div><div><h3 className="font-black">kWh/m²</h3><p className="text-xs text-slate-500">Área construída: 8.860,00 m²</p></div></div><div className="h-[280px] mt-5"><ResponsiveContainer><ComposedChart data={data}><CartesianGrid strokeDasharray="4 6" vertical={false}/><XAxis dataKey="label"/><YAxis/><Tooltip contentStyle={tip} formatter={v=>[`${num(v,4)} kWh/m²`,'Intensidade']}/><Line type="monotone" dataKey="kwhM2" stroke="#123b73" strokeWidth={3} dot={{r:4}} connectNulls/></ComposedChart></ResponsiveContainer></div></div>
        <div className="card premium-card p-5 md:p-6"><div className="flex gap-3"><div className="metric-icon"><Users size={18}/></div><div><h3 className="font-black">kWh per capita</h3><p className="text-xs text-slate-500">2.392 pessoas • referência populacional {POLI_PEOPLE_REFERENCE_YEAR}</p></div></div><div className="h-[280px] mt-5"><ResponsiveContainer><ComposedChart data={data}><CartesianGrid strokeDasharray="4 6" vertical={false}/><XAxis dataKey="label"/><YAxis/><Tooltip contentStyle={tip} formatter={v=>[`${num(v,4)} kWh/pessoa`,'Per capita']}/><Line type="monotone" dataKey="perCapita" stroke="#ed1c2e" strokeWidth={3} dot={{r:4}} connectNulls/></ComposedChart></ResponsiveContainer></div></div>
      </section>

      <section className="card p-5 md:p-6 overflow-x-auto"><div className="label">Detalhamento mensal</div><h2 className="section-title">Dados que alimentam os gráficos</h2><table className="detail-table mt-5"><thead><tr><th>Mês</th><th>Total</th><th>Ponta</th><th>Fora de Ponta</th><th>Consumo diário normalizado</th><th>kWh/m²</th><th>kWh/pessoa</th></tr></thead><tbody>{data.map(r=><tr key={r.mes}><td>{r.label}</td><td>{r.total==null?'—':`${num(r.total)} kWh`}</td><td>{r.ponta==null?'—':`${num(r.ponta)} kWh`}</td><td>{r.foraPonta==null?'—':`${num(r.foraPonta)} kWh`}</td><td>{r.diario==null?'—':`${num(r.diario,2)} kWh/dia`}</td><td>{r.kwhM2==null?'—':num(r.kwhM2,4)}</td><td>{r.perCapita==null?'—':num(r.perCapita,4)}</td></tr>)}</tbody></table></section>
    </>}
  </div>
}
