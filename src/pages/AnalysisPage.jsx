import { useMemo, useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, CartesianGrid, XAxis, YAxis, ReferenceLine } from 'recharts'
import {
  Activity, AlertTriangle, BadgeDollarSign, BrainCircuit, Building2, CalendarClock, CircleGauge,
  Gauge, Leaf, Lightbulb, PiggyBank, ReceiptText, ShieldAlert, Sparkles, Target,
  ThermometerSun, Wrench, Zap, Clock3, Landmark
} from 'lucide-react'
import { brl, num, monthLong, isoToBr, confidenceLabel, pct } from '../utils/format'
import { buildMonthlySeries, monthMetrics, average, billFinancials, POLI_AREA_M2, POLI_PEOPLE } from '../utils/analytics'

const PIE=['#123b73','#ed1c2e','#16a34a','#f59e0b','#7c3aed','#0891b2','#64748b']

export default function AnalysisPage({bills}){
 const monthly=useMemo(()=>buildMonthlySeries(bills),[bills])
 const [billId,setBillId]=useState(bills[0]?.id||'')
 const current=bills.find(b=>b.id===billId)||bills[0]
 const [target,setTarget]=useState(10)
 if(!current) return <div className="card p-12 text-center page-enter"><Lightbulb className="mx-auto text-[#123b73]" size={40}/><h2 className="text-2xl font-black mt-4">Nenhuma análise disponível</h2><p className="text-slate-500 mt-2">Envie uma conta para gerar o diagnóstico técnico e financeiro.</p></div>
 const month=monthly.find(x=>x.mes===current.mes_referencia),metrics=monthMetrics(month,monthly),hist=current.historico_consumo||[],avg=average(hist.map(x=>x.kwh)),fin=billFinancials(current)
 const baseConsumption=current.consumo_faturado_kwh??current.consumo_kwh
 const savingMonthly=current.valor_total?current.valor_total*target/100:null,savingAnnual=savingMonthly?savingMonthly*12:null,targetKwh=baseConsumption?baseConsumption*(1-target/100):null
 const demandExcess=current.demanda_kw!=null&&current.demanda_contratada_kw!=null?current.demanda_kw-current.demanda_contratada_kw:null
 const diag=current.diagnostico||{},components=(current.componentes_fatura||[]).filter(x=>x.valor!=null&&x.valor>0),componentTotal=components.reduce((s,x)=>s+Number(x.valor||0),0),componentData=components.slice(0,7).map(x=>({name:x.nome,value:Number(x.valor)}))
 const dailyGoal=targetKwh&&metrics?.dias?targetKwh/metrics.dias:null
 const executive=buildExecutive(metrics,baseConsumption)
 const facts=[
  {icon:Zap,title:'Consumo faturado/pago',value:baseConsumption!=null?`${num(baseConsumption)} kWh`:'Não informado',text:'Energia faturada identificada na conta, sem misturar com demanda em kW.'},
  {icon:Activity,title:'Consumo diário normalizado',value:metrics?.consumoDiario?`${num(metrics.consumoDiario,2)} kWh/dia`:'Não disponível',text:`Normalizado por ${metrics?.dias||'—'} dias do ciclo.`},
  {icon:Building2,title:'Intensidade por área',value:baseConsumption!=null?`${num(baseConsumption/POLI_AREA_M2,3)} kWh/m²`:'—',text:'Consumo faturado dividido por 8.860 m².'},
  {icon:Building2,title:'Consumo per capita',value:baseConsumption!=null?`${num(baseConsumption/POLI_PEOPLE,3)} kWh/pessoa`:'—',text:'Consumo faturado dividido por 2.392 pessoas.'},
  {icon:CalendarClock,title:'Ciclo de faturamento',value:metrics?.dias?`${num(metrics.dias)} dias`:'Não informado',text:`Leitura: ${isoToBr(current.periodo_leitura_inicio)} → ${isoToBr(current.periodo_leitura_fim)}.`},
  {icon:Target,title:'Meta de consumo',value:targetKwh?`${num(targetKwh)} kWh`:'—',text:dailyGoal?`Meta operacional aproximada de ${num(dailyGoal,2)} kWh/dia.`:'A meta depende de consumo e dias.'},
  {icon:PiggyBank,title:'Economia mensal simulada',value:brl(savingMonthly),text:`Simulação matemática de redução de ${target}% sobre uma fatura semelhante.`},
  {icon:Leaf,title:'Economia anual simulada',value:brl(savingAnnual),text:'Projeção simples para 12 meses.'},
  {icon:Gauge,title:'Demanda faturada/paga',value:fin.demandaFaturadaKw!=null?`${num(fin.demandaFaturadaKw,1)} kW`:'Não informada',text:'Demanda cobrada/faturada quando explicitamente identificada.'},
  {icon:ShieldAlert,title:'Risco de ultrapassagem',value:demandExcess==null?'Sem base':demandExcess>0?`${num(demandExcess,1)} kW acima`:'Dentro do contratado',text:'Só caracteriza cobrança se a fatura trouxer evidência explícita.'},
  {icon:Landmark,title:'Multas',value:fin.multasTotal!=null?brl(fin.multasTotal):'Não informado',text:`Quantidade identificada: ${fin.multasCount==null?'—':fin.multasCount}.`},
  {icon:ReceiptText,title:'Impostos',value:fin.impostosTotal!=null?brl(fin.impostosTotal):'Não informado',text:`Quantidade identificada: ${fin.impostosCount==null?'—':fin.impostosCount}.`},
  {icon:ReceiptText,title:'Iluminação pública',value:fin.iluminacaoPublica!=null?brl(fin.iluminacaoPublica):'Não informada',text:'Cobrança exibida separadamente quando identificada.'},
  {icon:CircleGauge,title:'Variação vs. mês anterior',value:metrics?.prevChange==null?'Sem base':`${pct(metrics.prevChange)} ${metrics.prevChange>0?'↑':'↓'}`,text:'Compara consumo faturado, não o valor da fatura.'},
  {icon:BrainCircuit,title:'Confiabilidade da análise',value:confidenceLabel(current.confianca?.geral),text:(current.confianca?.observacoes||[])[0]||'Confira os campos antes de tomar decisões operacionais.'}
 ]
 return <div className="space-y-5 page-enter">
  <section className="analysis-hero"><div className="relative z-10"><div className="hero-kicker"><BrainCircuit size={14}/>Diagnóstico técnico e financeiro</div><h1>Análises e oportunidades de gestão energética</h1><p>Indicadores calculados pelo sistema, com Ponta/FP, TE/TUSD e cobranças específicas mantidos separados.</p></div><div className="analysis-selector"><span>Conta analisada</span><select value={current.id} onChange={e=>setBillId(e.target.value)}>{bills.map(b=><option key={b.id} value={b.id}>{monthLong(b.mes_referencia)} • {b.unidade_consumidora||'UC não identificada'}</option>)}</select></div></section>
  <section className="card simulator-card animate-enter"><div><div className="label text-[#ed1c2e]">Simulador de redução</div><h2 className="section-title">Defina uma meta e veja o impacto estimado</h2><p className="section-subtitle">Referência gerencial proporcional ao consumo e valor atuais.</p></div><div className="simulator-control"><input type="range" min="5" max="35" step="5" value={target} onChange={e=>setTarget(Number(e.target.value))}/><div className="simulator-value">{target}%</div></div></section>
  <section className="grid sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">{facts.map(({icon:Icon,title,value,text},i)=><article className="analysis-fact animate-enter" key={title} style={{animationDelay:`${i*45}ms`}}><div className="analysis-fact-icon"><Icon size={19}/></div><div className="analysis-fact-title">{title}</div><div className="analysis-fact-value">{value}</div><p>{text}</p></article>)}</section>

  <section className="grid lg:grid-cols-2 gap-5"><TariffAnalysis title="Ponta (P)" subtitle="17h30–20h30" data={fin.ponta}/><TariffAnalysis title="Fora de Ponta (FP)" subtitle="Demais horários" data={fin.foraPonta}/></section>

  <section className="grid xl:grid-cols-2 gap-5">
   <div className="card premium-card p-5 md:p-6"><div className="label">Composição financeira</div><h2 className="section-title">Onde o valor da fatura está concentrado</h2><p className="section-subtitle">Itens extraídos do documento sem substituir a separação TE/TUSD e P/FP.</p><div className="grid md:grid-cols-[240px_1fr] items-center gap-4 mt-4"><div className="h-[240px]"><ResponsiveContainer><PieChart><Pie data={componentData} dataKey="value" nameKey="name" innerRadius={62} outerRadius={95} paddingAngle={3}>{componentData.map((_,i)=><Cell key={i} fill={PIE[i%PIE.length]}/>)}</Pie><Tooltip formatter={v=>brl(v)}/></PieChart></ResponsiveContainer></div><div className="space-y-2">{componentData.length?componentData.map((x,i)=><div className="legend-row" key={i}><span className="legend-dot" style={{background:PIE[i%PIE.length]}}/><span>{x.name}</span><strong>{brl(x.value)}</strong></div>):<div className="notice-info">Nenhum componente monetário detalhado foi identificado.</div>}</div></div></div>
   <div className="card premium-card p-5 md:p-6"><div className="label">Histórico mensal</div><h2 className="section-title">Consumo identificado na própria fatura</h2><div className="h-[300px] mt-5"><ResponsiveContainer><BarChart data={hist.map(x=>({label:x.mes?.slice(5,7)+'/'+x.mes?.slice(2,4),kwh:x.kwh}))}><CartesianGrid strokeDasharray="4 6" vertical={false}/><XAxis dataKey="label" tick={{fontSize:11}}/><YAxis tick={{fontSize:11}}/><Tooltip formatter={v=>[`${num(v)} kWh`,'Consumo']}/>{avg&&<ReferenceLine y={avg} stroke="#ed1c2e" strokeDasharray="7 6" label={{value:'média',fill:'#ed1c2e',fontSize:11}}/>}<Bar dataKey="kwh" fill="#123b73" radius={[7,7,0,0]} maxBarSize={38}/></BarChart></ResponsiveContainer></div></div>
  </section>
  <section className="grid lg:grid-cols-3 gap-5"><DiagnosticBlock tone="red" icon={AlertTriangle} title="Alertas e pontos de atenção" items={diag.alertas} fallback="Nenhum alerta específico foi identificado."/><DiagnosticBlock tone="blue" icon={ThermometerSun} title="Possíveis causas" items={diag.causas_provaveis} fallback="Cruze os dados com ocupação, climatização, horários e equipamentos."/><DiagnosticBlock tone="green" icon={Wrench} title="Ações prioritárias" items={[...(diag.acoes_prioritarias||[]),...(diag.oportunidades_economia||[])]} fallback="Estabeleça linha de base, metas mensais e verificação antes/depois das ações."/></section>
  <section className="card executive-note p-5 md:p-6"><div className="executive-note-icon"><Sparkles size={22}/></div><div><div className="label text-[#123b73]">Síntese executiva calculada</div><h2 className="section-title">Resumo coerente com os indicadores</h2><p>{executive}</p>{(diag.observacoes_tecnicas||[]).length>0&&<div className="mt-4 flex flex-wrap gap-2">{diag.observacoes_tecnicas.map((x,i)=><span className="tech-chip" key={i}>{x}</span>)}</div>}</div></section>
 </div>
}

