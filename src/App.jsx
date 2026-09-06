import { useEffect, useState } from 'react'
import { BrainCircuit, ShieldCheck, Wifi } from 'lucide-react'
import Sidebar from './components/Sidebar'
import GeminiStatus from './components/GeminiStatus'
import DashboardPage from './pages/DashboardPage'
import UploadPage from './pages/UploadPage'
import AnalysisPage from './pages/AnalysisPage'
import HistoryPage from './pages/HistoryPage'
import ReportPage from './pages/ReportPage'
import { getBills,saveBill,deleteBill } from './data/storage'
import { checkGemini } from './services/gemini'

export default function App(){
 const [page,setPage]=useState('dashboard')
 const [bills,setBills]=useState(()=>getBills())
 const [status,setStatus]=useState('checking')
 const [health,setHealth]=useState(null)
 const [boot,setBoot]=useState(true)
 useEffect(()=>{
  const min=new Promise(r=>setTimeout(r,850))
  const healthReq=checkGemini().then(h=>{setHealth(h);setStatus(h.apiKeyConfigured?'ready':'error')}).catch(()=>setStatus('error'))
  Promise.allSettled([min,healthReq]).then(()=>setBoot(false))
 },[])
 function saved(b){setBills(saveBill(b));setPage('dashboard')}
 function del(id){if(confirm('Excluir esta conta do navegador?'))setBills(deleteBill(id))}
 if(boot) return <BootScreen/>
 return <div className="min-h-screen app-shell">
  <header className="topbar"><div className="topbar-inner"><div className="topbar-brand"><img src="/upe-logo.png" alt="Universidade de Pernambuco"/><span/><div><strong>UPE Energia</strong><small>Inteligência e eficiência energética</small></div></div><div className="topbar-actions"><GeminiStatus status={status}/><span className="top-count"><Wifi size={14}/>{bills.length} conta{bills.length===1?'':'s'}</span></div></div><div className="topbar-red"/></header>
  {status==='error'&&<div className="system-alert"><div><ShieldCheck size={16}/>{health?.apiKeyConfigured===false?'Configure GEMINI_API_KEY no Vercel para ativar a análise com Gemini.':'Não foi possível verificar o backend Gemini agora.'}</div></div>}
  <main className="main-layout"><Sidebar page={page} setPage={setPage} count={bills.length}/><section className="min-w-0 flex-1">{page==='dashboard'&&<DashboardPage bills={bills} onAdd={()=>setPage('upload')}/>} {page==='upload'&&<UploadPage onSaved={saved}/>} {page==='analysis'&&<AnalysisPage bills={bills}/>} {page==='report'&&<ReportPage bills={bills}/>} {page==='history'&&<HistoryPage bills={bills} onDelete={del}/>}</section></main>
  <footer className="site-footer"><div><span>UPE Energia • Protótipo acadêmico de gestão energética</span><span>Google Gemini via backend Vercel • PDF original não é armazenado</span></div></footer>
 </div>
}

function BootScreen(){return <div className="boot-screen"><div className="boot-glow"/><div className="boot-card"><img src="/upe-logo.png"/><div className="boot-ai"><BrainCircuit size={28}/></div><div className="label !text-blue-100">UPE Energia</div><h1>Preparando o centro de inteligência</h1><p>Verificando o ambiente, carregando indicadores e conectando os serviços de análise.</p><div className="boot-progress"><span/></div><div className="boot-status"><ShieldCheck size={14}/>Inicialização segura do dashboard</div></div></div>}
