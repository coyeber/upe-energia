function normalizeModel(value){ return String(value || 'gemini-2.5-flash').trim().replace(/^models\//i,'').replace(/^\/+/, '') }
export default function handler(req, res) {
  res.status(200).json({
    ok: true,
    provider: 'Google Gemini',
    model: normalizeModel(process.env.GEMINI_MODEL),
    apiKeyConfigured: Boolean(process.env.GEMINI_API_KEY),
    version: '7.0-premium'
  })
}
