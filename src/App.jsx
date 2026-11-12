import { useEffect, useMemo, useState } from 'react'
import { Activity, Building2, Cpu, LogOut, MapPin, ShieldCheck, Sparkles, UserRound, Wifi, Zap } from 'lucide-react'
import Sidebar from './components/Sidebar'
import ServiceStatus from './components/ServiceStatus'
import ElectricBackdrop from './components/ElectricBackdrop'
import DashboardPage from './pages/DashboardPage'
import UploadPage from './pages/UploadPage'
import AnalysisPage from './pages/AnalysisPage'
import HistoryPage from './pages/HistoryPage'
import ReportPage from './pages/ReportPage'
import ConsumptionPage from './pages/ConsumptionPage'
import DemandPage from './pages/DemandPage'
import TUSDPage from './pages/TUSDPage'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import AuthSetupScreen from './pages/AuthSetupScreen'
import EmailActionPage from './pages/EmailActionPage'
import { useAuth } from './auth/AuthContext'
import { getBills } from './data/storage'
import { loadUserBills, saveUserBill, deleteUserBill, importLocalBills } from './services/bills'
import { SUPABASE_CONFIGURED } from './lib/supabase'
import { firebaseAuth } from './lib/firebase'
import { checkAnalysisService } from './services/analysisService'

