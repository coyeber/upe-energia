const n = (v) => {
  if (v === null || v === undefined || v === '') return null
  const x = Number(v)
  return Number.isFinite(x) ? x : null
}

export function monthParts(key) {
  if (!key || !/^\d{4}-\d{2}$/.test(key)) return null
  const [year, month] = key.split('-').map(Number)
  return { year, month }
}

export function monthKey(year, month) {
  return `${year}-${String(month).padStart(2, '0')}`
}

export function calendarDaysInMonth(key) {
  const p = monthParts(key)
  return p ? new Date(p.year, p.month, 0).getDate() : null
}

export function daysBetween(a, b) {
  if (!a || !b) return null
  const da = new Date(`${a}T12:00:00`)
  const db = new Date(`${b}T12:00:00`)
  if (Number.isNaN(da.getTime()) || Number.isNaN(db.getTime())) return null
  return Math.max(0, Math.round((db - da) / 86400000))
}

export function previousMonth(key) {
  const p = monthParts(key)
  if (!p) return null
  const d = new Date(p.year, p.month - 2, 1)
  return monthKey(d.getFullYear(), d.getMonth() + 1)
}

export function sameMonthPreviousYear(key) {
  const p = monthParts(key)
  return p ? monthKey(p.year - 1, p.month) : null
}

export function pctChange(current, previous) {
  const c = n(current), p = n(previous)
  if (c === null || p === null || p === 0) return null
  return ((c - p) / p) * 100
}

export function average(values) {
  const list = values.map(n).filter(v => v !== null)
  return list.length ? list.reduce((a, b) => a + b, 0) / list.length : null
}

export function sum(values) {
  return values.map(n).filter(v => v !== null).reduce((a, b) => a + b, 0)
}

export function buildMonthlySeries(bills = []) {
  const map = new Map()
  const sortedBills = [...bills].sort((a, b) => String(a.uploaded_at || '').localeCompare(String(b.uploaded_at || '')))

  for (const bill of sortedBills) {
    for (const h of bill.historico_consumo || []) {
      if (!h?.mes || n(h.kwh) === null) continue
      const prev = map.get(h.mes) || { mes: h.mes, kwh: null, valor: null, demanda: null, demandaContratada: null, dias: null, actual: false, sourceCount: 0 }
      prev.kwh = n(h.kwh)
      if (n(h.dias) !== null) prev.dias = n(h.dias)
      prev.sourceCount += 1
      map.set(h.mes, prev)
    }

    if (bill.mes_referencia) {
      const key = bill.mes_referencia
      const prev = map.get(key) || { mes: key, kwh: null, valor: null, demanda: null, demandaContratada: null, dias: null, actual: false, sourceCount: 0 }
      if (n(bill.consumo_kwh) !== null) prev.kwh = n(bill.consumo_kwh)
      if (n(bill.valor_total) !== null) prev.valor = n(bill.valor_total)
      if (n(bill.demanda_kw) !== null) prev.demanda = n(bill.demanda_kw)
      if (n(bill.demanda_contratada_kw) !== null) prev.demandaContratada = n(bill.demanda_contratada_kw)
      prev.dias = n(bill.dias_faturados) ?? daysBetween(bill.periodo_leitura_inicio, bill.periodo_leitura_fim) ?? prev.dias
      prev.actual = true
      prev.bill = bill
      prev.sourceCount += 1
      map.set(key, prev)
    }
  }

  return [...map.values()].sort((a, b) => a.mes.localeCompare(b.mes)).map(x => ({
    ...x,
    diasEfetivos: x.dias || calendarDaysInMonth(x.mes),
    consumoDiario: x.kwh != null && (x.dias || calendarDaysInMonth(x.mes)) ? x.kwh / (x.dias || calendarDaysInMonth(x.mes)) : null,
    gastoDiario: x.valor != null && (x.dias || calendarDaysInMonth(x.mes)) ? x.valor / (x.dias || calendarDaysInMonth(x.mes)) : null,
    custoKwh: x.valor != null && x.kwh ? x.valor / x.kwh : null
  }))
}

export function buildAnnualSeries(monthly = []) {
  const years = new Map()
  for (const m of monthly) {
    const year = m.mes?.slice(0, 4)
    if (!year) continue
    const y = years.get(year) || { year, consumo: 0, gasto: 0, mesesConsumo: 0, mesesFaturados: 0, demandaMax: null, mediaDiaria: null, _daily: [], _costs: [] }
    if (n(m.kwh) !== null) { y.consumo += n(m.kwh); y.mesesConsumo += 1 }
    if (n(m.valor) !== null) { y.gasto += n(m.valor); y.mesesFaturados += 1; if (n(m.custoKwh) !== null) y._costs.push(n(m.custoKwh)) }
    if (n(m.demanda) !== null) y.demandaMax = y.demandaMax == null ? n(m.demanda) : Math.max(y.demandaMax, n(m.demanda))
    if (n(m.consumoDiario) !== null) y._daily.push(n(m.consumoDiario))
    years.set(year, y)
  }
  return [...years.values()].sort((a, b) => a.year.localeCompare(b.year)).map(y => ({
    ...y,
    mediaMensal: y.mesesConsumo ? y.consumo / y.mesesConsumo : null,
    mediaDiaria: average(y._daily),
    gasto: y.mesesFaturados ? y.gasto : null,
    custoMedioKwh: average(y._costs)
  }))
}

