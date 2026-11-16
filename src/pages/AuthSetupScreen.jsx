import { AlertTriangle, KeyRound, Settings2 } from 'lucide-react'

export default function AuthSetupScreen(){
  return <main className="auth-setup-screen">
    <section className="auth-setup-card">
      <div className="auth-setup-icon"><KeyRound size={30}/></div>
      <div className="label text-[#123b73]">Configuração pendente</div>
      <h1>Autenticação do Firebase não configurada</h1>
      <p>Confira a configuração do aplicativo web do projeto Firebase e ative o provedor E-mail/senha na seção Autenticação.</p>
      <div className="auth-setup-warning"><AlertTriangle size={17}/><span>Não é necessário usar uma chave Firebase Admin ou conta de serviço no navegador.</span></div>
      <div className="auth-setup-next"><Settings2 size={17}/><span>Autenticação → Método de acesso → E-mail/senha → Ativar.</span></div>
    </section>
  </main>
}
