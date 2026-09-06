export async function analyzeWithAnalysisService(texto) {
  let response
  try {
    response = await fetch('/api/analisar-conta', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texto })
    })
  } catch {
    throw new Error('Não foi possível conectar ao backend do Vercel.')
  }

  const raw = await response.text()
  let json = {}
  try { json = raw ? JSON.parse(raw) : {} } catch { json = { error: raw } }

  if (!response.ok) {
    throw new Error(json.error || `Falha HTTP ${response.status}`)
  }
  return json
}

export async function checkAnalysisService() {
  const response = await fetch('/api/health')
  const json = await response.json().catch(() => ({}))
  return { ok: response.ok && json.ok, ...json }
}