function buildExecutive(metrics,consumo){if(!metrics||metrics.historyDeviation==null)return `O período registra ${num(consumo)} kWh. Ainda não há base histórica suficiente para classificar o consumo como acima ou abaixo da média.`;if(metrics.historyDeviation>0)return `O período registra ${num(consumo)} kWh, ficando ${pct(metrics.historyDeviation)} acima da média histórica calculada. O excesso teórico estimado sobre a média é ${num(metrics.theoreticalSavingKwh)} kWh.`;if(metrics.historyDeviation<0)return `O período registra ${num(consumo)} kWh, ficando ${pct(metrics.historyDeviation)} abaixo da média histórica calculada. Portanto, não há excesso teórico calculável sobre a média neste período.`;return `O período registra ${num(consumo)} kWh, alinhado à média histórica calculada. Não há excesso teórico calculável sobre a média.`}
function TariffAnalysis({title,subtitle,data={}}){return <div className="tariff-card blue"><div className="tariff-card-head"><div><span>{title}</span><small>{subtitle}</small></div><Clock3 size={20}/></div><div className="tariff-card-grid"><Row label="Consumo do posto" value={data.consumoKwh==null?'—':`${num(data.consumoKwh)} kWh`}/><Row label="Demanda faturada/paga" value={data.demandaFaturadaKw==null?'—':`${num(data.demandaFaturadaKw,1)} kW`}/><Row label="TE faturada" value={brl(data.teValor)}/><Row label="Quantidade TE" value={data.teKwh==null?'—':`${num(data.teKwh)} kWh`}/><Row label="Custo efetivo TE" value={data.teCustoEfetivoKwh==null?'—':`${brl(data.teCustoEfetivoKwh)}/kWh`}/><Row label="TUSD faturada" value={brl(data.tusdValor)}/><Row label="Quantidade TUSD" value={data.tusdKwh==null?'—':`${num(data.tusdKwh)} kWh`}/><Row label="Custo efetivo TUSD" value={data.tusdCustoEfetivoKwh==null?'—':`${brl(data.tusdCustoEfetivoKwh)}/kWh`}/></div></div>}
function Row({label,value}){return <div className="info-row"><span>{label}</span><strong>{value}</strong></div>}
function DiagnosticBlock({tone,icon:Icon,title,items=[],fallback}){const list=(items||[]).slice(0,8);return <div className={`diagnostic-block ${tone}`}><div className="diagnostic-head"><Icon size={19}/><h3>{title}</h3></div><div className="space-y-2 mt-4">{list.length?list.map((x,i)=><div className="diagnostic-item" key={i}><span>{i+1}</span><p>{x}</p></div>):<div className="diagnostic-item"><span>•</span><p>{fallback}</p></div>}</div></div>}