export default function App(){
 const actionParams=new URLSearchParams(window.location.search)
 const isFirebaseAction=Boolean(actionParams.get('mode')&&actionParams.get('oobCode'))
 const {enabled:authEnabled,configured:authConfigured,loading:authLoading,authError,session,user,signOut}=useAuth()
 const [entryStage,setEntryStage]=useState('landing'),[previewAccess,setPreviewAccess]=useState(false)
 const [page,setPage]=useState('dashboard'),[bills,setBills]=useState([]),[status,setStatus]=useState('checking'),[health,setHealth]=useState(null),[boot,setBoot]=useState(true)
 const [billsLoading,setBillsLoading]=useState(true)
 const [loadedUserId,setLoadedUserId]=useState(null)
 const [billsError,setBillsError]=useState('')
 const [billsBusy,setBillsBusy]=useState(false)
 const [reloadIndex,setReloadIndex]=useState(0)
 const [importKeys,setImportKeys]=useState(new Set())
 const legacyBills=useMemo(()=>getBills(),[])
 const pendingLegacy=useMemo(()=>legacyBills.filter((b,i)=>!importKeys.has(String(b.id||b.uploaded_at||`sem-id-${i}`))),[legacyBills,importKeys])
 useEffect(()=>{const min=new Promise(r=>setTimeout(r,2100));const healthReq=checkAnalysisService().then(h=>{setHealth(h);setStatus(h.apiKeyConfigured?'ready':'error')}).catch(()=>setStatus('error'));Promise.allSettled([min,healthReq]).then(()=>setBoot(false))},[])
 useEffect(()=>{
   let cancelled=false
   if(!user?.id){
     setBills([]);setImportKeys(new Set());setLoadedUserId(null);setBillsLoading(false);setBillsError('')
     return ()=>{cancelled=true}
   }
   setBills([]);setImportKeys(new Set());setLoadedUserId(null);setBillsLoading(true);setBillsError('')
   loadUserBills(user.id).then(({bills:rows,importKeys:keys})=>{
     if(cancelled)return
     setBills(rows);setImportKeys(keys);setLoadedUserId(user.id);setBillsLoading(false)
   }).catch(error=>{
     if(cancelled)return
     setBills([]);setBillsError(error.message);setLoadedUserId(user.id);setBillsLoading(false)
   })
   return ()=>{cancelled=true}
 },[user?.id,reloadIndex])
 async function saved(b){
   if(!user?.id)throw new Error('Entre com sua conta para salvar uma fatura.')
   setBillsBusy(true);setBillsError('')
   try{
     const savedBill=await saveUserBill(user.id,b)
     if(user.id===firebaseAuth.currentUser?.uid)
       setBills(current=>[savedBill,...current.filter(x=>x.id!==savedBill.id)])
     setPage('dashboard')
     return savedBill
   }catch(error){
     setBillsError(error.message)
     throw error
   }finally{setBillsBusy(false)}
 }
 async function del(id){
   if(!user?.id)return
   if(!confirm('Excluir esta conta do Supabase? Ela será removida apenas do seu usuário.'))return
   setBillsBusy(true);setBillsError('')
   try{
     await deleteUserBill(user.id,id)
     setBills(current=>current.filter(x=>x.id!==id))
   }catch(error){setBillsError(error.message)}
   finally{setBillsBusy(false)}
 }
 async function importLegacy(){
   if(!user?.id||!pendingLegacy.length)return
   if(!confirm(`Importar ${pendingLegacy.length} conta(s) deste navegador para o usuário ${user.email}? Faça isso apenas se essas contas forem suas. Os dados locais serão mantidos como backup.`))return
   setBillsBusy(true);setBillsError('')
   try{
     await importLocalBills(user.id,legacyBills,importKeys)
     setReloadIndex(v=>v+1)
   }catch(error){
     setBillsError(error.message)
     setReloadIndex(v=>v+1)
   }finally{setBillsBusy(false)}
 }
 if(isFirebaseAction)return <EmailActionPage/>
 if(entryStage==='landing')return <LandingPage onStart={()=>setEntryStage('access')}/>
 if(authEnabled&&!authConfigured)return <AuthSetupScreen/>
 if(authEnabled&&authLoading)return <AuthLoadingScreen/>
 if(authEnabled&&authError)return <AuthLoadErrorScreen onBack={()=>setEntryStage('landing')}/>
 if(authEnabled&&!session)return <LoginPage onBack={()=>setEntryStage('landing')}/>
 if(!authEnabled&&!previewAccess)return <LoginPage previewMode onBack={()=>setEntryStage('landing')} onPreviewContinue={()=>setPreviewAccess(true)}/>
 if(boot)return <BootScreen/>
 if(billsLoading||loadedUserId!==user?.id)return <AuthLoadingScreen/>
 if(billsError&&!bills.length)return <div className="auth-session-loading"><div className="auth-session-logo"><Zap size={30}/></div><strong>Não foi possível carregar suas faturas</strong><span>{billsError}</span><div className="flex flex-wrap justify-center gap-3 mt-6"><button className="btn-primary" onClick={()=>setReloadIndex(v=>v+1)}>Tentar novamente</button><button className="btn-secondary" onClick={async()=>{await signOut();setEntryStage('access')}}>Sair</button></div></div>
 return <div className="min-h-screen app-shell"><ElectricBackdrop/>
  <header className="topbar"><div className="topbar-energy-flow"/><div className="topbar-inner"><div className="topbar-brand"><div className="brand-bolt"><Zap size={20} fill="currentColor"/></div><img src="/upe-logo.png" alt="Universidade de Pernambuco"/><span/><div className="brand-copy"><strong>POLI Energia</strong><small>Escola Politécnica de Pernambuco</small><div className="topbar-identification"><em><MapPin size={11}/>Rua Prof. Benedito Monteiro, 455</em><em><Building2 size={11}/>A4 Livre Verde - Poder Público</em></div></div></div><div className="topbar-actions"><span className="live-energy"><i/><Activity size={13}/> Monitoramento ativo</span><ServiceStatus status={status}/><span className="top-count"><Wifi size={14}/>{bills.length} conta{bills.length===1?'':'s'}</span>{authEnabled&&user&&<div className="account-chip"><UserRound size={15}/><span>{user.email}</span><button type="button" onClick={async()=>{await signOut();setPreviewAccess(false);setEntryStage('access')}} title="Sair do sistema" aria-label="Sair do sistema"><LogOut size={15}/></button></div>}</div></div><div className="topbar-red"/></header>
  {!SUPABASE_CONFIGURED&&<div className="system-alert"><div><ShieldCheck size={16}/>Banco Supabase indisponível. O salvamento está desativado.</div></div>}
  {billsError&&<div className="system-alert"><div><ShieldCheck size={16}/>{billsError}</div></div>}
  {pendingLegacy.length>0&&<div className="mx-auto max-w-[1500px] px-6 pt-4"><div className="rounded-2xl border border-amber-200 bg-amber-50 text-amber-950 p-4 flex flex-wrap items-center justify-between gap-3"><div><strong>{pendingLegacy.length} conta(s) deste navegador ainda não estão no seu usuário</strong><p className="text-sm mt-1">Estes dados locais não são exibidos no painel. Importe somente se forem seus. Nenhuma conta local será apagada.</p></div><button type="button" className="btn-secondary" disabled={billsBusy} onClick={importLegacy}>{billsBusy?'Importando...':'Importar para minha conta'}</button></div></div>}
  {status==='error'&&<div className="system-alert"><div><ShieldCheck size={16}/>{health?.apiKeyConfigured===false?'Configure o serviço de análise no Vercel para ativar o processamento.':'Não foi possível verificar o serviço de análise agora.'}</div></div>}
  <main className="main-layout"><Sidebar page={page} setPage={setPage} count={bills.length}/><section key={page} className="min-w-0 flex-1 page-switch">{page==='dashboard'&&<DashboardPage bills={bills} onAdd={()=>setPage('upload')} onNavigate={setPage}/>} {page==='consumption'&&<ConsumptionPage bills={bills} onBack={()=>setPage('dashboard')}/>} {page==='demand'&&<DemandPage bills={bills} onBack={()=>setPage('dashboard')}/>} {page==='tusd'&&<TUSDPage bills={bills} onBack={()=>setPage('dashboard')}/>} {page==='upload'&&<UploadPage onSaved={saved} saving={billsBusy}/>} {page==='analysis'&&<AnalysisPage bills={bills}/>} {page==='report'&&<ReportPage bills={bills}/>} {page==='history'&&<HistoryPage bills={bills} onDelete={del} deleting={billsBusy}/>}</section></main>
  <footer className="site-footer"><div><span>POLI Energia • Gestão e análise de consumo elétrico</span><span>Processamento seguro via backend • PDF original não é armazenado</span></div></footer>
 </div>
}

