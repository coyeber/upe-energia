// Entrada isolada para a função Node.js da Vercel.
export default async function handler(req,res){
 try{
  const {createHandler}=await import('../server/bills-handler.js')
  return await createHandler()(req,res)
 }catch(error){
  console.error('Falha ao inicializar API de faturas',error?.code||error?.name||'UNKNOWN')
  if(res.headersSent)return
  res.setHeader('Cache-Control','no-store')
  return res.status(500).json({error:'Falha ao inicializar a API de faturas.',code:'BILLS_API_INIT'})
 }
}
