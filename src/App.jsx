import { useEffect, useState } from 'react'
import { Activity, Cpu, ShieldCheck, Sparkles, Wifi, Zap } from 'lucide-react'
import Sidebar from './components/Sidebar'
import ServiceStatus from './components/ServiceStatus'
import ElectricBackdrop from './components/ElectricBackdrop'
import DashboardPage from './pages/DashboardPage'
import UploadPage from './pages/UploadPage'
import AnalysisPage from './pages/AnalysisPage'
import HistoryPage from './pages/HistoryPage'
import ReportPage from './pages/ReportPage'
import { getBills,saveBill,deleteBill } from './data/storage'
import { checkAnalysisService } from './services/analysisService'

export default function App(){
 const [page,setPage]=useState('dashboard')
 const [bills,setBills]=useState(()=>getBills())
 const [status,setStatus]=useState('checking')
 const [health,setHealth]=useState(null)
 const [boot,setBoot]=useState(true)
 useEffect(()=>{
  const min=new Promise(r=>setTimeout(r,2100))
  const healthReq=checkAnalysisService().then(h=>{setHealth(h);setStatus(h.apiKeyConfigured?'ready':'error')}).catch(()=>setStatus('error'))
  Promise.allSettled([min,healthReq]).then(()=>setBoot(false))
 },[])
 function saved(b){setBills(saveBill(b));setPage('dashboard')}
 function del(id){if(confirm('Excluir esta conta do navegador?'))setBills(deleteBill(id))}
 if(boot) return <BootScreen/>
 return <div className="min-h-screen app-shell">
  <ElectricBackdrop/>
  <header className="topbar"><div className="topbar-energy-flow"/><div className="topbar-inner"><div className="topbar-brand"><img src="/upe-logo.png" alt="Universidade de Pernambuco"/><span/><div><strong>UPE Energia</strong><small>Análise e eficiência energética</small></div></div><div className="topbar-actions"><span className="live-energy"><i/><Activity size={13}/> Monitoramento ativo</span><ServiceStatus status={status}/><span className="top-count"><Wifi size={14}/>{bills.length} conta{bills.length===1?'':'s'}</span></div></div><div className="topbar-red"/></header>
  {status==='error'&&<div className="system-alert"><div><ShieldCheck size={16}/>{health?.apiKeyConfigured===false?'Configure as variáveis de ambiente do serviço de análise no Vercel para ativar o processamento.':'Não foi possível verificar o serviço de análise agora.'}</div></div>}
  <main className="main-layout"><Sidebar page={page} setPage={setPage} count={bills.length}/><section key={page} className="min-w-0 flex-1 page-switch">{page==='dashboard'&&<DashboardPage bills={bills} onAdd={()=>setPage('upload')}/>} {page==='upload'&&<UploadPage onSaved={saved}/>} {page==='analysis'&&<AnalysisPage bills={bills}/>} {page==='report'&&<ReportPage bills={bills}/>} {page==='history'&&<HistoryPage bills={bills} onDelete={del}/>}</section></main>
  <footer className="site-footer"><div><span>UPE Energia • Protótipo acadêmico de gestão energética</span><span>Processamento seguro via backend Vercel • PDF original não é armazenado</span></div></footer>
 </div>
}

function BootScreen(){
 const [progress,setProgress]=useState(8)
 useEffect(()=>{
  const id=setInterval(()=>setProgress(p=>Math.min(96,p+(p<45?7:p<78?4:2))),105)
  return()=>clearInterval(id)
 },[])
 const stage=progress<32?'Energizando interface':progress<62?'Sincronizando indicadores':progress<84?'Ativando motor de análise':'Finalizando ambiente seguro'
 return <div className="boot-screen boot-electric">
   <div className="boot-grid"/><div className="boot-glow"/><div className="boot-glow boot-glow-blue"/>
   <div className="boot-bolt-trail trail-a"/><div className="boot-bolt-trail trail-b"/>
   <div className="boot-card electric-boot-card">
     <div className="boot-brand-lockup"><img src="/upe-logo.png" alt="UPE"/><span/><div><strong>UPE Energia</strong><small>Centro de Análise Energética</small></div></div>
     <div className="lightning-reactor">
       <div className="reactor-orbit orbit-a"/><div className="reactor-orbit orbit-b"/>
       <div className="reactor-core"><Zap size={56} strokeWidth={1.8} fill="currentColor"/></div>
       <span className="reactor-spark s1"/><span className="reactor-spark s2"/><span className="reactor-spark s3"/><span className="reactor-spark s4"/>
     </div>
     <div className="boot-eyebrow"><Sparkles size={14}/> SISTEMA ENERGIZANDO</div>
     <h1>Análise que transforma energia em decisão.</h1>
     <p>Preparando o ambiente analítico da UPE, validando indicadores e conectando os serviços de análise energética.</p>
     <div className="boot-stage-row"><span>{stage}</span><strong>{Math.round(progress)}%</strong></div>
     <div className="boot-progress electric-progress"><span style={{width:`${progress}%`}}/></div>
     <div className="boot-tech-row"><span><ShieldCheck size={14}/> Ambiente seguro</span><span><Cpu size={14}/> Serviço de análise ativo</span><span><Activity size={14}/> Indicadores sincronizados</span></div>
   </div>
 </div>
}
