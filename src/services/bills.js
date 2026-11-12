import { supabase, SUPABASE_CONFIGURED } from '../lib/supabase'
import { firebaseAuth } from '../lib/firebase'
import { contractedDemandKw } from '../utils/analytics'

function clientForUser(userId){
 if(!SUPABASE_CONFIGURED||!supabase)throw new Error('Supabase não está configurado.')
 if(!firebaseAuth.currentUser||firebaseAuth.currentUser.uid!==userId)throw new Error('A sessão mudou. Entre novamente para continuar.')
 return supabase
}

function readableError(error){
 if(!error)return 'Erro desconhecido do banco de dados.'
 if(error.code==='42501'||error.code==='PGRST301'||error.status===401||error.status===403)
  return 'O Firebase ainda não foi conectado ao Supabase. Ative Firebase em Authentication → Third-Party Auth, usando o projeto poli-energia. Caso esteja ativo, confira as permissões da sessão.'
 if(error.code==='23505')return 'Esta fatura já foi importada para este usuário.'
 return error.message||'Não foi possível comunicar com o banco.'
}

export function asBill(row){
 const bill=row.dados&&typeof row.dados==='object'&&!Array.isArray(row.dados)?row.dados:{}
 return {...bill,id:row.id,mes_referencia:row.mes_referencia??bill.mes_referencia,
   unidade_consumidora:row.unidade_consumidora??bill.unidade_consumidora,
   concessionaria:row.concessionaria??bill.concessionaria,
   consumo_kwh:row.consumo_kwh??bill.consumo_kwh,
   valor_total:row.valor_total??bill.valor_total,
   demanda_contratada_kw:row.demanda_contratada_kw??bill.demanda_contratada_kw}
}

function recordFor(bill,userId,importKey=null){
 const ponta=bill.tarifas_horarias?.ponta
 const fp=bill.tarifas_horarias?.fora_ponta
 const original={...bill}
 return {
   firebase_user_id:userId,
   client_import_key:importKey,
   mes_referencia:bill.mes_referencia||null,
   unidade_consumidora:bill.unidade_consumidora||null,
   concessionaria:bill.concessionaria||null,
   consumo_kwh:bill.consumo_kwh??null,
   valor_total:bill.valor_total??null,
   demanda_contratada_kw:contractedDemandKw(bill),
   demanda_maxima_ponta_kw:ponta?.demanda_maxima_kw??null,
   demanda_maxima_fora_ponta_kw:fp?.demanda_maxima_kw??null,
   dados:original
 }
}

export async function loadUserBills(userId){
 const db=clientForUser(userId)
 const {data,error}=await db.from('contas_energia')
   .select('id,mes_referencia,unidade_consumidora,concessionaria,consumo_kwh,valor_total,demanda_contratada_kw,dados,client_import_key,created_at')
   .eq('firebase_user_id',userId)
   .order('created_at',{ascending:false})
 if(error)throw new Error(readableError(error))
 return {bills:(data||[]).map(asBill),importKeys:new Set((data||[]).map(row=>row.client_import_key).filter(Boolean))}
}

export async function saveUserBill(userId,bill){
 const db=clientForUser(userId)
 const payload=recordFor(bill,userId)
 // A criação usa um UUID gerado pelo banco. Não dependemos de IDs locais legados.
 const {data,error}=await db.from('contas_energia').insert(payload)
   .select('id,mes_referencia,unidade_consumidora,concessionaria,consumo_kwh,valor_total,demanda_contratada_kw,dados')
   .single()
 if(error)throw new Error(readableError(error))
 return asBill(data)
}

export async function deleteUserBill(userId,id){
 const db=clientForUser(userId)
 const {data,error}=await db.from('contas_energia').delete()
  .eq('firebase_user_id',userId).eq('id',id).select('id')
 if(error)throw new Error(readableError(error))
 if(!data?.length)throw new Error('A conta não foi encontrada no seu usuário.')
}

export async function importLocalBills(userId,legacyBills=[],alreadyImported=new Set()){
 const db=clientForUser(userId)
 let imported=0,skipped=0
 for(let i=0;i<legacyBills.length;i++){
  const bill=legacyBills[i]
  const key=String(bill.id||bill.uploaded_at||`sem-id-${i}`)
  if(alreadyImported.has(key)){skipped++;continue}
  const payload=recordFor(bill,userId,key)
  const {error}=await db.from('contas_energia').insert(payload)
  if(error){
    if(error.code==='23505'){skipped++;continue}
    throw new Error(`Importadas ${imported} conta(s) antes da falha. ${readableError(error)}`)
  }
  imported++
 }
 return {imported,skipped}
}
