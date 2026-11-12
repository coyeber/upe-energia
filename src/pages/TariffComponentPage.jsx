import { useMemo, useState } from 'react'
import { Activity, CircleDollarSign, ReceiptText } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, LabelList, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { DetailHeader, DetailMetric, EmptyDetail, YearSelector } from '../components/DetailUI'
import { buildMonthlySeries, yearRows } from '../utils/analytics'
import { brl, monthLabel, num } from '../utils/format'

const tip={border:'1px solid #dbe5f1',borderRadius:14,boxShadow:'0 12px 28px rgba(18,59,115,.12)',fontSize:12}
const n=v=>v===null||v===undefined||v===''?null:Number(v)
const sum=arr=>{const list=arr.map(n).filter(Number.isFinite);return list.length?list.reduce((a,b)=>a+b,0):null}

export default function TariffComponentPage({bills,onBack}){
  const monthly=useMemo(()=>buildMonthlySeries(bills),[bills])
  const years=useMemo(()=>[...new Set(monthly.map(x=>x.mes?.slice(0,4)).filter(Boolean))].sort().reverse(),[monthly])
  const [year,setYear]=useState(years[0]||String(new Date().getFullYear()))
  const rows=useMemo(()=>yearRows(monthly,year),[monthly,year])
  const data=rows.map(x=>({
    label:monthLabel(x.mes),mes:x.mes,
    pQty:x.ponta?.tusdKwh,fpQty:x.foraPonta?.tusdKwh,
    pValue:x.ponta?.tusdValor,fpValue:x.foraPonta?.tusdValor,
    pUnit:x.ponta?.tusdTarifa,fpUnit:x.foraPonta?.tusdTarifa
  }))
  const has=data.some(x=>x.pQty!=null||x.fpQty!=null||x.pValue!=null||x.fpValue!=null)
  const totalPQty=sum(data.map(x=>x.pQty)),totalFPQty=sum(data.map(x=>x.fpQty))
  const totalPValue=sum(data.map(x=>x.pValue)),totalFPValue=sum(data.map(x=>x.fpValue))
  const formatPrice=v=>v==null?'':num(v,5)
  return <div className="space-y-5 page-enter">
    <DetailHeader icon={ReceiptText} kicker="Análise tarifária" title="Uso do Sistema — NP e FP" subtitle="Quantidades, preços das tarifas e valores de fatura separados por posto, conforme os itens da conta." onBack={onBack}/>
    <YearSelector years={years.length?years:[year]} year={year} setYear={setYear}/>
    {!rows.length||!has?<EmptyDetail text="Ainda não existem dados de Uso Sistema Encar. NP/FP suficientes nas faturas cadastradas."/>:<>
      <section className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <DetailMetric icon={ReceiptText} label="Uso Sistema Encar. NP" value={totalPQty==null?'—':`${num(totalPQty)} kWh`} note="Ponta • 17h30 às 20h30" tone="red"/>
        <DetailMetric icon={ReceiptText} label="Uso Sist. Encar. FP" value={totalFPQty==null?'—':`${num(totalFPQty)} kWh`} note="Demais horários"/>
        <DetailMetric icon={CircleDollarSign} label="Valor da fatura NP" value={brl(totalPValue)} note="Somente valores do posto NP" tone="red"/>
        <DetailMetric icon={CircleDollarSign} label="Valor da fatura FP" value={brl(totalFPValue)} note="Somente valores do posto FP" tone="green"/>
      </section>
      <section className="card premium-card p-5 md:p-6">
        <div className="label text-[#123b73]">Quantidades de uso do sistema</div>
        <h2 className="section-title">Uso Sistema Encar. NP x FP — {year}</h2>
        <p className="section-subtitle">Barras separadas em kWh, sem somar os postos na mesma série.</p>
        <div className="h-[350px] mt-5"><ResponsiveContainer><BarChart data={data}><CartesianGrid strokeDasharray="4 6" vertical={false}/><XAxis dataKey="label" height={48}/><YAxis width={74} label={{value:'kWh',angle:-90,position:'insideLeft'}}/><Tooltip contentStyle={tip} formatter={(v,nm)=>[`${num(v)} kWh`,nm]}/><Bar dataKey="pQty" name="Uso Sistema Encar. NP" fill="#ed1c2e" radius={[6,6,0,0]} maxBarSize={38}/><Bar dataKey="fpQty" name="Uso Sist. Encar. FP" fill="#123b73" radius={[6,6,0,0]} maxBarSize={38}/><Legend/></BarChart></ResponsiveContainer></div>
      </section>
      <section className="card premium-card p-5 md:p-6">
        <div className="label text-[#ed1c2e]">Preços informados na fatura</div>
        <h2 className="section-title">Preço da Tarifa (NP e FP)</h2>
        <p className="section-subtitle">Preços unitários originais da fatura. Rótulos exibidos acima das barras quando disponíveis.</p>
        <div className="h-[350px] mt-5"><ResponsiveContainer><BarChart data={data} margin={{top:22,right:8,left:3,bottom:8}}><CartesianGrid strokeDasharray="4 6" vertical={false}/><XAxis dataKey="label" height={48}/><YAxis width={80} label={{value:'R$/kWh',angle:-90,position:'insideLeft'}}/><Tooltip contentStyle={tip} formatter={(v,nm)=>[`${num(v,8)} R$/kWh`,nm]}/><Bar dataKey="pUnit" name="Tarifa NP" fill="#ed1c2e" radius={[7,7,0,0]} maxBarSize={45}><LabelList dataKey="pUnit" position="top" formatter={formatPrice} fontSize={10}/></Bar><Bar dataKey="fpUnit" name="Tarifa FP" fill="#123b73" radius={[7,7,0,0]} maxBarSize={45}><LabelList dataKey="fpUnit" position="top" formatter={formatPrice} fontSize={10}/></Bar><Legend/></BarChart></ResponsiveContainer></div>
      </section>
      <section className="card premium-card p-5 md:p-6">
        <div className="label text-[#123b73]">Valores faturados</div>
        <h2 className="section-title">Valor da fatura NP x FP</h2>
        <p className="section-subtitle">Valores em reais de cada posto, conforme os itens discriminados.</p>
        <div className="h-[350px] mt-5"><ResponsiveContainer><BarChart data={data}><CartesianGrid strokeDasharray="4 6" vertical={false}/><XAxis dataKey="label" height={48}/><YAxis width={82} label={{value:'R$',angle:-90,position:'insideLeft'}}/><Tooltip contentStyle={tip} formatter={(v,nm)=>[brl(v),nm]}/><Bar dataKey="pValue" name="Valor da fatura NP" fill="#ed1c2e" radius={[6,6,0,0]} maxBarSize={38}/><Bar dataKey="fpValue" name="Valor da fatura FP" fill="#123b73" radius={[6,6,0,0]} maxBarSize={38}/><Legend/></BarChart></ResponsiveContainer></div>
      </section>
      <section className="card p-5 md:p-6 overflow-x-auto"><div className="flex gap-3"><div className="metric-icon"><Activity size={18}/></div><div><div className="label">Detalhamento mensal</div><h2 className="section-title !mt-0">Quantidades, tarifas e valores da fatura</h2></div></div>
        <table className="detail-table mt-5"><thead><tr><th>Mês</th><th>Uso Sistema Encar. NP</th><th>Tarifa NP</th><th>Valor da fatura NP</th><th>Uso Sist. Encar. FP</th><th>Tarifa FP</th><th>Valor da fatura FP</th></tr></thead><tbody>{data.map(r=><tr key={r.mes}><td>{r.label}</td><td>{r.pQty==null?'—':`${num(r.pQty)} kWh`}</td><td>{r.pUnit==null?'—':`${num(r.pUnit,8)} R$/kWh`}</td><td>{brl(r.pValue)}</td><td>{r.fpQty==null?'—':`${num(r.fpQty)} kWh`}</td><td>{r.fpUnit==null?'—':`${num(r.fpUnit,8)} R$/kWh`}</td><td>{brl(r.fpValue)}</td></tr>)}</tbody></table>
      </section>
    </>}
  </div>
}
