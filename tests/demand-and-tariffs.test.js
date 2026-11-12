import test from 'node:test'
import assert from 'node:assert/strict'
import { billFinancials, contractedDemandKw, buildMonthlySeries, buildAnnualSeries, scopeEnergyMetrics, demandExceeded } from '../src/utils/analytics.js'

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
