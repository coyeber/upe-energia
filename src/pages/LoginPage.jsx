import { useState } from 'react'
import { ArrowLeft, Eye, EyeOff, KeyRound, LockKeyhole, Mail, ShieldCheck, UserPlus, UserRound, Wrench, Zap } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'

export default function LoginPage({onBack,previewMode=false,onPreviewContinue}){
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
  const [forgot,setForgot]=useState(false)

  async function submit(e){
    e.preventDefault()
    setError('')
    setMessage('')

    if(previewMode){
      onPreviewContinue?.()
      return
    }

    const cleanEmail=email.trim().toLowerCase()
    if(!cleanEmail){setError('Informe seu e-mail.');return}

    if(mode==='register'){
      const cleanName=name.trim()
      if(!cleanName){setError('Informe seu nome.');return}
      if(password.length<8){setError('A senha deve ter pelo menos 8 caracteres.');return}
      if(password!==confirmPassword){setError('As senhas não coincidem.');return}

      setBusy(true)
      const {data,error}=await signUp(cleanName,cleanEmail,password)
      setBusy(false)

      if(error){
        const already=/already registered|already been registered|user already exists/i.test(error.message||'')
        setError(already?'Este e-mail já possui uma conta.':'Não foi possível criar a conta agora. Verifique os dados e tente novamente.')
        return
      }

      if(data?.session){
        setMessage('Conta criada com sucesso. Você já está autenticado.')
      }else{
        setMessage('Conta criada. Verifique seu e-mail para confirmar o cadastro antes de entrar.')
        setMode('login')
        setPassword('')
        setConfirmPassword('')
      }
      return
    }

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

  return <main className="auth2-page">
    <div className="auth2-bg-grid"/>
    <div className="auth2-bg-orb auth2-bg-orb-a"/>
    <div className="auth2-bg-orb auth2-bg-orb-b"/>

    <div className="auth2-topbar">
      {onBack&&<button className="auth2-back" type="button" onClick={onBack}>
        <ArrowLeft size={16}/> Voltar ao início
      </button>}
    </div>

    <section className="auth2-card">
      <aside className="auth2-info">
        <div className="auth2-brand">
          <img src="/upe-logo.png" alt="Universidade de Pernambuco"/>
          <span/>
          <div>
            <strong>POLI Energia</strong>
            <small>Escola Politécnica de Pernambuco</small>
          </div>
        </div>

        <div className="auth2-info-content">
          <div className="auth2-mark"><Zap size={34} fill="currentColor"/></div>
          <div className="auth2-kicker">SISTEMA DE GESTÃO ENERGÉTICA</div>
          <h1>Acesse o painel energético da POLI.</h1>
          <p>Consulte consumo, demanda máxima, Ponta, Fora de Ponta, TE, TUSD e relatórios em um ambiente seguro, claro e organizado.</p>

          <div className="auth2-points">
            <div><ShieldCheck size={16}/><span><strong>Acesso autenticado</strong><small>Entrada restrita a usuários autorizados.</small></span></div>
            <div><LockKeyhole size={16}/><span><strong>Sessão protegida</strong><small>Seu acesso permanece vinculado à sessão autenticada.</small></span></div>
          </div>
        </div>

        <div className="auth2-info-footer">
          <span>POLI Energia</span>
          <span>Gestão e análise de consumo elétrico</span>
        </div>
      </aside>

      <section className="auth2-form-side">
        <div className="auth2-form-wrap">
          <div className="auth2-form-icon">{mode==='register'?<UserPlus size={23}/>:<KeyRound size={23}/>}</div>
          <div className="auth2-overline">{mode==='register'?'NOVO ACESSO':'ACESSO RESTRITO'}</div>
          <h2>{forgot?'Recuperar senha':mode==='register'?'Criar sua conta':'Entrar no painel'}</h2>
          <p className="auth2-copy">{forgot?'Informe seu e-mail para receber as instruções de recuperação.':mode==='register'?'Cadastre seus dados para criar um acesso ao POLI Energia.':'Use o e-mail e a senha cadastrados para acessar o POLI Energia.'}</p>

          {!forgot&&!previewMode&&<div className="auth2-mode-tabs">
            <button type="button" className={mode==='login'?'active':''} onClick={()=>{setMode('login');setError('');setMessage('')}}><KeyRound size={15}/> Entrar</button>
            <button type="button" className={mode==='register'?'active':''} onClick={()=>{setMode('register');setError('');setMessage('')}}><UserPlus size={15}/> Criar conta</button>
          </div>}

          {previewMode&&<div className="auth2-preview">
            <Wrench size={16}/>
            <div><strong>Login em preparação</strong><span>O banco ainda será conectado. O acesso abaixo é temporário para testar o fluxo.</span></div>
          </div>}

          <form className="auth2-form" onSubmit={submit}>
            {mode==='register'&&!forgot&&<label>
              <span>Nome completo</span>
              <div className="auth2-input">
                <UserRound size={17}/>
                <input
                  type="text"
                  autoComplete="name"
                  placeholder="Seu nome"
                  value={name}
                  onChange={e=>setName(e.target.value)}
                />
              </div>
            </label>}

            <label>
              <span>E-mail</span>
              <div className="auth2-input">
                <Mail size={17}/>
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="seuemail@exemplo.com"
                  value={email}
                  onChange={e=>setEmail(e.target.value)}
                  disabled={previewMode}
                />
              </div>
            </label>

            {!forgot&&<label>
              <span>Senha</span>
              <div className="auth2-input">
                <LockKeyhole size={17}/>
                <input
                  type={showPassword?'text':'password'}
                  autoComplete={mode==='register'?'new-password':'current-password'}
                  placeholder={mode==='register'?'Crie uma senha com 8+ caracteres':'Digite sua senha'}
                  value={password}
                  onChange={e=>setPassword(e.target.value)}
                  disabled={previewMode}
                />
                <button
                  type="button"
                  onClick={()=>setShowPassword(v=>!v)}
                  aria-label={showPassword?'Ocultar senha':'Mostrar senha'}
                  disabled={previewMode}
                >
                  {showPassword?<EyeOff size={17}/>:<Eye size={17}/>}
                </button>
              </div>
            </label>}

            {mode==='register'&&!forgot&&<label>
              <span>Confirmar senha</span>
              <div className="auth2-input">
                <LockKeyhole size={17}/>
                <input
                  type={showPassword?'text':'password'}
                  autoComplete="new-password"
                  placeholder="Digite a senha novamente"
                  value={confirmPassword}
                  onChange={e=>setConfirmPassword(e.target.value)}
                />
              </div>
            </label>}

            {error&&<div className="auth2-message error">{error}</div>}
            {message&&<div className="auth2-message success">{message}</div>}

            <button className="auth2-submit" disabled={busy} type="submit">
              {busy?<><span className="auth2-spinner"/>Aguarde...</>:previewMode?'Acessar painel temporariamente':forgot?'Enviar recuperação':mode==='register'?'Criar minha conta':'Entrar no sistema'}
            </button>
          </form>

          {!previewMode&&mode==='login'&&<button className="auth2-forgot" type="button" onClick={()=>{setForgot(v=>!v);setError('');setMessage('')}}>
            {forgot?'Voltar para o login':'Esqueci minha senha'}
          </button>}

          {!previewMode&&mode==='register'&&!forgot&&<p className="auth2-register-note">Ao criar a conta, o acesso inicial é do tipo <strong>visualizador</strong>.</p>}

          <div className="auth2-note">
            <ShieldCheck size={14}/>
            <span>{previewMode?'O login real será ativado quando o banco for conectado.':'O acesso ao dashboard é restrito a usuários autorizados.'}</span>
          </div>
        </div>
      </section>
    </section>
  </main>
}
