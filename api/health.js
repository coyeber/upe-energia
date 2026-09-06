export default function handler(req, res) {
  res.status(200).json({
    ok: true,
    provider: 'Google Gemini',
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    apiKeyConfigured: Boolean(process.env.GEMINI_API_KEY)
  })
}
