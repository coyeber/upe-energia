import { useState } from 'react'
import { CheckCircle2, FileText, FileUp, ScanLine, ShieldCheck, Sparkles, WandSparkles } from 'lucide-react'
import { extractPdfText } from '../services/pdf'
import { ocrPdf } from '../services/ocr'
import { analyzeWithGemini } from '../services/gemini'
import ReviewForm from '../components/ReviewForm'
import LoadingOverlay from '../components/LoadingOverlay'

export default function UploadPage({onSaved}){
 const [file,setFile]=useState(null)
 const [state,setState]=useState('idle')
 const [progress,setProgress]=useState(0)
 const [msg,setMsg]=useState('')
 const [result,setResult]=useState(null)
 const [meta,setMeta]=useState({})

 async function run(){
  if(!file) return
  setState('reading');setProgress(4);setMsg('Lendo as páginas e extraindo o texto do PDF...');setResult(null)
  let ticker
  try{
    let text=await extractPdfText(file,p=>setProgress(Math.max(6,Math.min(42,p*.42))))
    if(text.replace(/\s/g,'').length<180){
      setState('ocr');setProgress(45);setMsg('O PDF possui pouco texto selecionável. Ativando OCR local...')
      text=await ocrPdf(file,p=>setProgress(45+Math.min(25,p*.25)))
    }
    if(text.replace(/\s/g,'').length<100) throw new Error('Não foi possível extrair texto suficiente desta conta.')
    setState('ai');setProgress(72);setMsg('O Google Gemini está identificando consumo, gastos, dias, histórico e indicadores técnicos...')
    ticker=setInterval(()=>setProgress(p=>Math.min(92,p+1.1)),450)
    const response=await analyzeWithGemini(text)
    clearInterval(ticker)
    setState('validating');setProgress(96);setMsg('Validando kWh, kW, datas, valores e consistência do histórico...')
    await new Promise(r=>setTimeout(r,650))
    setProgress(100)
    setMeta({provider:response.provider,model:response.model});setResult(response.data);setState('review');setMsg('')
  }catch(e){ if(ticker)clearInterval(ticker);setState('error');setProgress(0);setMsg(e.message||'Falha ao analisar a conta.') }
 }
 const busy=['reading','ocr','ai','validating'].includes(state)
 return <div className="space-y-5 page-enter">
  <LoadingOverlay open={busy} stage={state} progress={progress} message={msg}/>
  <section className="upload-hero animate-enter"><div className="hero-grid"/><div className="relative z-10"><div className="hero-kicker"><WandSparkles size={14}/>Nova análise inteligente</div><h1>Envie uma conta de energia</h1><p>O sistema extrai o texto do PDF, usa OCR quando necessário e pede ao Gemini uma leitura estruturada para o dashboard institucional.</p><div className="upload-trust"><span><ShieldCheck size={15}/>PDF original não é armazenado</span><span><CheckCircle2 size={15}/>kWh e kW separados</span><span><Sparkles size={15}/>Conferência antes de salvar</span></div></div></section>

  {!result&&<section className="card upload-card animate-enter delay-1">
    <label className={`drop-zone ${file?'has-file':''}`}>
      <input type="file" accept="application/pdf" className="hidden" onChange={e=>{setFile(e.target.files?.[0]||null);setState('idle');setMsg('');setResult(null)}}/>
      <div className="drop-icon">{file?<FileText size={26}/>:<FileUp size={26}/>}</div>
      <div className="drop-title">{file?file.name:'Selecione ou arraste uma conta em PDF'}</div>
      <div className="drop-subtitle">{file?`${(file.size/1024/1024).toFixed(2)} MB • pronto para análise`:'PDF nativo ou escaneado • OCR automático quando necessário'}</div>
      {file&&<div className="file-ready"><CheckCircle2 size={15}/>Arquivo carregado</div>}
    </label>

    {state==='error'&&<div className="error-panel"><div><ScanLine size={20}/></div><section><strong>Não foi possível concluir a análise</strong><p>{msg}</p><small>Se o erro vier da API, verifique GEMINI_API_KEY, GEMINI_MODEL e faça um novo deploy no Vercel.</small></section></div>}

    <div className="upload-actions"><div className="upload-security"><ShieldCheck size={16}/><span>Apenas o texto extraído é enviado ao backend seguro do Vercel.</span></div><button className="btn-red btn-large" disabled={!file||busy} onClick={run}><Sparkles size={19}/>{busy?'Processando...':'Analisar conta com Gemini'}</button></div>
  </section>}

  {result&&<ReviewForm data={result} fileName={file?.name} provider={meta.provider} model={meta.model} onSave={onSaved}/>} 
 </div>
}
