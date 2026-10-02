function normalizeModel(value){ return String(value || 'gemini-3.5-flash-lite').trim().replace(/^models\//i,'').replace(/^\/+/, '') }
export default function handler(req,res){res.status(200).json({ok:true,provider:'Serviço de análise',model:normalizeModel(process.env.GEMINI_MODEL),apiKeyConfigured:Boolean(process.env.GEMINI_API_KEY),version:'10.0-poli-paginas'})}