export function coverageStats(monthly = [], bills = []) {
  const actualMonths = monthly.filter(m => m.actual).length
  const consumptionMonths = monthly.filter(m => n(m.kwh) !== null).length
  const valueMonths = monthly.filter(m => n(m.valor) !== null).length
  const demandMonths = monthly.filter(m => n(m.demanda) !== null).length
  return { actualMonths, consumptionMonths, valueMonths, demandMonths, bills: bills.length }
}

export function monthMetrics(month, monthly = []) {
  if (!month) return null
  const prev = monthly.find(x => x.mes === previousMonth(month.mes))
  const lastYear = monthly.find(x => x.mes === sameMonthPreviousYear(month.mes))
  const yearMonths = monthly.filter(x => x.mes?.startsWith(month.mes.slice(0, 4)) && n(x.kwh) !== null)
  const historyAvg = average(monthly.map(x => x.kwh))
  const yearAvg = average(yearMonths.map(x => x.kwh))
  const bill = month.bill || {}
  const dias = month.dias || daysBetween(bill.periodo_leitura_inicio, bill.periodo_leitura_fim) || calendarDaysInMonth(month.mes)
  const venc = bill.data_vencimento ? new Date(`${bill.data_vencimento}T12:00:00`) : null
  const today = new Date(); today.setHours(12,0,0,0)
  const diasVenc = venc && !Number.isNaN(venc.getTime()) ? Math.round((venc - today) / 86400000) : null
  const theoreticalSavingKwh = historyAvg != null && month.kwh != null && month.kwh > historyAvg ? month.kwh - historyAvg : 0
  const theoreticalSavingBrl = theoreticalSavingKwh && month.custoKwh ? theoreticalSavingKwh * month.custoKwh : null
  return {
    dias,
    consumoDiario: month.kwh != null && dias ? month.kwh / dias : null,
    gastoDiario: month.valor != null && dias ? month.valor / dias : null,
    custoKwh: month.custoKwh,
    prevChange: pctChange(month.kwh, prev?.kwh),
    yoyChange: pctChange(month.kwh, lastYear?.kwh),
    historyDeviation: pctChange(month.kwh, historyAvg),
    yearDeviation: pctChange(month.kwh, yearAvg),
    historyAvg,
    yearAvg,
    previous: prev,
    lastYear,
    diasVenc,
    theoreticalSavingKwh,
    theoreticalSavingBrl
  }
}

export function yearMetrics(year, monthly = [], annual = []) {
  const months = monthly.filter(x => x.mes?.startsWith(String(year)))
  const current = annual.find(x => x.year === String(year))
  const prev = annual.find(x => x.year === String(Number(year) - 1))
  const consumptions = months.map(x => x.kwh).filter(v => n(v) !== null)
  const actualSpends = months.map(x => x.valor).filter(v => n(v) !== null)
  const elapsed = consumptions.length
  const projectedConsumption = elapsed && elapsed < 12 ? average(consumptions) * 12 : current?.consumo ?? null
  const projectedSpend = actualSpends.length && actualSpends.length < 12 ? average(actualSpends) * 12 : current?.gasto ?? null
  const sorted = months.filter(x => n(x.kwh) !== null).sort((a, b) => b.kwh - a.kwh)
  return {
    months,
    current,
    previous: prev,
    consumptionChange: pctChange(current?.consumo, prev?.consumo),
    spendChange: pctChange(current?.gasto, prev?.gasto),
    projectedConsumption,
    projectedSpend,
    best: sorted.at(-1) || null,
    worst: sorted[0] || null,
    avgDays: average(months.map(x => x.dias)),
    avgDaily: average(months.map(x => x.consumoDiario)),
    avgCostKwh: average(months.map(x => x.custoKwh)),
    totalDays: sum(months.map(x => x.dias))
  }
}

export function allYearsMetrics(monthly = [], annual = []) {
  const consumptionValues = monthly.map(x => x.kwh).filter(v => n(v) !== null)
  const spendValues = monthly.map(x => x.valor).filter(v => n(v) !== null)
  const annualSorted = [...annual].sort((a, b) => b.consumo - a.consumo)
  const latest = annual.at(-1)
  const previous = annual.at(-2)
  return {
    totalConsumption: sum(consumptionValues),
    totalSpend: sum(spendValues),
    avgMonthly: average(consumptionValues),
    avgDaily: average(monthly.map(x => x.consumoDiario)),
    avgCostKwh: average(monthly.map(x => x.custoKwh)),
    years: annual.length,
    months: consumptionValues.length,
    highestYear: annualSorted[0] || null,
    lowestYear: annualSorted.at(-1) || null,
    latest,
    latestChange: pctChange(latest?.consumo, previous?.consumo)
  }
}

export function efficiencyScore(month, metrics) {
  if (!month || !metrics) return null
  let score = 82
  if (metrics.historyDeviation != null) score -= Math.max(-8, Math.min(25, metrics.historyDeviation * 0.45))
  if (metrics.prevChange != null && metrics.prevChange > 10) score -= Math.min(12, metrics.prevChange * 0.2)
  if (month.demanda != null && month.demandaContratada != null && month.demanda > month.demandaContratada) score -= 18
  if (month.bill?.diagnostico?.alertas?.length) score -= Math.min(12, month.bill.diagnostico.alertas.length * 3)
  return Math.max(0, Math.min(100, Math.round(score)))
}

export function selectScope(mode, { month, year, monthly, annual }) {
  if (mode === 'month') return monthly.filter(x => x.mes === month)
  if (mode === 'year') return monthly.filter(x => x.mes?.startsWith(String(year)))
  return monthly
}