function BootScreen(){
 const [progress,setProgress]=useState(8)
 useEffect(()=>{const id=setInterval(()=>setProgress(p=>Math.min(96,p+(p<45?7:p<78?4:2))),105);return()=>clearInterval(id)},[])
 const stage=progress<32?'Energizando interface':progress<62?'Sincronizando indicadores':progress<84?'Ativando motor de análise':'Finalizando ambiente seguro'
 return <div className="boot-screen boot-electric"><div className="boot-grid"/><div className="boot-glow"/><div className="boot-glow boot-glow-blue"/><div className="boot-bolt-trail trail-a"/><div className="boot-bolt-trail trail-b"/><div className="boot-card electric-boot-card"><div className="boot-brand-lockup"><div className="boot-mini-bolt"><Zap size={24} fill="currentColor"/></div><img src="/upe-logo.png" alt="UPE"/><span/><div><strong>POLI Energia</strong><small>Centro de Análise Energética</small></div></div><div className="lightning-reactor"><div className="reactor-orbit orbit-a"/><div className="reactor-orbit orbit-b"/><div className="reactor-core"><Zap size={56} strokeWidth={1.8} fill="currentColor"/></div><span className="reactor-spark s1"/><span className="reactor-spark s2"/><span className="reactor-spark s3"/><span className="reactor-spark s4"/></div><div className="boot-eyebrow"><Sparkles size={14}/> SISTEMA ENERGIZANDO</div><h1>Análise que transforma energia em decisão.</h1><p>Preparando indicadores de consumo, demanda, Uso Sistema Fio, tarifas NP/FP, impostos e custos da POLI.</p><div className="boot-stage-row"><span>{stage}</span><strong>{Math.round(progress)}%</strong></div><div className="boot-progress electric-progress"><span style={{width:`${progress}%`}}/></div><div className="boot-tech-row"><span><ShieldCheck size={14}/> Ambiente seguro</span><span><Cpu size={14}/> Serviço de análise ativo</span><span><Activity size={14}/> Indicadores sincronizados</span></div></div></div>
}


function AuthLoadingScreen(){
 return <div className="auth-session-loading"><div className="auth-session-logo"><Zap size={30} fill="currentColor"/></div><strong>Verificando acesso</strong><span>Carregando sua sessão com segurança...</span><i/></div>
}

function AuthLoadErrorScreen({onBack}){
 return <div className="auth-session-loading">
  <div className="auth-session-logo"><Zap size={30} fill="currentColor"/></div>
  <strong>Não foi possível carregar o acesso</strong>
  <span>O serviço de autenticação demorou mais do que o esperado. Isso pode acontecer por rede, bloqueio do navegador ou configuração do Firebase.</span>
  <div className="flex flex-wrap justify-center gap-3 mt-6">
   <button className="btn-primary" type="button" onClick={()=>window.location.reload()}>Tentar novamente</button>
   <button className="btn-secondary" type="button" onClick={onBack}>Voltar ao início</button>
  </div>
 </div>
}
