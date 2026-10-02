import { ArrowLeft, CalendarDays } from 'lucide-react'

export function DetailHeader({icon:Icon,kicker,title,subtitle,onBack}){
  return <section className="detail-hero animate-enter">
    <div className="detail-hero-grid"/>
    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <div>
        <div className="hero-kicker">{Icon&&<Icon size={14}/>} {kicker}</div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {onBack&&<button className="btn-secondary" onClick={onBack}><ArrowLeft size={16}/>Voltar ao dashboard</button>}
    </div>
  </section>
}

export function YearSelector({years,year,setYear}){
  return <div className="detail-year-filter"><CalendarDays size={16}/><span>Ano de referência</span><select value={year} onChange={e=>setYear(e.target.value)}>{years.map(y=><option key={y} value={y}>{y}</option>)}</select></div>
}

export function DetailMetric({icon:Icon,label,value,note,tone='blue'}){
  return <article className={`detail-metric ${tone}`}><div className="detail-metric-icon">{Icon&&<Icon size={19}/>}</div><div><span>{label}</span><strong>{value}</strong>{note&&<small>{note}</small>}</div></article>
}

export function EmptyDetail({text='Ainda não há dados suficientes para esta análise.'}){
  return <div className="card detail-empty"><strong>Dados ainda não disponíveis</strong><p>{text}</p></div>
}
