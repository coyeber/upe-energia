import { BarChart3, FileBarChart2, FileUp, History, Lightbulb, Landmark } from 'lucide-react'
const items=[['dashboard','Visão geral',BarChart3],['upload','Enviar conta',FileUp],['analysis','Análises e economia',Lightbulb],['report','Relatório executivo',FileBarChart2],['history','Histórico',History]]
export default function Sidebar({page,setPage,count}){
 return <aside className="sidebar-premium lg:w-[258px] h-fit lg:sticky lg:top-[96px]">
   <div className="sidebar-brand"><div className="sidebar-brand-icon"><Landmark size={20}/></div><div><div className="font-black text-[#123b73] text-sm">Gestão Energética</div><div className="text-xs text-slate-500">UPE • {count} conta{count===1?'':'s'}</div></div></div>
   <nav>{items.map(([id,label,Icon])=><button key={id} onClick={()=>setPage(id)} className={page===id?'active':''}><Icon size={18}/><span>{label}</span><i/></button>)}</nav>
   <div className="sidebar-footer"><span>UPE Energia</span><small>Dashboard acadêmico v7</small></div>
 </aside>
}
