export const brl = (v) => v == null || Number.isNaN(Number(v)) ? '—' : Number(v).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})
export const num = (v, digits=0) => v == null || Number.isNaN(Number(v)) ? '—' : Number(v).toLocaleString('pt-BR',{maximumFractionDigits:digits,minimumFractionDigits:digits})
export function monthLabel(value){
  if(!value) return '—'
  const [y,m]=value.split('-').map(Number)
  if(!y||!m) return value
  return new Date(y,m-1,1).toLocaleDateString('pt-BR',{month:'short',year:'2-digit'}).replace('.','')
}
export function monthLong(value){
  if(!value) return '—'
  const [y,m]=value.split('-').map(Number)
  if(!y||!m) return value
  return new Date(y,m-1,1).toLocaleDateString('pt-BR',{month:'long',year:'numeric'})
}
export function isoToBr(value){ if(!value) return '—'; const [y,m,d]=value.split('-'); return y&&m&&d?`${d}/${m}/${y}`:value }
export function makeId(){ if(typeof crypto!=='undefined'&&crypto.randomUUID) return crypto.randomUUID(); return `${Date.now()}-${Math.random().toString(36).slice(2,10)}` }
