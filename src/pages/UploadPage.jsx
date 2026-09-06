import { useState } from 'react'
import { FileUp, Sparkles, FileText, AlertTriangle, CheckCircle2, ScanLine } from 'lucide-react'
import { extractPdfText } from '../services/pdf'
import { ocrPdf } from '../services/ocr'
import { analyzeWithNemotron } from '../services/nvidia'
import ReviewForm from '../components/ReviewForm'

export default function UploadPage({onSaved}){
 const [file,setFile]=useState(null),[state,setState]=useState('idle'),[progress,setProgress]=useState(0),[msg,setMsg]=useState(''),[result,setResult]=useState(null),[meta,setMeta]=useState({})
 async function run(){
  if(!file) return
  setState('reading');setProgress(0);setMsg('Extraindo texto do PDF...');setResult(null)
  try{
    let text=await extractPdfText(file,setProgress)
    if(text.replace(/\s/g,'').length<180){setState('ocr');setMsg('PDF com pouco texto. Ativando OCR local...');text=await ocrPdf(file,setProgress)}
    if(text.replace(/\s/g,'').length<100) throw new Error('Não foi possível extrair texto suficiente desta conta.')
    setState('ai');setProgress(100);setMsg('NVIDIA Nemotron está lendo, interpretando e diagnosticando a fatura...')
    const response=await analyzeWithNemotron(text)
    setMeta({provider:response.provider,model:response.model});setResult(response.data);setState('review');setMsg('')
  }catch(e){setState('error');setMsg(e.message||'Falha ao analisar a conta.')}
 }
 const busy=['reading','ocr','ai'].includes(state)
 return <div className="space-y-5">
  <section className="upe-gradient rounded-[24px] overflow-hidden text-white relative">
   <div className="absolute right-0 top-0 h-full w-2 bg-[#ed1c2e]" />
   <div className="p-6 md:p-8"><div className="text-blue-100 text-xs font-extrabold tracking-[.2em] uppercase">Nova análise</div><h1 className="text-3xl md:text-4xl font-black mt-2">Envie uma conta de energia</h1><p className="mt-3 max-w-2xl text-blue-50/90">O PDF é lido no navegador. Apenas o texto extraído é enviado ao NVIDIA Nemotron pelo backend seguro do Vercel.</p></div>
  </section>
  {!result&&<section className="card p-5 md:p-7">
    <label className="block border-2 border-dashed border-[#bfd0e5] rounded-2xl p-7 text-center hover:bg-blue-50/40 cursor-pointer">
      <input type="file" accept="application/pdf" className="hidden" onChange={e=>{setFile(e.target.files?.[0]||null);setState('idle');setMsg('')}}/>
      <div className="mx-auto h-14 w-14 rounded-2xl bg-[#eef4fb] text-[#123b73] flex items-center justify-center"><FileUp/></div>
      <div className="font-extrabold mt-3">{file?file.name:'Clique para selecionar um PDF'}</div><div className="text-sm text-slate-500 mt-1">{file?`${(file.size/1024/1024).toFixed(2)} MB`:'Conta de energia em formato PDF'}</div>
    </label>
    {busy&&<div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
      <div className="flex gap-3 items-center"><div className="h-10 w-10 rounded-xl bg-[#123b73] text-white flex items-center justify-center animate-pulse">{state==='ocr'?<ScanLine size={19}/>:state==='ai'?<Sparkles size={19}/>:<FileText size={19}/>}</div><div className="flex-1"><div className="font-extrabold text-[#123b73]">{msg}</div><div className="h-2 bg-white rounded-full overflow-hidden mt-2"><div className="h-full bg-[#ed1c2e] transition-all" style={{width:`${state==='ai'?100:progress}%`}}/></div></div></div>
    </div>}
    {state==='error'&&<div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 flex gap-3"><AlertTriangle className="shrink-0"/><div><div className="font-extrabold">Não foi possível concluir a análise</div><div className="text-sm mt-1">{msg}</div></div></div>}
    <div className="mt-5 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between"><div className="text-xs text-slate-500 flex items-center gap-2"><CheckCircle2 size={15} className="text-emerald-600"/>kWh e kW são validados separadamente.</div><button className="btn-red" disabled={!file||busy} onClick={run}><Sparkles size={18}/>{busy?'Analisando...':'Analisar com Nemotron'}</button></div>
  </section>}
  {result&&<ReviewForm data={result} fileName={file?.name} provider={meta.provider} model={meta.model} onSave={onSaved}/>} 
 </div>
}
