import { useMemo } from 'react'
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { AlertTriangle, BarChart3, BrainCircuit, FileBarChart2, Printer, ShieldCheck, Sparkles, Target, Wallet, Zap } from 'lucide-react'
import { brl, num, monthLong } from '../utils/format'
import { allYearsMetrics, buildAnnualSeries, buildMonthlySeries, coverageStats } from '../utils/analytics'

export default function ReportPage({bills}){
 const monthly=useMemo(()=>buildMonthlySeries(bills),[bills])
 const annual=useMemo(()=>buildAnnualSeries(monthly),[monthly])
 const all=allYearsMetrics(monthly,annual)
 const coverage=coverageStats(monthly,bills)
 const alerts=bills.flatMap(b=>(b.diagnostico?.alertas||[]).map(x=>({text:x,month:b.mes_referencia}))).slice(0,8)
 const actions=[...new Set(bills.flatMap(b=>[...(b.diagnostico?.acoes_prioritarias||[]),...(b.diagnostico?.oportunidades_economia||[])]))].slice(0,10)
 const latest=bills[0]
 if(!bills.length) return <div className="card p-12 text-center page-enter"><FileBarChart2 className="mx-auto text-[#123b73]" size={42}/><h2 className="text-2xl font-black mt-4">Relatório ainda indisponível</h2><p className="text-slate-500 mt-2">Cadastre ao menos uma conta para gerar a visão executiva.</p></div>
 return <div className="space-y-5 page-enter report-page">
  <section className="report-hero"><div><div className="hero-kicker"><FileBarChart2 size={14}/>Relatório executivo</div><h1>Panorama de Gestão Energética UPE</h1><p>Resumo pronto para apresentação, com indicadores objetivos, cobertura da base, alertas e prioridades de ação.</p></div><button className="btn-secondary print-hide" onClick={()=>window.print()}><Printer size={17}/>Imprimir / Salvar PDF</button></section>

  <section className="report-kpis"><ReportKpi icon={Zap} label="Consumo acumulado" value={`${num(all.totalConsumption)} kWh`}/><ReportKpi icon={Wallet} label="Gasto confirmado" value={brl(all.totalSpend)}/><ReportKpi icon={BarChart3} label="Meses monitorados" value={String(all.months)}/><ReportKpi icon={ShieldCheck} label="Faturas confirmadas" value={String(coverage.bills)}/></section>

  <section className="grid xl:grid-cols-[1.35fr_.65fr] gap-5">
   <div className="card p-5 md:p-6"><div className="label">Comparativo anual</div><h2 className="section-title">Consumo por ano</h2><p className="section-subtitle">Consolida todo o histórico mensal reconhecido nas faturas.</p><div className="h-[330px] mt-5"><ResponsiveContainer><BarChart data={annual}><CartesianGrid strokeDasharray="4 6" vertical={false}/><XAxis dataKey="year"/><YAxis/><Tooltip formatter={v=>[`${num(v)} kWh`,'Consumo']}/><Bar dataKey="consumo" fill="#123b73" radius={[9,9,0,0]} maxBarSize={58}/></BarChart></ResponsiveContainer></div></div>
   <div className="card p-5 md:p-6"><div className="label text-[#ed1c2e]">Leitura executiva</div><h2 className="section-title">Situação mais recente</h2><div className="report-latest"><span>{monthLong(latest.mes_referencia)}</span><strong>{num(latest.consumo_kwh)} kWh</strong><em>{brl(latest.valor_total)}</em></div><p className="text-sm text-slate-600 leading-relaxed mt-4">{latest.diagnostico?.leitura_executiva||latest.diagnostico?.resumo||'Sem síntese executiva retornada pelo sistema.'}</p><div className="report-quality mt-5"><div><span>Consumo</span><strong>{coverage.consumptionMonths} meses</strong></div><div><span>Financeiro</span><strong>{coverage.valueMonths} meses</strong></div><div><span>Demanda</span><strong>{coverage.demandMonths} meses</strong></div></div></div>
  </section>

  <section className="grid lg:grid-cols-2 gap-5">
   <div className="card p-5 md:p-6"><div className="flex items-center gap-3"><div className="report-section-icon red"><AlertTriangle size={18}/></div><div><div className="label">Riscos e alertas</div><h2 className="section-title !mt-0">Pontos que merecem verificação</h2></div></div><div className="report-list mt-5">{alerts.length?alerts.map((a,i)=><div key={i}><span>{i+1}</span><p>{a.text}<small>{a.month?monthLong(a.month):''}</small></p></div>):<div><span>✓</span><p>Nenhum alerta específico foi registrado nas análises salvas.</p></div>}</div></div>
   <div className="card p-5 md:p-6"><div className="flex items-center gap-3"><div className="report-section-icon green"><Target size={18}/></div><div><div className="label">Plano de ação</div><h2 className="section-title !mt-0">Prioridades sugeridas</h2></div></div><div className="report-list green mt-5">{actions.length?actions.map((a,i)=><div key={i}><span>{i+1}</span><p>{a}</p></div>):<div><span>1</span><p>Amplie a base mensal e estabeleça metas por unidade, setor e período.</p></div>}</div></div>
  </section>

  <section className="report-disclaimer"><BrainCircuit size={18}/><div><strong>Como interpretar este relatório</strong><p>Os números do painel vêm das contas confirmadas e do histórico extraído dos PDFs. As recomendações automáticas são apoio à decisão e devem ser validadas com medições, contratos, tarifas e inspeções em campo antes de qualquer intervenção.</p></div></section>
 </div>
}
function ReportKpi({icon:Icon,label,value}){return <div className="report-kpi"><div><Icon size={19}/></div><span>{label}</span><strong>{value}</strong></div>}
