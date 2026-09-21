export const POLI_AREA_M2 = 8860
export const POLI_PEOPLE = 2392

const n = (v) => {
  if (v === null || v === undefined || v === '') return null
  const x = Number(v)
  return Number.isFinite(x) ? x : null
}

const firstNumber = (...values) => values.map(n).find(v => v !== null) ?? null
const sumNullable = (values = []) => {
  const list = values.map(n).filter(v => v !== null)
  return list.length ? list.reduce((a,b)=>a+b,0) : null
}

export function monthParts(key) {
  if (!key || !/^\d{4}-\d{2}$/.test(key)) return null
  const [year, month] = key.split('-').map(Number)
  return { year, month }
}

export function monthKey(year, month) { return `${year}-${String(month).padStart(2, '0')}` }
export function calendarDaysInMonth(key) { const p=monthParts(key); return p ? new Date(p.year,p.month,0).getDate() : null }
export function daysBetween(a,b){ if(!a||!b)return null; const da=new Date(`${a}T12:00:00`),db=new Date(`${b}T12:00:00`); if(Number.isNaN(da.getTime())||Number.isNaN(db.getTime()))return null; return Math.max(0,Math.round((db-da)/86400000)) }
export function previousMonth(key){ const p=monthParts(key); if(!p)return null; const d=new Date(p.year,p.month-2,1); return monthKey(d.getFullYear(),d.getMonth()+1) }
export function sameMonthPreviousYear(key){ const p=monthParts(key); return p?monthKey(p.year-1,p.month):null }
export function pctChange(current,previous){ const c=n(current),p=n(previous); if(c===null||p===null||p===0)return null; return ((c-p)/p)*100 }
export function average(values){ const list=values.map(n).filter(v=>v!==null); return list.length?list.reduce((a,b)=>a+b,0)/list.length:null }
export function sum(values){ return values.map(n).filter(v=>v!==null).reduce((a,b)=>a+b,0) }

function tariffSlot(slot={}){
  const consumoKwh=firstNumber(slot.consumo_kwh)
  const teValor=firstNumber(slot.te_valor), tusdValor=firstNumber(slot.tusd_valor)
  const custoTotal=firstNumber(slot.custo_total,sumNullable([teValor,tusdValor]))
  return {
    consumoKwh,custoTotal,teValor,tusdValor,
    demandaFaturadaKw:firstNumber(slot.demanda_faturada_kw),
    custoEfetivoKwh:custoTotal!=null&&consumoKwh>0?custoTotal/consumoKwh:null
  }
}

export function billFinancials(bill={}){
  const ponta=tariffSlot(bill.tarifas_horarias?.ponta||{})
  const foraPonta=tariffSlot(bill.tarifas_horarias?.fora_ponta||{})
  return {
    consumoFaturadoKwh:firstNumber(bill.consumo_faturado_kwh,bill.consumo_kwh),
    demandaFaturadaKw:firstNumber(bill.demanda_faturada_kw,bill.demanda_kw),
    multasTotal:firstNumber(bill.multas_total,sumNullable((bill.multas||[]).map(x=>x?.valor))),
    impostosTotal:firstNumber(bill.impostos_total,sumNullable((bill.impostos||[]).map(x=>x?.valor))),
    multasCount:Array.isArray(bill.multas)?bill.multas.length:null,
    impostosCount:Array.isArray(bill.impostos)?bill.impostos.length:null,
    iluminacaoPublica:firstNumber(bill.iluminacao_publica_valor),
    ponta,foraPonta
  }
}

