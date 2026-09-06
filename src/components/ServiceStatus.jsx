import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'

export default function ServiceStatus({ status }) {
  const cfg = status === 'ready'
    ? ['Análise online', 'bg-emerald-50 text-emerald-700 border-emerald-200', CheckCircle2]
    : status === 'error'
      ? ['Análise indisponível', 'bg-red-50 text-red-700 border-red-200', XCircle]
      : ['Verificando serviço', 'bg-blue-50 text-[#123b73] border-blue-200', Loader2]
  const Icon = cfg[2]
  return <span className={`badge border ${cfg[1]}`}><Icon size={14} className={status === 'checking' ? 'animate-spin' : ''}/>{cfg[0]}</span>
}
