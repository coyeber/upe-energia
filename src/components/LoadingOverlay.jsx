import { BrainCircuit, CheckCircle2, FileSearch, ScanLine, ShieldCheck, Sparkles } from 'lucide-react'

const steps = [
  { id: 'reading', label: 'Lendo o PDF', icon: FileSearch },
  { id: 'ocr', label: 'Reconhecendo texto', icon: ScanLine },
  { id: 'ai', label: 'Analisando com Gemini', icon: BrainCircuit },
  { id: 'validating', label: 'Validando indicadores', icon: ShieldCheck }
]

export default function LoadingOverlay({ open, stage = 'reading', progress = 0, message = '' }) {
  if (!open) return null
  const current = Math.max(0, steps.findIndex(s => s.id === stage))
  return <div className="loading-backdrop" role="status" aria-live="polite">
    <div className="loading-panel animate-pop">
      <div className="loading-orb-wrap">
        <div className="loading-orb"><Sparkles size={30}/></div>
        <span className="loading-ring loading-ring-a"/><span className="loading-ring loading-ring-b"/>
      </div>
      <div className="text-center mt-5">
        <div className="label !text-blue-200">UPE Energia • Processamento seguro</div>
        <h2 className="text-2xl md:text-3xl font-black text-white mt-2">Transformando a fatura em inteligência</h2>
        <p className="text-blue-100/80 mt-2 text-sm md:text-base">{message || 'Aguarde enquanto preparamos a análise.'}</p>
      </div>
      <div className="mt-7 grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {steps.map((s, i) => { const Icon=s.icon; const done=i<current; const active=i===current; return <div key={s.id} className={`loading-step ${done?'done':''} ${active?'active':''}`}><div className="loading-step-icon">{done?<CheckCircle2 size={17}/>:<Icon size={17}/>}</div><span>{s.label}</span></div> })}
      </div>
      <div className="mt-6">
        <div className="flex justify-between text-xs text-blue-100/70 mb-2"><span>Progresso</span><span>{Math.round(progress)}%</span></div>
        <div className="loading-progress"><div className="loading-progress-bar" style={{width:`${Math.max(4,Math.min(100,progress))}%`}}/></div>
      </div>
      <div className="mt-5 flex items-center justify-center gap-2 text-xs text-blue-100/70"><ShieldCheck size={14}/>O PDF original não é enviado ao Gemini; apenas o texto extraído.</div>
    </div>
  </div>
}
