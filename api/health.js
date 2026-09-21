function normalizeModel(value){ return String(value || 'gemini-2.5-flash').trim().replace(/^models\//i,'').replace(/^\/+/, '') }
<<<<<<< HEAD
export default function handler(req,res){res.status(200).json({ok:true,provider:'Serviço de análise',model:normalizeModel(process.env.GEMINI_MODEL),apiKeyConfigured:Boolean(process.env.GEMINI_API_KEY),version:'9.0-poli'})}
=======
export default function handler(req, res) {
  res.status(200).json({
    ok: true,
    provider: 'Serviço de análise',
    model: normalizeModel(process.env.GEMINI_MODEL),
    apiKeyConfigured: Boolean(process.env.GEMINI_API_KEY),
    version: '7.0-premium'
  })
}
>>>>>>> 7c356696ce76eb8c7d965f77ef13a2adde44404d
