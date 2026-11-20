import { firebaseAuth } from '../lib/firebase'
import { resolveContract } from '../utils/demand'

async function request(userId,method='GET',payload){
 const user=firebaseAuth.currentUser
 if(!user||user.uid!==userId)throw new Error('A sessão mudou. Entre novamente para continuar.')
 const token=await user.getIdToken()
 if(firebaseAuth.currentUser?.uid!==userId)throw new Error('A sessão mudou. Entre novamente para continuar.')
 const response=await fetch('/api/bills',{
  method,cache:'no-store',headers:{Authorization:'Bearer '+token,...(payload?{'Content-Type':'application/json'}:{})},
  ...(payload?{body:JSON.stringify(payload)}:{})
 })
 const result=await response.json().catch(()=>({}))
 if(!response.ok){
  const error=new Error(result.error||'Não foi possível comunicar com o banco.')
  error.code=result.code
  throw error
 }
 return result
}

export function asBill(row){
 const bill=row.dados&&typeof row.dados==='object'&&!Array.isArray(row.dados)?row.dados:{}
 return {...bill,id:row.id,mes_referencia:row.mes_referencia??bill.mes_referencia,
   unidade_consumidora:row.unidade_consumidora??bill.unidade_consumidora,
   concessionaria:row.concessionaria??bill.concessionaria,
   consumo_kwh:row.consumo_kwh==null?bill.consumo_kwh:Number(row.consumo_kwh),
   valor_total:row.valor_total==null?bill.valor_total:Number(row.valor_total),
   demanda_contratada_kw:Object.prototype.hasOwnProperty.call(bill,'demanda_contratada_kw')?bill.demanda_contratada_kw:row.demanda_contratada_kw==null?null:Number(row.demanda_contratada_kw)}
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
   demanda_contratada_kw:resolveContract(bill).needsReview?null:resolveContract(bill).value,
   demanda_maxima_ponta_kw:ponta?.demanda_maxima_kw??null,
   demanda_maxima_fora_ponta_kw:fp?.demanda_maxima_kw??null,
   dados:original
 }
}

export async function loadUserBills(userId){
 const {rows}=await request(userId)
 return {bills:rows.map(asBill),importKeys:new Set(rows.map(row=>row.client_import_key).filter(Boolean))}
}
export async function saveUserBill(userId,bill){
 const {row}=await request(userId,'POST',recordFor(bill,userId))
 return asBill(row)
}
export async function deleteUserBill(userId,id){
 await request(userId,'DELETE',{id})
}
export async function importLocalBills(userId,legacyBills=[],alreadyImported=new Set()){
 let imported=0,skipped=0
 for(let i=0;i<legacyBills.length;i++){
  const bill=legacyBills[i]
  const key=String(bill.id||bill.uploaded_at||`sem-id-${i}`)
  if(alreadyImported.has(key)){skipped++;continue}
  try{await request(userId,'POST',recordFor(bill,userId,key));imported++}
  catch(error){
   if(error.code==='23505'){skipped++;continue}
   throw new Error(`Importadas ${imported} conta(s) antes da falha. ${error.message}`)
  }
 }
 return {imported,skipped}
}
