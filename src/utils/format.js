export const brl = (v) => v == null || Number.isNaN(Number(v)) ? '—' : Number(v).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})
export const num = (v, digits=0) => v == null || Number.isNaN(Number(v)) ? '—' : Number(v).toLocaleString('pt-BR',{maximumFractionDigits:digits,minimumFractionDigits:digits})
export const pct = (v, digits=1) => v == null || Number.isNaN(Number(v)) ? '—' : `${Math.abs(Number(v)).toLocaleString('pt-BR',{minimumFractionDigits:digits,maximumFractionDigits:digits})}%`
export function monthLabel(value){ if(!value) return '—'; const [y,m]=value.split('-').map(Number); if(!y||!m) return value; return new Date(y,m-1,1).toLocaleDateString('pt-BR',{month:'short',year:'2-digit'}).replace('.','') }
export function monthLong(value){ if(!value) return '—'; const [y,m]=value.split('-').map(Number); if(!y||!m) return value; const s=new Date(y,m-1,1).toLocaleDateString('pt-BR',{month:'long',year:'numeric'}); return s.charAt(0).toUpperCase()+s.slice(1) }
export function isoToBr(value){ if(!value) return '—'; const [y,m,d]=String(value).split('-'); return y&&m&&d?`${d}/${m}/${y}`:value }
export function makeId(){ if(typeof crypto!=='undefined'&&crypto.randomUUID) return crypto.randomUUID(); return `${Date.now()}-${Math.random().toString(36).slice(2,10)}` }
export function confidenceLabel(v){ const x=String(v||'').toLowerCase(); return x==='alta'?'Alta':x==='baixa'?'Baixa':'Média' }
export function shortYear(value){ return value ? String(value).slice(0,4) : '—' }