export function buildMonthlySeries(bills=[]){
  const map=new Map()
  const sortedBills=[...bills].sort((a,b)=>String(a.uploaded_at||'').localeCompare(String(b.uploaded_at||'')))
  for(const bill of sortedBills){
    for(const h of bill.historico_consumo||[]){
      if(!h?.mes||n(h.kwh)===null)continue
      const prev=map.get(h.mes)||{mes:h.mes,kwh:null,valor:null,demanda:null,demandaContratada:null,dias:null,actual:false,sourceCount:0}
      prev.kwh=n(h.kwh); if(n(h.dias)!==null)prev.dias=n(h.dias); prev.sourceCount+=1; map.set(h.mes,prev)
    }
    if(bill.mes_referencia){
      const key=bill.mes_referencia
      const prev=map.get(key)||{mes:key,kwh:null,valor:null,demanda:null,demandaContratada:null,dias:null,actual:false,sourceCount:0}
      const fin=billFinancials(bill)
      if(n(bill.consumo_kwh)!==null)prev.kwh=n(bill.consumo_kwh)
      if(n(bill.valor_total)!==null)prev.valor=n(bill.valor_total)
      if(n(bill.demanda_kw)!==null)prev.demanda=n(bill.demanda_kw)
      if(n(bill.demanda_contratada_kw)!==null)prev.demandaContratada=n(bill.demanda_contratada_kw)
      prev.dias=n(bill.dias_faturados)??daysBetween(bill.periodo_leitura_inicio,bill.periodo_leitura_fim)??prev.dias
      prev.consumoFaturadoKwh=fin.consumoFaturadoKwh
      prev.demandaFaturadaKw=fin.demandaFaturadaKw
      prev.multasTotal=fin.multasTotal
      prev.impostosTotal=fin.impostosTotal
      prev.multasCount=fin.multasCount
      prev.impostosCount=fin.impostosCount
      prev.iluminacaoPublica=fin.iluminacaoPublica
      prev.ponta=fin.ponta; prev.foraPonta=fin.foraPonta
      prev.actual=true; prev.bill=bill; prev.sourceCount+=1; map.set(key,prev)
    }
  }
  return [...map.values()].sort((a,b)=>a.mes.localeCompare(b.mes)).map(x=>{
    const diasEfetivos=x.dias||calendarDaysInMonth(x.mes)
    const baseKwh=firstNumber(x.consumoFaturadoKwh,x.kwh)
    return {
      ...x,diasEfetivos,
      consumoDiario:baseKwh!=null&&diasEfetivos?baseKwh/diasEfetivos:null,
      gastoDiario:x.valor!=null&&diasEfetivos?x.valor/diasEfetivos:null,
      custoKwh:x.valor!=null&&baseKwh?x.valor/baseKwh:null,
      kwhM2:baseKwh!=null?baseKwh/POLI_AREA_M2:null,
      kwhPerCapita:baseKwh!=null?baseKwh/POLI_PEOPLE:null
    }
  })
}

export function buildAnnualSeries(monthly=[]){
  const years=new Map()
  for(const m of monthly){
    const year=m.mes?.slice(0,4); if(!year)continue
    const y=years.get(year)||{year,consumo:0,gasto:0,mesesConsumo:0,mesesFaturados:0,demandaMax:null,demandaFaturadaMax:null,_daily:[],_costs:[],multas:0,impostos:0,iluminacao:0,pontaConsumo:0,pontaCusto:0,fpConsumo:0,fpCusto:0,_hasMultas:false,_hasImpostos:false,_hasIluminacao:false,_hasPonta:false,_hasFp:false}
    const energy=firstNumber(m.consumoFaturadoKwh,m.kwh)
    if(energy!==null){y.consumo+=energy;y.mesesConsumo+=1}
    if(n(m.valor)!==null){y.gasto+=n(m.valor);y.mesesFaturados+=1;if(n(m.custoKwh)!==null)y._costs.push(n(m.custoKwh))}
    if(n(m.demanda)!==null)y.demandaMax=y.demandaMax==null?n(m.demanda):Math.max(y.demandaMax,n(m.demanda))
    if(n(m.demandaFaturadaKw)!==null)y.demandaFaturadaMax=y.demandaFaturadaMax==null?n(m.demandaFaturadaKw):Math.max(y.demandaFaturadaMax,n(m.demandaFaturadaKw))
    if(n(m.consumoDiario)!==null)y._daily.push(n(m.consumoDiario))
    if(n(m.multasTotal)!==null){y.multas+=n(m.multasTotal);y._hasMultas=true}
    if(n(m.impostosTotal)!==null){y.impostos+=n(m.impostosTotal);y._hasImpostos=true}
    if(n(m.iluminacaoPublica)!==null){y.iluminacao+=n(m.iluminacaoPublica);y._hasIluminacao=true}
    if(n(m.ponta?.consumoKwh)!==null){y.pontaConsumo+=n(m.ponta.consumoKwh);y._hasPonta=true}
    if(n(m.ponta?.custoTotal)!==null)y.pontaCusto+=n(m.ponta.custoTotal)
    if(n(m.foraPonta?.consumoKwh)!==null){y.fpConsumo+=n(m.foraPonta.consumoKwh);y._hasFp=true}
    if(n(m.foraPonta?.custoTotal)!==null)y.fpCusto+=n(m.foraPonta.custoTotal)
    years.set(year,y)
  }
  return [...years.values()].sort((a,b)=>a.year.localeCompare(b.year)).map(y=>({
    ...y,mediaMensal:y.mesesConsumo?y.consumo/y.mesesConsumo:null,mediaDiaria:average(y._daily),gasto:y.mesesFaturados?y.gasto:null,custoMedioKwh:average(y._costs),
    kwhM2:y.mesesConsumo?y.consumo/POLI_AREA_M2:null,kwhPerCapita:y.mesesConsumo?y.consumo/POLI_PEOPLE:null,
    multas:y._hasMultas?y.multas:null,impostos:y._hasImpostos?y.impostos:null,iluminacao:y._hasIluminacao?y.iluminacao:null,
    pontaConsumo:y._hasPonta?y.pontaConsumo:null,foraPontaConsumo:y._hasFp?y.fpConsumo:null,
    pontaCusto:y._hasPonta?y.pontaCusto:null,foraPontaCusto:y._hasFp?y.fpCusto:null
  }))
}

