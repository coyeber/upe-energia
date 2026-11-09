import { AlertTriangle, KeyRound, Settings2 } from 'lucide-react'

export default function AuthSetupScreen(){
  return <main className="auth-setup-screen">
    <section className="auth-setup-card">
      <div className="auth-setup-icon"><KeyRound size={30}/></div>
      <div className="label text-[#123b73]">Configuração pendente</div>
      <h1>Clerk ainda não configurado neste ambiente</h1>
      <p>Adicione a chave pública do Clerk ao Vercel para ativar login, cadastro e recuperação de conta.</p>
      <div className="auth-setup-vars"><code>VITE_CLERK_PUBLISHABLE_KEY</code></div>
      <div className="auth-setup-warning"><AlertTriangle size={17}/><span>Nunca coloque CLERK_SECRET_KEY ou qualquer chave sk_ no navegador.</span></div>
      <div className="auth-setup-next"><Settings2 size={17}/><span>Depois de salvar a variável, faça um novo deploy.</span></div>
    </section>
  </main>
}
