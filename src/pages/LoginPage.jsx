import { useState } from 'react'
import { SignIn, SignUp } from '@clerk/react'
import { ArrowLeft, KeyRound, LockKeyhole, ShieldCheck, UserPlus, Zap } from 'lucide-react'

const appearance={
  variables:{
    colorPrimary:'#123b73',
    colorText:'#17395f',
    colorTextSecondary:'#6f8094',
    colorBackground:'#ffffff',
    colorInputBackground:'#f9fbfd',
    colorInputText:'#17395f',
    borderRadius:'12px',
    fontFamily:'Inter, ui-sans-serif, system-ui, sans-serif'
  },
  elements:{
    rootBox:{width:'100%'},
    cardBox:{width:'100%',boxShadow:'none'},
    card:{width:'100%',boxShadow:'none',padding:'0',background:'transparent'},
    header:{display:'none'},
    socialButtonsBlockButton:{border:'1px solid #dbe4ed',boxShadow:'none'},
    formFieldLabel:{color:'#41566f',fontWeight:'800',fontSize:'12px'},
    formFieldInput:{height:'50px',border:'1px solid #d5dfeb',boxShadow:'none'},
    formButtonPrimary:{height:'50px',background:'#ed1c2e',fontWeight:'900',boxShadow:'0 10px 22px rgba(237,28,46,.16)'},
    footer:{marginTop:'16px'},
    footerActionText:{color:'#7d8a99'},
    footerActionLink:{color:'#123b73',fontWeight:'900'},
    identityPreviewEditButton:{color:'#123b73'},
    formResendCodeLink:{color:'#123b73',fontWeight:'800'}
  }
}

export default function LoginPage({onBack,previewMode=false,onPreviewContinue}){
  const [mode,setMode]=useState('login')

  if(previewMode){
    return <main className="auth2-page">
      <div className="auth2-bg-grid"/>
      <div className="auth2-topbar">{onBack&&<button className="auth2-back" type="button" onClick={onBack}><ArrowLeft size={16}/> Voltar ao início</button>}</div>
      <section className="auth2-card">
        <InfoPanel/>
        <section className="auth2-form-side"><div className="auth2-form-wrap">
          <div className="auth2-form-icon"><KeyRound size={23}/></div>
          <div className="auth2-overline">MODO DE TESTE</div>
          <h2>Acessar o painel</h2>
          <p className="auth2-copy">O login real ainda não está configurado neste ambiente.</p>
          <button className="auth2-submit" type="button" onClick={onPreviewContinue}>Acessar painel temporariamente</button>
        </div></section>
      </section>
    </main>
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
        <div className="auth2-form-wrap clerk-auth-wrap">
          <div className="auth2-form-icon">{mode==='register'?<UserPlus size={23}/>:<KeyRound size={23}/>}</div>
          <div className="auth2-overline">{mode==='register'?'NOVO ACESSO':'ACESSO RESTRITO'}</div>
          <h2>{mode==='register'?'Criar sua conta':'Entrar no painel'}</h2>
          <p className="auth2-copy">{mode==='register'?'Crie seu perfil para acessar o POLI Energia. O Clerk cuidará da verificação e segurança do cadastro.':'Entre com seu e-mail e senha para acessar o POLI Energia.'}</p>

          <div className="auth2-mode-tabs">
            <button type="button" className={mode==='login'?'active':''} onClick={()=>setMode('login')}><KeyRound size={15}/> Entrar</button>
            <button type="button" className={mode==='register'?'active':''} onClick={()=>setMode('register')}><UserPlus size={15}/> Criar conta</button>
          </div>

          <div className="clerk-auth-component">
            {mode==='register'
              ? <SignUp routing="hash" appearance={appearance} signInUrl="#" fallbackRedirectUrl="/"/>
              : <SignIn routing="hash" appearance={appearance} signUpUrl="#" fallbackRedirectUrl="/"/>}
          </div>

          <div className="auth2-note"><ShieldCheck size={14}/><span>Autenticação gerenciada pelo Clerk. Os dados energéticos continuam armazenados no Supabase.</span></div>
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
      <p>Consulte consumo, demanda máxima, Ponta, Fora de Ponta, TE, TUSD e relatórios em um ambiente seguro, claro e organizado.</p>
      <div className="auth2-points">
        <div><ShieldCheck size={16}/><span><strong>Acesso autenticado</strong><small>Conta e sessão protegidas pelo Clerk.</small></span></div>
        <div><LockKeyhole size={16}/><span><strong>Dados separados</strong><small>Supabase permanece responsável pelo banco energético.</small></span></div>
      </div>
    </div>

    <div className="auth2-info-footer"><span>POLI Energia</span><span>Gestão e análise de consumo elétrico</span></div>
  </aside>
}
