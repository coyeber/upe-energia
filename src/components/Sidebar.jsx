import { BarChart3, FileUp, History, Lightbulb, Landmark } from 'lucide-react'
const items=[['dashboard','Visão geral',BarChart3],['upload','Enviar conta',FileUp],['analysis','Análises e economia',Lightbulb],['history','Histórico',History]]
export default function Sidebar({page,setPage,count}){
 return <aside className="card lg:w-[250px] p-3 h-fit lg:sticky lg:top-5">
   <div className="px-3 pt-2 pb-3 flex items-center gap-3 border-b border-slate-100">
     <div className="h-10 w-10 rounded-xl bg-[#123b73] text-white flex items-center justify-center"><Landmark size={19}/></div>
     <div><div className="font-extrabold text-[#123b73] text-sm">Gestão Energética</div><div className="text-xs text-slate-500">UPE • {count} conta{count===1?'':'s'}</div></div>
   </div>
   <nav className="mt-2 grid sm:grid-cols-4 lg:grid-cols-1 gap-1">
   {items.map(([id,label,Icon])=><button key={id} onClick={()=>setPage(id)} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold text-left transition ${page===id?'bg-[#eef4fb] text-[#123b73]':'text-slate-600 hover:bg-slate-50'}`}><Icon size={18}/><span>{label}</span></button>)}
   </nav>
 </aside>
}
