import { useState } from 'react'
import { ArrowLeft, Eye, EyeOff, KeyRound, LockKeyhole, Mail, ShieldCheck, Sparkles, Wrench, Zap } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'

export default function LoginPage({onBack,previewMode=false,onPreviewContinue}){
  const {signIn,resetPassword}=useAuth()
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [showPassword,setShowPassword]=useState(false)
  const [busy,setBusy]=useState(false)
  const [error,setError]=useState('')
  const [message,setMessage]=useState('')
  const [forgot,setForgot]=useState(false)

  async function submit(e){
    e.preventDefault()
    setError('')
    setMessage('')
    if(previewMode){onPreviewContinue?.();return}
    const cleanEmail=email.trim().toLowerCase()
    if(!cleanEmail){setError('Informe seu e-mail.');return}
    if(forgot){
      setBusy(true)
      const {error}=await resetPassword(cleanEmail)
      setBusy(false)
      if(error){setError('Não foi possível enviar a recuperação de senha.');return}
      setMessage('Se o e-mail estiver cadastrado, você receberá as instruções para redefinir a senha.')
      return
    }
    if(!password){setError('Informe sua senha.');return}
    setBusy(true)
    const {error}=await signIn(cleanEmail,password)
    setBusy(false)
    if(error){
      const invalid=/invalid login credentials/i.test(error.message||'')
      setError(invalid?'E-mail ou senha incorretos.':'Não foi possível entrar agora. Tente novamente.')
    }
  }

  return <main className="auth-screen">
    <div className="auth-grid"/>
    <div className="auth-glow auth-glow-a"/>
    <div className="auth-glow auth-glow-b"/>
    {onBack&&<button className="auth-back" type="button" onClick={onBack}><ArrowLeft size={17}/> Voltar ao início</button>}
    <section className="auth-shell">
      <div className="auth-presentation">
        <div className="auth-brand">
          <img src="/upe-logo.png" alt="Universidade de Pernambuco"/>
          <div><strong>POLI Energia</strong><span>Escola Politécnica de Pernambuco</span></div>
        </div>
        <div className="auth-electric-mark"><span/><Zap size={52} fill="currentColor"/><i/></div>
        <div className="auth-kicker"><Sparkles size={14}/> SISTEMA DE GESTÃO ENERGÉTICA</div>
        <h1>Dados energéticos protegidos em um único ambiente.</h1>
        <p>Acesse o painel para consultar consumo, demanda máxima, Ponta, Fora de Ponta, TE, TUSD e relatórios da POLI.</p>
        <div className="auth-trust">
          <span><ShieldCheck size={15}/> Acesso autenticado</span>
          <span><LockKeyhole size={15}/> Sessão protegida</span>
        </div>
      </div>

      <div className="auth-form-panel">
        <div className="auth-form-head">
          <div className="auth-form-icon"><KeyRound size={24}/></div>
          <div><span>ACESSO RESTRITO</span><h2>{forgot?'Recuperar senha':'Entrar no painel'}</h2></div>
        </div>
        <p className="auth-form-copy">{forgot?'Informe seu e-mail institucional para receber o link de recuperação.':'Use o e-mail e a senha cadastrados para acessar o POLI Energia.'}</p>

        {previewMode&&<div className="auth-preview-banner"><Wrench size={17}/><div><strong>Login em preparação</strong><span>O banco ainda será conectado. Por enquanto, este botão libera o painel apenas para testar o fluxo visual.</span></div></div>}

        <form onSubmit={submit} className="auth-form">
          <label>
            <span>E-mail</span>
            <div className="auth-input"><Mail size={18}/><input type="email" inputMode="email" autoComplete="email" placeholder="seuemail@upe.br" value={email} onChange={e=>setEmail(e.target.value)} disabled={previewMode}/></div>
          </label>

          {!forgot&&<label>
            <span>Senha</span>
            <div className="auth-input"><LockKeyhole size={18}/><input type={showPassword?'text':'password'} autoComplete="current-password" placeholder="Digite sua senha" value={password} onChange={e=>setPassword(e.target.value)} disabled={previewMode}/><button type="button" onClick={()=>setShowPassword(v=>!v)} aria-label={showPassword?'Ocultar senha':'Mostrar senha'} disabled={previewMode}>{showPassword?<EyeOff size={18}/>:<Eye size={18}/>}</button></div>
          </label>}

          {error&&<div className="auth-message error">{error}</div>}
          {message&&<div className="auth-message success">{message}</div>}

          <button className="auth-submit" disabled={busy} type="submit">
            {busy?<><span className="auth-spinner"/>Aguarde...</>:previewMode?'Acessar painel temporariamente':forgot?'Enviar recuperação':'Entrar no sistema'}
          </button>
        </form>

        {!previewMode&&<button className="auth-forgot" type="button" onClick={()=>{setForgot(v=>!v);setError('');setMessage('')}}>
          {forgot?'Voltar para o login':'Esqueci minha senha'}
        </button>}

        <div className="auth-footer-note"><ShieldCheck size={14}/> {previewMode?'O login real será ativado quando o banco for conectado.':'O acesso ao dashboard é restrito a usuários autorizados.'}</div>
      </div>
    </section>
  </main>
}
