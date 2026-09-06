import { useEffect, useMemo, useState } from 'react'
import {
  AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Line, ComposedChart, Bar, Legend, ReferenceLine, BarChart
} from 'recharts'
import {
  Activity, AlertTriangle, ArrowDownRight, ArrowUpRight, BrainCircuit, CalendarDays,
  CalendarRange, CircleDollarSign, CircleGauge, Clock3, Database, Gauge, Layers3,
  Plus, ReceiptText, ShieldCheck, Sparkles, Target, TimerReset, Wallet, Zap
} from 'lucide-react'
import AnimatedNumber from '../components/AnimatedNumber'
import { brl, num, pct, monthLabel, monthLong, isoToBr } from '../utils/format'
import {
  allYearsMetrics, buildAnnualSeries, buildMonthlySeries, coverageStats, efficiencyScore,
  monthMetrics, yearMetrics
} from '../utils/analytics'

const tooltipStyle={border:'1px solid #dbe5f1',borderRadius:14,boxShadow:'0 12px 28px rgba(18,59,115,.12)',fontSize:12}

export default function DashboardPage({ bills, onAdd }) {
  const monthly = useMemo(() => buildMonthlySeries(bills), [bills])
  const annual = useMemo(() => buildAnnualSeries(monthly), [monthly])
  const years = useMemo(() => [...new Set(monthly.map(x=>x.mes?.slice(0,4)).filter(Boolean))].sort().reverse(), [monthly])
  const [mode,setMode]=useState('month')
  const [year,setYear]=useState(years[0] || String(new Date().getFullYear()))
  const yearMonths = useMemo(()=>monthly.filter(x=>x.mes?.startsWith(year)),[monthly,year])
  const [month,setMonth]=useState(yearMonths.at(-1)?.mes || monthly.at(-1)?.mes || '')

  useEffect(()=>{ if(years.length && !years.includes(year)) setYear(years[0]) },[years,year])
  useEffect(()=>{ const ys=monthly.filter(x=>x.mes?.startsWith(year)); if(ys.length && !ys.some(x=>x.mes===month)) setMonth(ys.at(-1).mes) },[year,monthly,month])

  const selectedMonth = monthly.find(x=>x.mes===month) || monthly.at(-1) || null
  const mm = monthMetrics(selectedMonth, monthly)
  const ym = yearMetrics(year, monthly, annual)
  const am = allYearsMetrics(monthly, annual)
  const coverage = coverageStats(monthly,bills)
  const score = efficiencyScore(selectedMonth,mm)

  const trendData = useMemo(()=>{
    if(mode==='all') return annual.map(x=>({label:x.year,consumo:x.consumo,gasto:x.gasto||null,media:x.mediaMensal||null}))
    const base = mode==='year' ? monthly.filter(x=>x.mes?.startsWith(year)) : monthly.slice(Math.max(0, monthly.findIndex(x=>x.mes===month)-11), monthly.findIndex(x=>x.mes===month)+1 || undefined)
    const avg=base.length?base.reduce((s,x)=>s+(Number(x.kwh)||0),0)/base.filter(x=>x.kwh!=null).length:null
    return base.map(x=>({label:monthLabel(x.mes),mes:x.mes,consumo:x.kwh,gasto:x.valor,demanda:x.demanda,dias:x.diasEfetivos,diario:x.consumoDiario,custoKwh:x.custoKwh,media:avg}))
  },[mode,annual,monthly,year,month])

  const dailyData = (mode==='all'?monthly:mode==='year'?monthly.filter(x=>x.mes?.startsWith(year)):monthly.slice(-12)).filter(x=>x.consumoDiario!=null).map(x=>({label:monthLabel(x.mes),diario:x.consumoDiario,dias:x.diasEfetivos}))
  const costData = (mode==='all'?monthly:mode==='year'?monthly.filter(x=>x.mes?.startsWith(year)):monthly.slice(-12)).filter(x=>x.custoKwh!=null).map(x=>({label:monthLabel(x.mes),custo:x.custoKwh,gasto:x.valor}))

  return <div className="space-y-5 page-enter">
    <Hero onAdd={onAdd} bills={bills}/>
    <PeriodFilter mode={mode} setMode={setMode} years={years} year={year} setYear={setYear} yearMonths={yearMonths} month={month} setMonth={setMonth}/>

    {!bills.length ? <EmptyState onAdd={onAdd}/> : <>
      <KpiSection mode={mode} month={selectedMonth} mm={mm} ym={ym} am={am} score={score}/>

      <section className="grid 2xl:grid-cols-[minmax(0,1.65fr)_minmax(330px,.75fr)] gap-5">
        <div className="card premium-card p-5 md:p-6 animate-enter">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div><div className="label text-[#123b73]">Tendência principal</div><h2 className="section-title">{mode==='all'?'Evolução por ano':'Consumo, média e comportamento do período'}</h2><p className="section-subtitle">{mode==='month'?'O mês selecionado é contextualizado com até 12 meses anteriores.':mode==='year'?`Visão mensal consolidada de ${year}.`:'Compara o consumo acumulado entre todos os anos disponíveis.'}</p></div>
            <div className="flex flex-wrap gap-2"><DataChip icon={Database} text={`${coverage.consumptionMonths} meses de consumo`}/><DataChip icon={ReceiptText} text={`${coverage.valueMonths} meses com valor`}/></div>
          </div>
          <div className="h-[360px] mt-5">
            <ResponsiveContainer>
              <ComposedChart data={trendData} margin={{left:4,right:12,top:8,bottom:4}}>
                <defs><linearGradient id="energyFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#123b73" stopOpacity={.3}/><stop offset="100%" stopColor="#123b73" stopOpacity={.02}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="4 6" vertical={false} stroke="#dce5f0"/>
                <XAxis dataKey="label" tick={{fontSize:12,fill:'#64748b'}} axisLine={false} tickLine={false}/>
                <YAxis yAxisId="left" tick={{fontSize:12,fill:'#64748b'}} axisLine={false} tickLine={false}/>
                <YAxis yAxisId="right" orientation="right" tick={{fontSize:12,fill:'#94a3b8'}} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={tooltipStyle} formatter={(v,n)=>[n==='gasto'?brl(v):`${num(v,1)} ${n==='consumo'?'kWh':''}`, n==='consumo'?'Consumo':n==='gasto'?'Gasto':'Média']}/>
                {mode==='all'?<><Bar yAxisId="left" dataKey="consumo" name="consumo" fill="#123b73" radius={[8,8,0,0]} maxBarSize={54}/><Line yAxisId="right" type="monotone" dataKey="gasto" name="gasto" stroke="#ed1c2e" strokeWidth={3} dot={{r:3}} connectNulls/></>:<><Area yAxisId="left" type="monotone" dataKey="consumo" name="consumo" stroke="#123b73" strokeWidth={3} fill="url(#energyFill)" connectNulls/><Line yAxisId="left" type="monotone" dataKey="media" name="media" stroke="#ed1c2e" strokeWidth={2} strokeDasharray="7 6" dot={false} connectNulls/><Line yAxisId="right" type="monotone" dataKey="gasto" name="gasto" stroke="#16a34a" strokeWidth={2.4} dot={{r:3}} connectNulls/></>}
                <Legend wrapperStyle={{fontSize:12,paddingTop:12}}/>
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
        <CyclePanel mode={mode} month={selectedMonth} mm={mm} ym={ym} am={am} coverage={coverage} score={score}/>
      </section>

      <section className="grid xl:grid-cols-2 gap-5">
        <ChartCard title="Consumo diário normalizado" subtitle="Compara meses de durações diferentes usando kWh por dia." icon={TimerReset} badge="kWh/dia">
          <ResponsiveContainer><BarChart data={dailyData}><CartesianGrid strokeDasharray="4 6" vertical={false}/><XAxis dataKey="label" tick={{fontSize:11}} axisLine={false}/><YAxis tick={{fontSize:11}} axisLine={false}/><Tooltip contentStyle={tooltipStyle} formatter={v=>[`${num(v,2)} kWh/dia`,'Média diária']}/><Bar dataKey="diario" fill="#1b4d8f" radius={[7,7,0,0]} maxBarSize={34}/></BarChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Custo efetivo por kWh" subtitle="Valor total dividido pelo consumo nos meses que possuem fatura salva." icon={CircleDollarSign} badge="R$/kWh">
          <ResponsiveContainer><AreaChart data={costData}><defs><linearGradient id="costFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ed1c2e" stopOpacity={.22}/><stop offset="100%" stopColor="#ed1c2e" stopOpacity={.02}/></linearGradient></defs><CartesianGrid strokeDasharray="4 6" vertical={false}/><XAxis dataKey="label" tick={{fontSize:11}} axisLine={false}/><YAxis tick={{fontSize:11}} axisLine={false}/><Tooltip contentStyle={tooltipStyle} formatter={v=>[brl(v),'Custo efetivo']}/><Area type="monotone" dataKey="custo" stroke="#ed1c2e" strokeWidth={3} fill="url(#costFill)" connectNulls/></AreaChart></ResponsiveContainer>
        </ChartCard>
      </section>

      <section className="grid xl:grid-cols-3 gap-5">
        <ExecutiveInsight mode={mode} selectedMonth={selectedMonth} mm={mm} ym={ym} am={am}/>
        <DataQuality coverage={coverage}/>
        <QuickActions selectedMonth={selectedMonth} mm={mm} score={score}/>
      </section>
    </>}
  </div>
}

