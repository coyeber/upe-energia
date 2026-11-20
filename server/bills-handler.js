const projectId='poli-energia'
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

async function verify(token){
 if(process.env.FIREBASE_AUTH_EMULATOR_HOST)throw new Error('Emulador não permitido')
 const {initializeApp,getApps,getApp}=await import('firebase-admin/app')
 const {getAuth}=await import('firebase-admin/auth')
 const app=getApps().length?getApp():initializeApp({projectId})
 return getAuth(app).verifyIdToken(token)
}

async function defaultSql(){
 const connection=process.env.DATABASE_URL
 if(!connection)throw Object.assign(new Error('Missing connection'),{code:'DATABASE_URL_MISSING'})
 const {neon}=await import('@neondatabase/serverless')
 return neon(connection)
}

export function createHandler({verifyToken=verify,getSql=defaultSql}={}){
 return async function handler(req,res){
  res.setHeader('Cache-Control','private, no-store')
  if(!['GET','POST','DELETE'].includes(req.method)){
   res.setHeader('Allow','GET, POST, DELETE')
   return res.status(405).json({error:'Método não permitido.'})
  }
  const token=typeof req.headers?.authorization==='string'?req.headers.authorization.match(/^Bearer ([^\s]+)$/i):null
  if(!token)return res.status(401).json({error:'Sessão inválida ou expirada. Entre novamente.',code:'AUTH_REQUIRED'})
  let uid
  try{
   const claims=await verifyToken(token[1])
   uid=claims.uid
   if(typeof uid!=='string'||!uid)throw new Error('Usuário inválido')
  }catch(error){
   const code=error?.code
   if(['auth/argument-error','auth/invalid-id-token','auth/id-token-expired','auth/id-token-revoked'].includes(code)||error?.message==='Usuário inválido')return res.status(401).json({error:'Sessão inválida ou expirada. Entre novamente.',code:'AUTH_INVALID'})
   console.error('Falha na verificação Firebase',code||error?.name||'UNKNOWN')
   return res.status(503).json({error:'Não foi possível verificar a sessão Firebase no servidor.',code:'AUTH_SERVICE_UNAVAILABLE'})
  }
  try{
   const sql=await getSql()
   if(req.method==='GET'){
    const rows=await sql`SELECT id,mes_referencia,unidade_consumidora,concessionaria,consumo_kwh,valor_total,demanda_contratada_kw,dados,client_import_key,created_at FROM public.contas_energia WHERE firebase_user_id=${uid} ORDER BY created_at DESC`
    return res.status(200).json({rows})
   }
   let body=req.body
   if(typeof body==='string'){try{body=JSON.parse(body)}catch{return res.status(400).json({error:'JSON inválido.'})}}
   if(!body||typeof body!=='object'||Array.isArray(body))return res.status(400).json({error:'Dados inválidos.'})
   if(req.method==='DELETE'){
    if(typeof body.id!=='string'||!uuid.test(body.id))return res.status(400).json({error:'Identificador inválido.'})
    const rows=await sql`DELETE FROM public.contas_energia WHERE id=${body.id} AND firebase_user_id=${uid} RETURNING id`
    if(!rows.length)return res.status(404).json({error:'A conta não foi encontrada no seu usuário.'})
    return res.status(200).json({ok:true})
   }
   if(!body.dados||typeof body.dados!=='object'||Array.isArray(body.dados))return res.status(400).json({error:'Dados da fatura inválidos.'})
   const key=body.client_import_key??null
   if(key!==null&&(typeof key!=='string'||key.length>512))return res.status(400).json({error:'Chave de importação inválida.'})
   const nums=['consumo_kwh','valor_total','demanda_contratada_kw','demanda_maxima_ponta_kw','demanda_maxima_fora_ponta_kw']
   if(nums.some(k=>body[k]!=null&&((typeof body[k]!=='number'&&typeof body[k]!=='string')||String(body[k]).trim()===''||!Number.isFinite(Number(body[k])))))return res.status(400).json({error:'Valor numérico inválido.'})
   const txt=['mes_referencia','unidade_consumidora','concessionaria']
   if(txt.some(k=>body[k]!=null&&(typeof body[k]!=='string'&&typeof body[k]!=='number')))return res.status(400).json({error:'Campo de identificação inválido.'})
   const rows=await sql`INSERT INTO public.contas_energia(firebase_user_id,client_import_key,mes_referencia,unidade_consumidora,concessionaria,consumo_kwh,valor_total,demanda_contratada_kw,demanda_maxima_ponta_kw,demanda_maxima_fora_ponta_kw,dados)
    VALUES (${uid},${key},${body.mes_referencia??null},${body.unidade_consumidora??null},${body.concessionaria??null},${body.consumo_kwh??null},${body.valor_total??null},${body.demanda_contratada_kw??null},${body.demanda_maxima_ponta_kw??null},${body.demanda_maxima_fora_ponta_kw??null},${JSON.stringify(body.dados)}::jsonb)
    RETURNING id,mes_referencia,unidade_consumidora,concessionaria,consumo_kwh,valor_total,demanda_contratada_kw,dados`
   return res.status(201).json({row:rows[0]})
  }catch(error){
   if(error?.code==='23505')return res.status(409).json({code:'23505',error:'Esta fatura já foi importada para este usuário.'})
   if(error?.code==='DATABASE_URL_MISSING')return res.status(503).json({error:'DATABASE_URL não configurada nesta implantação.',code:'DATABASE_URL_MISSING'})
   console.error('Falha no banco de faturas',error?.code||error?.name||'UNKNOWN')
   return res.status(503).json({error:'Banco indisponível. Verifique a configuração e tente novamente.',code:'DATABASE_UNAVAILABLE'})
  }
 }
}

