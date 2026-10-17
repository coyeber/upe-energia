import { AlertTriangle, Database, Settings2 } from 'lucide-react'

export default function AuthSetupScreen(){
  return <main className="auth-setup-screen">
    <section className="auth-setup-card">
      <div className="auth-setup-icon"><Database size={30}/></div>
      <div className="label text-[#123b73]">Configuração pendente</div>
      <h1>Login pronto para conectar ao banco</h1>
      <p>A autenticação foi ativada, mas as variáveis públicas do Supabase ainda não foram configuradas no Vercel.</p>
      <div className="auth-setup-vars">
        <code>VITE_SUPABASE_URL</code>
        <code>VITE_SUPABASE_ANON_KEY</code>
      </div>
      <div className="auth-setup-warning"><AlertTriangle size={17}/><span>Não coloque chaves administrativas ou service_role no navegador.</span></div>
      <div className="auth-setup-next"><Settings2 size={17}/><span>Depois de configurar as duas variáveis, faça um novo deploy.</span></div>
    </section>
  </main>
}
