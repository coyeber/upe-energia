import { useState } from 'react'
import { ArrowLeft, Eye, EyeOff, KeyRound, LockKeyhole, Mail, ShieldCheck, UserPlus, UserRound, Zap } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'

function authMessage(error){
  const code=String(error?.code||'')
  if(code.includes('invalid-credential'))return 'E-mail ou senha incorretos.'
  if(code.includes('email-already-in-use'))return 'Este e-mail já possui uma conta.'
  if(code.includes('weak-password'))return 'A senha é muito fraca. Use pelo menos 6 caracteres.'
  if(code.includes('invalid-email'))return 'Informe um e-mail válido.'
  if(code.includes('too-many-requests'))return 'Muitas tentativas. Aguarde um pouco e tente novamente.'
  if(code.includes('network-request-failed'))return 'Não foi possível conectar ao serviço de autenticação.'
  if(code.includes('operation-not-allowed'))return 'O login por e-mail e senha ainda não está ativado no Firebase.'
  if(code.includes('unauthorized-domain'))return 'Este domínio ainda não está autorizado no Firebase Authentication.'
  return 'Não foi possível concluir a operação agora. Tente novamente.'
}

export default function LoginPage({onBack}){
  const {signIn,signUp,resetPassword}=useAuth()
  const [mode,setMode]=useState('login')
  const [name,setName]=useState('')
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [confirmPassword,setConfirmPassword]=useState('')
  const [showPassword,setShowPassword]=useState(false)
  const [busy,setBusy]=useState(false)
  const [error,setError]=useState('')
  const [message,setMessage]=useState('')

  const forgot=mode==='forgot'
  const register=mode==='register'

  function switchMode(next){
    setMode(next)
    setError('')
    setMessage('')
    setPassword('')
    setConfirmPassword('')
  }

  async function submit(e){
    e.preventDefault()
    setError('')
    setMessage('')
    const cleanEmail=email.trim().toLowerCase()

    if(!cleanEmail){
      setError('Informe seu e-mail.')
      return
    }

    if(forgot){
      setBusy(true)
      const {error}=await resetPassword(cleanEmail)
      setBusy(false)
      if(error){
        setError(authMessage(error))
        return
      }
      setMessage('E-mail de recuperação enviado. Confira sua caixa de entrada e também o spam.')
      return
    }

    if(register){
      if(!name.trim()){
        setError('Informe seu nome.')
        return
      }
      if(password.length<6){
        setError('A senha precisa ter pelo menos 6 caracteres.')
        return
      }
      if(password!==confirmPassword){
        setError('As senhas não coincidem.')
        return
      }

      setBusy(true)
      const {error}=await signUp(name,cleanEmail,password)
      setBusy(false)
      if(error)setError(authMessage(error))
      return
    }

    if(!password){
      setError('Informe sua senha.')
      return
    }

    setBusy(true)
    const {error}=await signIn(cleanEmail,password)
    setBusy(false)
    if(error)setError(authMessage(error))
  }

  return <main className="auth2-page">
    <div className="auth2-bg-grid"/>
    <div className="auth2-bg-orb auth2-bg-orb-a"/>
    <div className="auth2-bg-orb auth2-bg-orb-b"/>

    <div className="auth2-topbar">
      {onBack&&<button className="auth2-back" type="button" onClick={onBack}><ArrowLeft size={16}/> Voltar ao início</button>}
    </div>

    <section className="auth2-card">
      <InfoPanel/>

      <section className="auth2-form-side">
        <div className="auth2-form-wrap">
          <div className="auth2-form-icon">{register?<UserPlus size={23}/>:<KeyRound size={23}/>}</div>
          <div className="auth2-overline">{register?'NOVO ACESSO':forgot?'RECUPERAÇÃO DE ACESSO':'ACESSO RESTRITO'}</div>
          <h2>{register?'Criar sua conta':forgot?'Recuperar senha':'Entrar no painel'}</h2>
          <p className="auth2-copy">{register?'Cadastre seu nome, e-mail e senha. Você entra no sistema imediatamente e recebe um e-mail para confirmar o endereço cadastrado.':forgot?'Informe o e-mail cadastrado para receber um link de redefinição de senha.':'Use seu e-mail e senha para acessar o POLI Energia.'}</p>

          {!forgot&&<div className="auth2-mode-tabs">
            <button type="button" className={mode==='login'?'active':''} onClick={()=>switchMode('login')}><KeyRound size={15}/> Entrar</button>
            <button type="button" className={register?'active':''} onClick={()=>switchMode('register')}><UserPlus size={15}/> Criar conta</button>
          </div>}

          <form className="auth2-form" onSubmit={submit}>
            {register&&<label>
              <span>Nome completo</span>
              <div className="auth2-input">
                <UserRound size={17}/>
                <input type="text" autoComplete="name" placeholder="Seu nome" value={name} onChange={e=>setName(e.target.value)}/>
              </div>
            </label>}

            <label>
              <span>E-mail</span>
              <div className="auth2-input">
                <Mail size={17}/>
                <input type="email" inputMode="email" autoComplete="email" placeholder="seuemail@exemplo.com" value={email} onChange={e=>setEmail(e.target.value)}/>
              </div>
            </label>

            {!forgot&&<label>
              <span>Senha</span>
              <div className="auth2-input">
                <LockKeyhole size={17}/>
                <input type={showPassword?'text':'password'} autoComplete={register?'new-password':'current-password'} placeholder={register?'Crie uma senha':'Digite sua senha'} value={password} onChange={e=>setPassword(e.target.value)}/>
                <button type="button" onClick={()=>setShowPassword(v=>!v)} aria-label={showPassword?'Ocultar senha':'Mostrar senha'}>
                  {showPassword?<EyeOff size={17}/>:<Eye size={17}/>}
                </button>
              </div>
            </label>}

            {register&&<label>
              <span>Confirmar senha</span>
              <div className="auth2-input">
                <LockKeyhole size={17}/>
                <input type={showPassword?'text':'password'} autoComplete="new-password" placeholder="Digite a senha novamente" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)}/>
              </div>
            </label>}

            {error&&<div className="auth2-message error">{error}</div>}
            {message&&<div className="auth2-message success">{message}</div>}

            <button className="auth2-submit" disabled={busy} type="submit">
              {busy?<><span className="auth2-spinner"/>Aguarde...</>:forgot?'Enviar recuperação':register?'Criar minha conta':'Entrar no sistema'}
            </button>
          </form>

          {mode==='login'&&<button className="auth2-forgot" type="button" onClick={()=>switchMode('forgot')}>Esqueci minha senha</button>}
          {forgot&&<button className="auth2-forgot" type="button" onClick={()=>switchMode('login')}>Voltar para o login</button>}

          <div className="auth2-note">
            <ShieldCheck size={14}/>
            <span>Autenticação gerenciada pelo Firebase. Novos cadastros recebem e-mail de verificação, sem bloquear o acesso ao painel.</span>
          </div>
        </div>
      </section>
    </section>
  </main>
}

function InfoPanel(){
  return <aside className="auth2-info">
    <div className="auth2-brand">
      <img src="/upe-logo.png" alt="Universidade de Pernambuco"/>
      <span/>
      <div><strong>POLI Energia</strong><small>Escola Politécnica de Pernambuco</small></div>
    </div>

    <div className="auth2-info-content">
      <div className="auth2-mark"><Zap size={34} fill="currentColor"/></div>
      <div className="auth2-kicker">SISTEMA DE GESTÃO ENERGÉTICA</div>
      <h1>Acesse o painel energético da POLI.</h1>
      <p>Consulte consumo, demanda contratada, máximas NP/FP, tarifas e relatórios em um ambiente seguro, claro e organizado.</p>
      <div className="auth2-points">
        <div><ShieldCheck size={16}/><span><strong>Acesso autenticado</strong><small>Cadastro e sessão protegidos pelo Firebase Authentication.</small></span></div>
        <div><LockKeyhole size={16}/><span><strong>Recuperação por e-mail</strong><small>Redefinição de senha sem precisar administrar SMTP próprio.</small></span></div>
      </div>
    </div>

    <div className="auth2-info-footer"><span>POLI Energia</span><span>Gestão e análise de consumo elétrico</span></div>
  </aside>
}
