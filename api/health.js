export default function handler(req, res) {
  res.status(200).json({
    ok: true,
    provider: 'NVIDIA NIM',
    model: process.env.NVIDIA_MODEL || 'nvidia/nemotron-3.5-lightning-30b-a3b',
    apiKeyConfigured: Boolean(process.env.NVIDIA_API_KEY)
  })
}