function Hero({onAdd,bills}){return <section className="dashboard-hero animate-enter"><div className="hero-grid"/><div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5"><div><div className="hero-kicker"><Sparkles size={14}/>Centro de inteligência energética</div><h1>Dashboard de Energia UPE</h1><p>Consumo, gastos, dias de faturamento, demanda, tendências e recomendações em uma visão executiva.</p><div className="flex flex-wrap gap-2 mt-4"><span className="hero-chip"><ShieldCheck size={14}/>Gemini + validação técnica</span><span className="hero-chip"><Database size={14}/>{bills.length} conta{bills.length===1?'':'s'} confirmada{bills.length===1?'':'s'}</span></div></div><button className="hero-button" onClick={onAdd}><Plus size={19}/>Adicionar conta</button></div></section>}

function PeriodFilter({mode,setMode,years,year,setYear,yearMonths,month,setMonth}){return <section className="card period-bar animate-enter delay-1"><div className="period-tabs">{[['month','Mês'],['year','Ano'],['all','Todos os anos']].map(([id,l])=><button key={id} onClick={()=>setMode(id)} className={mode===id?'active':''}>{l}</button>)}</div><div className="period-controls">{mode!=='all'&&<label><span>Ano</span><select value={year} onChange={e=>setYear(e.target.value)}>{(years.length?years:[year]).map(y=><option key={y}>{y}</option>)}</select></label>}{mode==='month'&&<label><span>Mês</span><select value={month} onChange={e=>setMonth(e.target.value)}>{yearMonths.map(x=><option key={x.mes} value={x.mes}>{monthLong(x.mes)}</option>)}</select></label>}<div className="period-summary"><CalendarRange size={16}/><div><strong>{mode==='month'?monthLong(month):mode==='year'?`Ano de ${year}`:'Toda a série histórica'}</strong><span>Indicadores recalculados automaticamente</span></div></div></div></section>}

function EmptyState({onAdd}){return <section className="card empty-premium animate-enter delay-2"><div className="empty-logo"><img src="/upe-logo.png"/></div><div className="label text-[#123b73]">Base vazia</div><h2>Comece pela primeira conta de energia</h2><p>Ao enviar um PDF, o Gemini identifica os dados, você confere os campos e o dashboard monta automaticamente os períodos Mês, Ano e Todos os anos.</p><button className="btn-red mt-5" onClick={onAdd}><Plus size={18}/>Analisar primeira conta</button></section>}

function KpiSection({mode,month,mm,ym,am,score}){
 const cards=mode==='month' ? [
  {icon:Zap,title:'Consumo do mês',value:month?.kwh,kind:'kwh',note:monthLong(month?.mes)},
  {icon:Wallet,title:'Valor da fatura',value:month?.valor,kind:'money',note:month?.actual?'Fatura confirmada':'Valor não disponível no histórico'},
  {icon:CalendarDays,title:'Dias faturados',value:mm?.dias,kind:'days',note:month?.dias?'Extraído/derivado da leitura':'Baseado no calendário'},
  {icon:Activity,title:'Consumo por dia',value:mm?.consumoDiario,kind:'daily',note:'Normaliza o tamanho do ciclo'},
  {icon:CircleDollarSign,title:'Custo efetivo',value:mm?.custoKwh,kind:'moneykwh',note:'Valor total ÷ consumo'},
  {icon:CircleGauge,title:'Índice de eficiência',value:score,kind:'score',note:'Indicador heurístico do painel'}
 ] : mode==='year' ? [
  {icon:Zap,title:'Consumo no ano',value:ym?.current?.consumo,kind:'kwh',note:`${ym?.current?.mesesConsumo||0} mês(es) com consumo`},
  {icon:Wallet,title:'Gasto confirmado',value:ym?.current?.gasto,kind:'money',note:`${ym?.current?.mesesFaturados||0} fatura(s) com valor`},
  {icon:CalendarDays,title:'Dias monitorados',value:ym?.totalDays,kind:'days',note:'Somatório dos ciclos conhecidos'},
  {icon:Activity,title:'Média diária',value:ym?.avgDaily,kind:'daily',note:'Média dos meses disponíveis'},
  {icon:Target,title:'Projeção anual',value:ym?.projectedConsumption,kind:'kwh',note:'Projeção simples para 12 meses'},
  {icon:Gauge,title:'Demanda máxima',value:ym?.current?.demandaMax,kind:'kw',note:'Somente quando informada nas faturas'}
 ] : [
  {icon:Zap,title:'Consumo acumulado',value:am?.totalConsumption,kind:'kwh',note:`${am?.months||0} meses na série`},
  {icon:Wallet,title:'Gasto confirmado',value:am?.totalSpend,kind:'money',note:'Somente faturas com valor salvo'},
  {icon:Layers3,title:'Anos analisados',value:am?.years,kind:'plain',note:'Cobertura temporal da base'},
  {icon:Activity,title:'Média mensal',value:am?.avgMonthly,kind:'kwh',note:'Média de todos os meses com consumo'},
  {icon:TimerReset,title:'Média diária',value:am?.avgDaily,kind:'daily',note:'Quando os dias estão disponíveis'},
  {icon:CircleDollarSign,title:'Custo médio efetivo',value:am?.avgCostKwh,kind:'moneykwh',note:'Média dos meses com valor e consumo'}
 ]
 return <section className="grid sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4">{cards.map((c,i)=><MetricCard {...c} index={i} key={c.title}/>)}</section>
}

function MetricCard({icon:Icon,title,value,kind,note,index}){const fmt=v=>kind==='money'?brl(v):kind==='moneykwh'?`${brl(v)}/kWh`:kind==='kwh'?`${num(v)} kWh`:kind==='kw'?`${num(v,1)} kW`:kind==='days'?`${num(v)} dias`:kind==='daily'?`${num(v,2)} kWh/dia`:kind==='score'?`${num(v)}/100`:num(v);return <article className="metric-card animate-enter" style={{animationDelay:`${80+index*55}ms`}}><div className="metric-top"><div className="metric-icon"><Icon size={19}/></div><span className="metric-dot"/></div><div className="metric-title">{title}</div><div className="metric-value"><AnimatedNumber value={value} formatter={fmt}/></div><div className="metric-note">{note}</div></article>}

function CyclePanel({mode,month,mm,ym,am,coverage,score}){
 if(mode!=='month') return <div className="card premium-card p-5 md:p-6 animate-enter delay-2"><div className="label text-[#ed1c2e]">Resumo do período</div><h2 className="section-title">{mode==='year'?'Indicadores do ano':'Amplitude da base'}</h2><div className="mt-5 space-y-3">{mode==='year'?<><InfoRow label="Melhor mês em consumo" value={ym?.best?`${monthLabel(ym.best.mes)} • ${num(ym.best.kwh)} kWh`:'—'}/><InfoRow label="Mês de maior consumo" value={ym?.worst?`${monthLabel(ym.worst.mes)} • ${num(ym.worst.kwh)} kWh`:'—'}/><InfoRow label="Variação vs. ano anterior" value={ym?.consumptionChange==null?'Sem base':`${pct(ym.consumptionChange)} ${ym.consumptionChange>0?'↑':'↓'}`}/><InfoRow label="Custo médio efetivo" value={ym?.avgCostKwh?`${brl(ym.avgCostKwh)}/kWh`:'—'}/><InfoRow label="Projeção de gasto" value={brl(ym?.projectedSpend)}/></>:<><InfoRow label="Ano de maior consumo" value={am?.highestYear?`${am.highestYear.year} • ${num(am.highestYear.consumo)} kWh`:'—'}/><InfoRow label="Ano de menor consumo" value={am?.lowestYear?`${am.lowestYear.year} • ${num(am.lowestYear.consumo)} kWh`:'—'}/><InfoRow label="Variação do último ano" value={am?.latestChange==null?'Sem base':`${pct(am.latestChange)} ${am.latestChange>0?'↑':'↓'}`}/><InfoRow label="Faturas confirmadas" value={String(coverage.bills)}/><InfoRow label="Meses com demanda" value={String(coverage.demandMonths)}/></>}</div></div>
 const bill=month?.bill||{}
 return <div className="card premium-card p-5 md:p-6 animate-enter delay-2"><div className="flex items-start justify-between gap-3"><div><div className="label text-[#ed1c2e]">Ciclo da fatura</div><h2 className="section-title">Dias, leituras e vencimento</h2></div><div className={`score-badge ${score>=75?'good':score>=55?'warn':'bad'}`}><span>{score??'—'}</span><small>score</small></div></div><div className="cycle-timeline mt-5"><TimelinePoint label="Leitura anterior" value={isoToBr(bill.periodo_leitura_inicio)} /><span/><TimelinePoint label="Leitura atual" value={isoToBr(bill.periodo_leitura_fim)} /><span/><TimelinePoint label="Vencimento" value={isoToBr(bill.data_vencimento)} /></div><div className="mt-5 grid grid-cols-2 gap-3"><InfoTile icon={CalendarDays} label="Ciclo" value={`${num(mm?.dias)} dias`}/><InfoTile icon={Activity} label="Média diária" value={`${num(mm?.consumoDiario,2)} kWh`}/><InfoTile icon={Wallet} label="Gasto/dia" value={brl(mm?.gastoDiario)}/><InfoTile icon={Clock3} label="Situação" value={mm?.diasVenc==null?'Sem vencimento':mm.diasVenc>=0?`${mm.diasVenc} dia(s) até vencer`:`Vencida há ${Math.abs(mm.diasVenc)} dia(s)`}/></div>{bill.proxima_leitura&&<div className="mt-3 notice-info"><CalendarRange size={15}/>Próxima leitura prevista: <strong>{isoToBr(bill.proxima_leitura)}</strong></div>}</div>
}

function ChartCard({title,subtitle,icon:Icon,badge,children}){return <div className="card premium-card p-5 md:p-6 animate-enter"><div className="flex items-start justify-between"><div className="flex gap-3"><div className="metric-icon"><Icon size={18}/></div><div><h3 className="font-black text-[1.05rem]">{title}</h3><p className="text-xs text-slate-500 mt-1">{subtitle}</p></div></div><span className="badge bg-slate-100 text-slate-600">{badge}</span></div><div className="h-[290px] mt-5">{children}</div></div>}

function ExecutiveInsight({mode,selectedMonth,mm,ym,am}){let title='Leitura executiva', text='', detail='';if(mode==='month'){const diag=selectedMonth?.bill?.diagnostico; title=monthLong(selectedMonth?.mes);text=diag?.leitura_executiva||diag?.resumo||'O Gemini não forneceu uma leitura executiva para esta fatura.';detail=mm?.historyDeviation==null?'Histórico insuficiente para medir desvio.':`${pct(mm.historyDeviation)} ${mm.historyDeviation>0?'acima':'abaixo'} da média histórica.`}else if(mode==='year'){text=ym?.consumptionChange==null?'O ano selecionado ainda não possui base anterior suficiente para comparação anual.':`O consumo acumulado está ${pct(ym.consumptionChange)} ${ym.consumptionChange>0?'acima':'abaixo'} do ano anterior.`;detail=`Projeção simples: ${num(ym?.projectedConsumption)} kWh para 12 meses.`}else{text=am?.latestChange==null?'A base ainda não possui dois anos completos para comparação direta.':`O último ano disponível variou ${pct(am.latestChange)} em relação ao anterior.`;detail=`A série reúne ${am?.months||0} meses de consumo em ${am?.years||0} ano(s).`}return <div className="card insight-card p-5 animate-enter"><div className="insight-icon"><BrainCircuit size={21}/></div><div className="label text-[#123b73]">Inteligência executiva</div><h3>{title}</h3><p>{text}</p><div className="insight-footer"><Sparkles size={14}/>{detail}</div></div>}

function DataQuality({coverage}){const completeness=Math.min(100,Math.round(((coverage.consumptionMonths?1:0)+(coverage.valueMonths/Math.max(1,coverage.consumptionMonths))+(coverage.demandMonths/Math.max(1,coverage.consumptionMonths)))*33.33));return <div className="card p-5 animate-enter"><div className="label">Qualidade da base</div><h3 className="font-black text-lg mt-1">Cobertura dos dados</h3><div className="quality-gauge mt-5"><div className="quality-value">{completeness}%</div><div className="quality-bar"><span style={{width:`${completeness}%`}}/></div></div><div className="mt-4 space-y-2"><CoverageLine label="Meses com consumo" value={coverage.consumptionMonths}/><CoverageLine label="Meses com valor real" value={coverage.valueMonths}/><CoverageLine label="Meses com demanda" value={coverage.demandMonths}/><CoverageLine label="Contas confirmadas" value={coverage.bills}/></div><p className="text-[11px] text-slate-400 mt-4">Consumos históricos podem vir de uma única fatura; gastos exigem fatura salva do respectivo mês.</p></div>}

function QuickActions({selectedMonth,mm,score}){const above=mm?.historyDeviation!=null&&mm.historyDeviation>0;return <div className="card p-5 animate-enter"><div className="label text-[#ed1c2e]">Ações rápidas</div><h3 className="font-black text-lg mt-1">O que merece atenção</h3><div className="mt-4 space-y-3"><ActionItem icon={above?ArrowUpRight:ArrowDownRight} tone={above?'red':'green'} title={above?'Consumo acima da média':'Consumo controlado'} text={mm?.historyDeviation==null?'Ainda sem média histórica suficiente.':`${pct(mm.historyDeviation)} de diferença para a média histórica.`}/><ActionItem icon={Target} title="Potencial teórico" text={mm?.theoreticalSavingKwh>0?`Voltar à média representaria cerca de ${num(mm.theoreticalSavingKwh)} kWh e ${brl(mm.theoreticalSavingBrl)} neste perfil de custo.`:'Não há excesso calculável sobre a média histórica.'}/><ActionItem icon={Gauge} tone={selectedMonth?.demanda!=null&&selectedMonth?.demandaContratada!=null&&selectedMonth.demanda>selectedMonth.demandaContratada?'red':'blue'} title="Demanda" text={selectedMonth?.demanda==null?'Não informada nesta fatura.':selectedMonth?.demandaContratada==null?`${num(selectedMonth.demanda,1)} kW medidos; contrato não informado.`:`${num(selectedMonth.demanda,1)} kW medidos para ${num(selectedMonth.demandaContratada,1)} kW contratados.`}/><ActionItem icon={CircleGauge} tone={score>=75?'green':score>=55?'amber':'red'} title="Score do período" text={score==null?'Sem dados suficientes.':`${score}/100 • indicador heurístico para priorização, não auditoria elétrica.`}/></div></div>}

function DataChip({icon:Icon,text}){return <span className="data-chip"><Icon size={13}/>{text}</span>}
function InfoRow({label,value}){return <div className="info-row"><span>{label}</span><strong>{value}</strong></div>}
function TimelinePoint({label,value}){return <div><strong>{value}</strong><span>{label}</span></div>}
function InfoTile({icon:Icon,label,value}){return <div className="info-tile"><Icon size={16}/><div><span>{label}</span><strong>{value}</strong></div></div>}
function CoverageLine({label,value}){return <div className="coverage-line"><span>{label}</span><strong>{value}</strong></div>}
function ActionItem({icon:Icon,title,text,tone='blue'}){return <div className={`action-item ${tone}`}><div><Icon size={17}/></div><section><strong>{title}</strong><p>{text}</p></section></div>}
