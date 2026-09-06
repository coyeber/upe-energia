import { BrainCircuit, CheckCircle2, FileSearch, ScanLine, ShieldCheck, Sparkles, Zap } from 'lucide-react'

const steps = [
  { id: 'reading', label: 'Lendo o PDF', icon: FileSearch },
  { id: 'ocr', label: 'Reconhecendo texto', icon: ScanLine },
  { id: 'ai', label: 'Analisando com Gemini', icon: BrainCircuit },
  { id: 'validating', label: 'Validando indicadores', icon: ShieldCheck }
]

export default function LoadingOverlay({ open, stage = 'reading', progress = 0, message = '' }) {
  if (!open) return null
  const current = Math.max(0, steps.findIndex(s => s.id === stage))
  return <div className="loading-backdrop loading-electric" role="status" aria-live="polite">
    <div className="loading-noise"/><div className="loading-beam beam-a"/><div className="loading-beam beam-b"/>
    <div className="loading-panel animate-pop electric-loading-panel">
      <div className="loading-orb-wrap electric-orb-wrap">
        <span className="electric-arc arc-a"/><span className="electric-arc arc-b"/><span className="electric-arc arc-c"/>
        <div className="loading-orb electric-orb"><Zap size={32} fill="currentColor"/></div>
        <span className="loading-ring loading-ring-a"/><span className="loading-ring loading-ring-b"/>
        <span className="loading-spark ls1"/><span className="loading-spark ls2"/><span className="loading-spark ls3"/>
      </div>
      <div className="text-center mt-5">
        <div className="label !text-blue-200 inline-flex items-center gap-2"><Sparkles size={13}/> UPE Energia • Processamento inteligente</div>
        <h2 className="text-2xl md:text-3xl font-black text-white mt-2">Transformando a fatura em inteligência</h2>
        <p className="text-blue-100/80 mt-2 text-sm md:text-base">{message || 'Aguarde enquanto preparamos a análise.'}</p>
      </div>
      <div className="mt-7 grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {steps.map((s, i) => { const Icon=s.icon; const done=i<current; const active=i===current; return <div key={s.id} className={`loading-step ${done?'done':''} ${active?'active':''}`}><div className="loading-step-icon">{done?<CheckCircle2 size={17}/>:<Icon size={17}/>}</div><span>{s.label}</span>{active&&<i className="step-energy"/>}</div> })}
      </div>
      <div className="mt-6">
        <div className="flex justify-between text-xs text-blue-100/70 mb-2"><span>Fluxo de processamento</span><span>{Math.round(progress)}%</span></div>
        <div className="loading-progress electric-loading-progress"><div className="loading-progress-bar" style={{width:`${Math.max(4,Math.min(100,progress))}%`}}><i/></div></div>
      </div>
      <div className="loading-security"><ShieldCheck size={14}/>O PDF original permanece no navegador. Apenas o texto extraído é enviado ao Gemini.</div>
    </div>
  </div>
}
