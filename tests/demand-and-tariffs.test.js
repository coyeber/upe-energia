import test from 'node:test'
import assert from 'node:assert/strict'
import { billFinancials, contractedDemandKw, buildMonthlySeries, buildAnnualSeries, scopeEnergyMetrics, demandExceeded, demandAssessment } from '../src/utils/analytics.js'

const bill={
  mes_referencia:'2025-11',
  uploaded_at:'2026-11-12T10:00:00Z',
  demanda_kw:325,
  demanda_contratada_kw:null,
  consumo_kwh:73495.8,
  impostos_total:1312.99,
  componentes_fatura:[{nome:'Uso Sistema Fio',quantidade:325,unidade:'kW',valor:3850}],
  tarifas_horarias:{
    ponta:{consumo_kwh:10084.83,demanda_maxima_kw:225.96,tusd_consumo_kwh:10084.83,tusd_valor:7286.55,tusd_tarifa:0.72252647},
    fora_ponta:{consumo_kwh:63410.97,demanda_maxima_kw:297.36,tusd_consumo_kwh:63410.97,tusd_valor:6478.63,tusd_tarifa:0.10216898}
  }
}
test('Uso Sistema Fio prevalece como contratada sem virar máxima medida',()=>{
 assert.equal(contractedDemandKw(bill),325)
 const monthly=buildMonthlySeries([bill])
 assert.equal(monthly[0].demandaContratada,325)
 assert.equal(monthly[0].demanda,297.36)
 assert.equal(monthly[0].demandaMaximaPontaKw,225.96)
 assert.equal(monthly[0].demandaMaximaForaPontaKw,297.36)
 assert.equal(demandExceeded(monthly[0]),false)
 const stats=scopeEnergyMetrics(monthly)
 assert.equal(stats.demandaContratada,325)
 assert.equal(stats.demandaMaxima,297.36)
 assert.equal(stats.impostos,1312.99)
 const annual=buildAnnualSeries(monthly)
 assert.equal(annual[0].demandaMax,297.36)
})
test('Tarifas NP e FP preservadas como preços originais sem mescla',()=>{
 const result=billFinancials(bill)
 assert.equal(result.ponta.tusdKwh,10084.83)
 assert.equal(result.foraPonta.tusdKwh,63410.97)
 assert.equal(result.ponta.tusdTarifa,0.72252647)
 assert.equal(result.foraPonta.tusdTarifa,0.10216898)
 assert.equal(result.ponta.tusdValor,7286.55)
 assert.equal(result.foraPonta.tusdValor,6478.63)
})
test('Sem contrato informado não se inventa 0 kW; máximas permanecem medidas',()=>{
 const empty={...bill,demanda_kw:null,demanda_contratada_kw:null,componentes_fatura:[]}
 assert.equal(contractedDemandKw(empty),null)
 const stats=scopeEnergyMetrics(buildMonthlySeries([empty]))
 assert.equal(stats.demandaContratada,null)
 assert.equal(stats.demandaMaxima,297.36)
})

import { resolveContract } from '../src/utils/demand.js'
test('Uso Sistema Fio igual à máxima medida não comprova o contrato',()=>{
 const ambiguous={...bill,demanda_contratada_kw:303.24,demanda_kw:303.24,componentes_fatura:[{nome:'Uso Sistema Fio',quantidade:303.24,unidade:'kW'}],tarifas_horarias:{ponta:{demanda_maxima_kw:247.8},fora_ponta:{demanda_maxima_kw:303.24}}}
 const row=buildMonthlySeries([ambiguous])[0]
 assert.equal(row.demandaContratada,null)
 assert.equal(row.demanda,303.24)
 assert.equal(demandAssessment(row).comparable,false)
 assert.equal(contractedDemandKw(ambiguous),null)
})
test('Contrato declarado prevalece sobre a quantidade faturada, inclusive quando menor que a medida',()=>{
 const confirmed={...bill,demanda_contratada_kw:280,demanda_contratada_fonte:'manual',componentes_fatura:[{nome:'Uso Sistema Fio',quantidade:303.24,unidade:'kW'}],tarifas_horarias:{ponta:{demanda_maxima_kw:247.8},fora_ponta:{demanda_maxima_kw:303.24}}}
 assert.equal(resolveContract(confirmed).value,280)
 const rows=buildMonthlySeries([confirmed]), assessment=demandAssessment(rows[0])
 assert.equal(assessment.limit,294)
 assert.equal(assessment.exceeded,true)
 assert.equal(buildAnnualSeries(rows)[0].ultrapassagens,1)
})
test('Tolerância de 5% é estrita; registros de cobrança divergentes não alteram a contagem',()=>{
 const row={demandaContratada:300,demandaMaximaPontaKw:250,demandaMaximaForaPontaKw:315,demandaUltrapassagemKw:15}
 assert.equal(demandExceeded(row),false)
 assert.equal(demandAssessment(row).conflict,true)
 assert.equal(demandExceeded({...row,demandaMaximaForaPontaKw:315.01}),true)
 assert.equal(demandAssessment({...row,demandaMaximaForaPontaKw:null}).comparable,false)
})
test('Histórico posterior não sobrescreve demanda medida ou contratada da fatura completa',()=>{
 const next={...bill,mes_referencia:'2025-12',uploaded_at:'2026-11-13T10:00:00Z',historico_demanda:[{mes:'2025-11',demanda_contratada_kw:999,demanda_contratada_fonte:'fatura',demanda_maxima_ponta_kw:999,demanda_maxima_fora_ponta_kw:999}]}
 const row=buildMonthlySeries([bill,next]).find(x=>x.mes==='2025-11')
 assert.equal(row.demandaContratada,325)
 assert.equal(row.demanda,297.36)
})
