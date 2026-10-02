import { useMemo, useState } from 'react'
import { Activity, CircleDollarSign, ReceiptText, Zap } from 'lucide-react'
import { Bar, CartesianGrid, ComposedChart, Legend, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { DetailHeader, DetailMetric, EmptyDetail, YearSelector } from '../components/DetailUI'
import { annualAverage, buildMonthlySeries, yearRows } from '../utils/analytics'
import { brl, monthLabel, num } from '../utils/format'

const tip={border:'1px solid #dbe5f1',borderRadius:14,boxShadow:'0 12px 28px rgba(18,59,115,.12)',fontSize:12}
const n=v=>v===null||v===undefined||v===''?null:Number(v)
const sum=arr=>{const x=arr.map(n).filter(Number.isFinite);return x.length?x.reduce((a,b)=>a+b,0):null}

export default function TariffComponentPage({bills,onBack,type='TE'}){
  const isTE=type==='TE'
  const monthly=useMemo(()=>buildMonthlySeries(bills),[bills])
  const years=useMemo(()=>[...new Set(monthly.map(x=>x.mes?.slice(0,4)).filter(Boolean))].sort().reverse(),[monthly])
  const [year,setYear]=useState(years[0]||String(new Date().getFullYear()))
  const rows=useMemo(()=>yearRows(monthly,year),[monthly,year])
  const getPQty=x=>isTE?x.ponta?.teKwh:x.ponta?.tusdKwh
  const getFPQty=x=>isTE?x.foraPonta?.teKwh:x.foraPonta?.tusdKwh
  const getPValue=x=>isTE?x.ponta?.teValor:x.ponta?.tusdValor
  const getFPValue=x=>isTE?x.foraPonta?.teValor:x.foraPonta?.tusdValor
  const avgPQty=annualAverage(rows,getPQty),avgFPQty=annualAverage(rows,getFPQty),avgPValue=annualAverage(rows,getPValue),avgFPValue=annualAverage(rows,getFPValue)
  const totalPQty=sum(rows.map(getPQty)),totalFPQty=sum(rows.map(getFPQty)),totalPValue=sum(rows.map(getPValue)),totalFPValue=sum(rows.map(getFPValue))
  const data=rows.map(x=>({label:monthLabel(x.mes),mes:x.mes,pQty:getPQty(x),fpQty:getFPQty(x),pValue:getPValue(x),fpValue:getFPValue(x),pUnit:isTE?x.ponta?.teCustoEfetivoKwh:x.ponta?.tusdCustoEfetivoKwh,fpUnit:isTE?x.foraPonta?.teCustoEfetivoKwh:x.foraPonta?.tusdCustoEfetivoKwh}))
  const has=data.some(x=>x.pQty!=null||x.fpQty!=null||x.pValue!=null||x.fpValue!=null)
  const Icon=isTE?Zap:ReceiptText
  const fullName=isTE?'Tarifa de Energia (TE)':'Tarifa de Uso do Sistema de Distribuição (TUSD)'
  return <div className="space-y-5 page-enter">
    <DetailHeader icon={Icon} kicker="Análise tarifária" title={fullName} subtitle={`Análise mensal de consumo e custo de ${type}, sempre separando Ponta e Fora de Ponta.`} onBack={onBack}/>
    <YearSelector years={years.length?years:[year]} year={year} setYear={setYear}/>
    {!rows.length||!has?<EmptyDetail text={`Ainda não existem dados de ${type} suficientes nas faturas cadastradas.`}/>:<>
      <section className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <DetailMetric icon={Icon} label={`${type} • consumo Ponta`} value={totalPQty==null?'—':`${num(totalPQty)} kWh`} note="17h30 às 20h30" tone="red"/>
        <DetailMetric icon={Icon} label={`${type} • consumo Fora de Ponta`} value={totalFPQty==null?'—':`${num(totalFPQty)} kWh`} note="Demais horários"/>
        <DetailMetric icon={CircleDollarSign} label={`${type} • custo Ponta`} value={brl(totalPValue)} note="Sem misturar com Fora de Ponta" tone="red"/>
        <DetailMetric icon={CircleDollarSign} label={`${type} • custo Fora de Ponta`} value={brl(totalFPValue)} note="Sem misturar com Ponta" tone="green"/>
      </section>

      <section className="card premium-card p-5 md:p-6">
        <div className="label text-[#123b73]">Quantidade faturada</div><h2 className="section-title">Consumo relacionado à {type} — {year}</h2><p className="section-subtitle">Barras independentes para Ponta e Fora de Ponta. As linhas tracejadas mostram as respectivas médias mensais do ano.</p>
        <div className="h-[390px] mt-5"><ResponsiveContainer><ComposedChart data={data}><CartesianGrid strokeDasharray="4 6" vertical={false}/><XAxis dataKey="label"/><YAxis/><Tooltip contentStyle={tip} formatter={(v,nm)=>[`${num(v)} kWh`,nm]}/><Bar dataKey="pQty" name={`${type} • Ponta`} fill="#ed1c2e" radius={[6,6,0,0]} maxBarSize={34}/><Bar dataKey="fpQty" name={`${type} • Fora de Ponta`} fill="#123b73" radius={[6,6,0,0]} maxBarSize={34}/>{avgPQty!=null&&<ReferenceLine y={avgPQty} stroke="#ed1c2e" strokeDasharray="7 6" label={{value:'Média P',fill:'#ed1c2e',fontSize:11}}/>}{avgFPQty!=null&&<ReferenceLine y={avgFPQty} stroke="#123b73" strokeDasharray="7 6" label={{value:'Média FP',fill:'#123b73',fontSize:11}}/>}<Legend/></ComposedChart></ResponsiveContainer></div>
      </section>

      <section className="card premium-card p-5 md:p-6">
        <div className="label text-[#ed1c2e]">Custo faturado</div><h2 className="section-title">Custo de {type} por posto tarifário</h2><p className="section-subtitle">Não há soma de Ponta com Fora de Ponta na análise do custo efetivo. Cada faixa permanece independente.</p>
        <div className="h-[390px] mt-5"><ResponsiveContainer><ComposedChart data={data}><CartesianGrid strokeDasharray="4 6" vertical={false}/><XAxis dataKey="label"/><YAxis/><Tooltip contentStyle={tip} formatter={(v,nm)=>[brl(v),nm]}/><Bar dataKey="pValue" name={`${type} • Ponta`} fill="#ed1c2e" radius={[6,6,0,0]} maxBarSize={34}/><Bar dataKey="fpValue" name={`${type} • Fora de Ponta`} fill="#123b73" radius={[6,6,0,0]} maxBarSize={34}/>{avgPValue!=null&&<ReferenceLine y={avgPValue} stroke="#ed1c2e" strokeDasharray="7 6" label={{value:'Média custo P',fill:'#ed1c2e',fontSize:11}}/>}{avgFPValue!=null&&<ReferenceLine y={avgFPValue} stroke="#123b73" strokeDasharray="7 6" label={{value:'Média custo FP',fill:'#123b73',fontSize:11}}/>}<Legend/></ComposedChart></ResponsiveContainer></div>
      </section>

      <section className="card p-5 md:p-6 overflow-x-auto"><div className="flex gap-3"><div className="metric-icon"><Activity size={18}/></div><div><div className="label">Detalhamento mensal</div><h2 className="section-title !mt-0">Quantidade, valor e custo efetivo</h2></div></div><table className="detail-table mt-5"><thead><tr><th>Mês</th><th>Ponta kWh</th><th>Ponta R$</th><th>Ponta R$/kWh</th><th>FP kWh</th><th>FP R$</th><th>FP R$/kWh</th></tr></thead><tbody>{data.map(r=><tr key={r.mes}><td>{r.label}</td><td>{r.pQty==null?'—':num(r.pQty)}</td><td>{r.pValue==null?'—':brl(r.pValue)}</td><td>{r.pUnit==null?'—':`${brl(r.pUnit)}/kWh`}</td><td>{r.fpQty==null?'—':num(r.fpQty)}</td><td>{r.fpValue==null?'—':brl(r.fpValue)}</td><td>{r.fpUnit==null?'—':`${brl(r.fpUnit)}/kWh`}</td></tr>)}</tbody></table></section>
    </>}
  </div>
}