export function coverageStats(monthly=[],bills=[]){ return {actualMonths:monthly.filter(m=>m.actual).length,consumptionMonths:monthly.filter(m=>n(m.kwh)!==null).length,valueMonths:monthly.filter(m=>n(m.valor)!==null).length,demandMonths:monthly.filter(m=>n(m.demanda)!==null).length,bills:bills.length} }

export function monthMetrics(month,monthly=[]){
  if(!month)return null
  const prev=monthly.find(x=>x.mes===previousMonth(month.mes)),lastYear=monthly.find(x=>x.mes===sameMonthPreviousYear(month.mes))
  const yearMonths=monthly.filter(x=>x.mes?.startsWith(month.mes.slice(0,4))&&n(x.kwh)!==null)
  const historyAvg=average(monthly.filter(x=>x.mes!==month.mes).map(x=>firstNumber(x.consumoFaturadoKwh,x.kwh))),yearAvg=average(yearMonths.filter(x=>x.mes!==month.mes).map(x=>firstNumber(x.consumoFaturadoKwh,x.kwh)))
  const bill=month.bill||{},dias=month.dias||daysBetween(bill.periodo_leitura_inicio,bill.periodo_leitura_fim)||calendarDaysInMonth(month.mes)
  const venc=bill.data_vencimento?new Date(`${bill.data_vencimento}T12:00:00`):null,today=new Date();today.setHours(12,0,0,0)
  const diasVenc=venc&&!Number.isNaN(venc.getTime())?Math.round((venc-today)/86400000):null
  const energy=firstNumber(month.consumoFaturadoKwh,month.kwh)
  const theoreticalSavingKwh=historyAvg!=null&&energy!=null&&energy>historyAvg?energy-historyAvg:0
  const theoreticalSavingBrl=theoreticalSavingKwh&&month.custoKwh?theoreticalSavingKwh*month.custoKwh:null
  return {dias,consumoDiario:energy!=null&&dias?energy/dias:null,gastoDiario:month.valor!=null&&dias?month.valor/dias:null,custoKwh:month.custoKwh,prevChange:pctChange(energy,firstNumber(prev?.consumoFaturadoKwh,prev?.kwh)),yoyChange:pctChange(energy,firstNumber(lastYear?.consumoFaturadoKwh,lastYear?.kwh)),historyDeviation:pctChange(energy,historyAvg),yearDeviation:pctChange(energy,yearAvg),historyAvg,yearAvg,previous:prev,lastYear,diasVenc,theoreticalSavingKwh,theoreticalSavingBrl,kwhM2:energy!=null?energy/POLI_AREA_M2:null,kwhPerCapita:energy!=null?energy/POLI_PEOPLE:null}
}

export function yearMetrics(year,monthly=[],annual=[]){
  const months=monthly.filter(x=>x.mes?.startsWith(String(year))),current=annual.find(x=>x.year===String(year)),prev=annual.find(x=>x.year===String(Number(year)-1))
  const consumptions=months.map(x=>firstNumber(x.consumoFaturadoKwh,x.kwh)).filter(v=>n(v)!==null),actualSpends=months.map(x=>x.valor).filter(v=>n(v)!==null),elapsed=consumptions.length
  const projectedConsumption=elapsed&&elapsed<12?average(consumptions)*12:current?.consumo??null,projectedSpend=actualSpends.length&&actualSpends.length<12?average(actualSpends)*12:current?.gasto??null
  const sorted=months.filter(x=>firstNumber(x.consumoFaturadoKwh,x.kwh)!==null).sort((a,b)=>firstNumber(b.consumoFaturadoKwh,b.kwh)-firstNumber(a.consumoFaturadoKwh,a.kwh))
  return {months,current,previous:prev,consumptionChange:pctChange(current?.consumo,prev?.consumo),spendChange:pctChange(current?.gasto,prev?.gasto),projectedConsumption,projectedSpend,best:sorted.at(-1)||null,worst:sorted[0]||null,avgDays:average(months.map(x=>x.dias)),avgDaily:average(months.map(x=>x.consumoDiario)),avgCostKwh:average(months.map(x=>x.custoKwh)),totalDays:sum(months.map(x=>x.dias)),kwhM2:current?.consumo!=null?current.consumo/POLI_AREA_M2:null,kwhPerCapita:current?.consumo!=null?current.consumo/POLI_PEOPLE:null}
}

