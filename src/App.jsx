import { useEffect, useState } from 'react'
import { Wifi, ShieldCheck } from 'lucide-react'
import Sidebar from './components/Sidebar'
import NvidiaStatus from './components/NvidiaStatus'
import DashboardPage from './pages/DashboardPage'
import UploadPage from './pages/UploadPage'
import AnalysisPage from './pages/AnalysisPage'
import HistoryPage from './pages/HistoryPage'
import { getBills,saveBill,deleteBill } from './data/storage'
import { checkNvidia } from './services/nvidia'

export default function App(){
 const [page,setPage]=useState('dashboard'),[bills,setBills]=useState(()=>getBills()),[status,setStatus]=useState('checking'),[health,setHealth]=useState(null)
 useEffect(()=>{checkNvidia().then(h=>{setHealth(h);setStatus(h.apiKeyConfigured?'ready':'error')}).catch(()=>setStatus('error'))},[])
 function saved(b){setBills(saveBill(b));setPage('dashboard')}
 function del(id){if(confirm('Excluir esta conta do navegador?'))setBills(deleteBill(id))}
 return <div className="min-h-screen">
  <header className="bg-white border-b border-slate-200 sticky top-0 z-30"><div className="max-w-[1440px] mx-auto px-4 md:px-6 h-[76px] flex items-center justify-between gap-4"><div className="flex items-center gap-4 min-w-0"><img src="/upe-logo.png" alt="Universidade de Pernambuco" className="h-12 w-auto object-contain"/><div className="hidden sm:block h-9 w-px bg-slate-200"/><div className="hidden sm:block min-w-0"><div className="font-black text-[#123b73] leading-tight">UPE Energia</div><div className="text-xs text-slate-500 truncate">Análise inteligente de contas e eficiência energética</div></div></div><div className="flex items-center gap-2"><NvidiaStatus status={status}/><span className="hidden md:inline-flex badge bg-slate-100 text-slate-600"><Wifi size={14}/>{bills.length} conta{bills.length===1?'':'s'}</span></div></div><div className="h-[3px] bg-[#ed1c2e]"/></header>
  {status==='error'&&<div className="bg-amber-50 border-b border-amber-200"><div className="max-w-[1440px] mx-auto px-4 md:px-6 py-2.5 text-xs sm:text-sm text-amber-900 flex gap-2 items-center"><ShieldCheck size={16}/>{health?.apiKeyConfigured===false?'Configure NVIDIA_API_KEY no Vercel para ativar a análise com Nemotron.':'Não foi possível verificar o backend NVIDIA agora.'}</div></div>}
  <main className="max-w-[1440px] mx-auto px-4 md:px-6 py-5 md:py-7 flex flex-col lg:flex-row gap-5"><Sidebar page={page} setPage={setPage} count={bills.length}/><section className="min-w-0 flex-1">{page==='dashboard'&&<DashboardPage bills={bills} onAdd={()=>setPage('upload')}/>} {page==='upload'&&<UploadPage onSaved={saved}/>} {page==='analysis'&&<AnalysisPage bills={bills}/>} {page==='history'&&<HistoryPage bills={bills} onDelete={del}/>}</section></main>
  <footer className="max-w-[1440px] mx-auto px-6 pb-8 text-xs text-slate-500"><div className="border-t border-slate-200 pt-5 flex flex-col md:flex-row md:justify-between gap-2"><span>UPE Energia • Protótipo acadêmico de gestão energética</span><span>NVIDIA Nemotron via backend Vercel • PDFs não são armazenados pelo sistema</span></div></footer>
 </div>
}
