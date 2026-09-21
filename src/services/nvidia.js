export async function analyzeWithNemotron(texto){
  const r=await fetch('/api/analisar-conta',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({texto})})
  const json=await r.json().catch(()=>({}))
  if(!r.ok) throw new Error(json.error || `Falha HTTP ${r.status}`)
  return json
}
export async function checkNvidia(){
  const r=await fetch('/api/health'); const j=await r.json().catch(()=>({})); return {ok:r.ok&&j.ok,...j}
}
