const KEY = 'upe_energy_bills_v5'
const parse = (v, fallback) => { try { return JSON.parse(v) ?? fallback } catch { return fallback } }
export function getBills(){ return parse(localStorage.getItem(KEY), []) }
export function saveBill(bill){ const items=getBills(); const next=[bill,...items.filter(x=>x.id!==bill.id)]; localStorage.setItem(KEY,JSON.stringify(next)); return next }
export function deleteBill(id){ const next=getBills().filter(x=>x.id!==id); localStorage.setItem(KEY,JSON.stringify(next)); return next }
export function clearBills(){ localStorage.removeItem(KEY); return [] }