export function allYearsMetrics(monthly=[],annual=[]){
  const consumptionValues=monthly.map(x=>firstNumber(x.consumoFaturadoKwh,x.kwh)).filter(v=>n(v)!==null),spendValues=monthly.map(x=>x.valor).filter(v=>n(v)!==null),annualSorted=[...annual].sort((a,b)=>b.consumo-a.consumo),latest=annual.at(-1),previous=annual.at(-2),totalConsumption=sum(consumptionValues)
  return {totalConsumption,totalSpend:sum(spendValues),avgMonthly:average(consumptionValues),avgDaily:average(monthly.map(x=>x.consumoDiario)),avgCostKwh:average(monthly.map(x=>x.custoKwh)),years:annual.length,months:consumptionValues.length,highestYear:annualSorted[0]||null,lowestYear:annualSorted.at(-1)||null,latest,latestChange:pctChange(latest?.consumo,previous?.consumo),kwhM2:consumptionValues.length?totalConsumption/POLI_AREA_M2:null,kwhPerCapita:consumptionValues.length?totalConsumption/POLI_PEOPLE:null}
}

export function efficiencyScore(month,metrics){ if(!month||!metrics)return null; let score=82; if(metrics.historyDeviation!=null)score-=Math.max(-8,Math.min(25,metrics.historyDeviation*.45)); if(metrics.prevChange!=null&&metrics.prevChange>10)score-=Math.min(12,metrics.prevChange*.2); if(month.demanda!=null&&month.demandaContratada!=null&&month.demanda>month.demandaContratada)score-=18; if(month.bill?.diagnostico?.alertas?.length)score-=Math.min(12,month.bill.diagnostico.alertas.length*3); return Math.max(0,Math.min(100,Math.round(score))) }
export function selectScope(mode,{month,year,monthly}){ if(mode==='month')return monthly.filter(x=>x.mes===month); if(mode==='year')return monthly.filter(x=>x.mes?.startsWith(String(year))); return monthly }

export function scopeEnergyMetrics(rows=[]){
  const totalConsumption=sumNullable(rows.map(x=>firstNumber(x.consumoFaturadoKwh,x.kwh)))
  return {
    totalConsumption,
    kwhM2:totalConsumption!=null?totalConsumption/POLI_AREA_M2:null,
    kwhPerCapita:totalConsumption!=null?totalConsumption/POLI_PEOPLE:null,
    consumoPago:sumNullable(rows.map(x=>x.consumoFaturadoKwh)),
    demandaPagaMax:rows.map(x=>n(x.demandaFaturadaKw)).filter(v=>v!==null).reduce((a,b)=>a==null?b:Math.max(a,b),null),
    multas:sumNullable(rows.map(x=>x.multasTotal)),
    impostos:sumNullable(rows.map(x=>x.impostosTotal)),
    multasCount:sumNullable(rows.map(x=>x.multasCount)),
    impostosCount:sumNullable(rows.map(x=>x.impostosCount)),
    iluminacao:sumNullable(rows.map(x=>x.iluminacaoPublica)),
    pontaConsumo:sumNullable(rows.map(x=>x.ponta?.consumoKwh)),
    pontaCusto:sumNullable(rows.map(x=>x.ponta?.custoTotal)),
    pontaTE:sumNullable(rows.map(x=>x.ponta?.teValor)),
    pontaTUSD:sumNullable(rows.map(x=>x.ponta?.tusdValor)),
    foraPontaConsumo:sumNullable(rows.map(x=>x.foraPonta?.consumoKwh)),
    foraPontaCusto:sumNullable(rows.map(x=>x.foraPonta?.custoTotal)),
    foraPontaTE:sumNullable(rows.map(x=>x.foraPonta?.teValor)),
    foraPontaTUSD:sumNullable(rows.map(x=>x.foraPonta?.tusdValor))
  }
}
