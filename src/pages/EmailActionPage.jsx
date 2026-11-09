import { useEffect, useMemo, useState } from 'react'
import {
  applyActionCode,
  checkActionCode,
  confirmPasswordReset,
  verifyPasswordResetCode
} from 'firebase/auth'
import {
  AlertTriangle, ArrowRight, CheckCircle2, Eye, EyeOff,
  KeyRound, LockKeyhole, MailCheck, ShieldCheck, Zap
} from 'lucide-react'
import { firebaseAuth } from '../lib/firebase'

const modeCopy={
  verifyEmail:{
    eyebrow:'CONFIRMAÇÃO DE E-MAIL',
    title:'Confirme seu acesso ao POLI Energia',
    loading:'Validando seu endereço de e-mail...'
  },
  recoverEmail:{
    eyebrow:'SEGURANÇA DA CONTA',
    title:'Recuperação de e-mail',
    loading:'Validando a solicitação...'
  },
  resetPassword:{
    eyebrow:'REDEFINIÇÃO DE SENHA',
    title:'Crie uma nova senha',
    loading:'Validando o link de recuperação...'
  }
}

export default function EmailActionPage(){
  const params=useMemo(()=>new URLSearchParams(window.location.search),[])
  const mode=params.get('mode')||'verifyEmail'
  const oobCode=params.get('oobCode')||''
  const copy=modeCopy[mode]||modeCopy.verifyEmail
  const [state,setState]=useState('loading')
  const [detail,setDetail]=useState('')
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [confirmPassword,setConfirmPassword]=useState('')
  const [showPassword,setShowPassword]=useState(false)
  const [busy,setBusy]=useState(false)

  useEffect(()=>{
    let active=true
    async function run(){
      if(!oobCode){
        if(active){setState('error');setDetail('O link está incompleto. Solicite um novo e-mail de confirmação.')}
        return
      }

      try{
        if(mode==='resetPassword'){
          const targetEmail=await verifyPasswordResetCode(firebaseAuth,oobCode)
          if(active){setEmail(targetEmail);setState('password')}
          return
        }

        if(mode==='verifyEmail'){
          const info=await checkActionCode(firebaseAuth,oobCode)
          if(active)setEmail(info?.data?.email||'')
          await applyActionCode(firebaseAuth,oobCode)
          await firebaseAuth.currentUser?.reload()
          if(active)setState('success')
          return
        }

        if(mode==='recoverEmail'){
          await applyActionCode(firebaseAuth,oobCode)
          if(active)setState('success')
          return
        }

        if(active){setState('error');setDetail('Este tipo de solicitação não é reconhecido pelo POLI Energia.')}
      }catch(error){
        console.error('Erro ao processar ação do Firebase:',error)
        if(!active)return
        const code=String(error?.code||'')
        if(code.includes('expired-action-code'))setDetail('Este link expirou. Solicite um novo e-mail e tente novamente.')
        else if(code.includes('invalid-action-code'))setDetail('Este link já foi usado ou não é mais válido.')
        else if(code.includes('user-disabled'))setDetail('Esta conta está desativada.')
        else setDetail('Não foi possível validar este link. Solicite um novo e-mail e tente novamente.')
        setState('error')
      }
    }
    run()
    return()=>{active=false}
  },[mode,oobCode])

  async function savePassword(e){
    e.preventDefault()
    if(password.length<6){setDetail('A senha precisa ter pelo menos 6 caracteres.');return}
    if(password!==confirmPassword){setDetail('As senhas não coincidem.');return}
    setBusy(true);setDetail('')
    try{
      await confirmPasswordReset(firebaseAuth,oobCode,password)
      setState('success')
    }catch(error){
      console.error('Erro ao redefinir senha:',error)
      const code=String(error?.code||'')
      setDetail(code.includes('expired-action-code')?'O link expirou. Solicite uma nova recuperação de senha.':'Não foi possível redefinir a senha com este link.')
    }finally{setBusy(false)}
  }

  const successTitle=mode==='resetPassword'?'Senha atualizada com sucesso':mode==='recoverEmail'?'E-mail recuperado com sucesso':'E-mail confirmado com sucesso'
  const successText=mode==='verifyEmail'
    ? 'Seu endereço foi verificado. Sua conta do POLI Energia agora está confirmada.'
    : mode==='resetPassword'
      ? 'Sua nova senha já está ativa. Você pode entrar normalmente no sistema.'
      : 'A alteração foi concluída com segurança.'

  return <main className="min-h-screen bg-[#f4f7fb] relative overflow-hidden flex items-center justify-center p-5">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(18,59,115,.12),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(237,28,46,.09),transparent_30%)]"/>
    <div className="absolute inset-0 opacity-[.035] bg-[linear-gradient(#123b73_1px,transparent_1px),linear-gradient(90deg,#123b73_1px,transparent_1px)] bg-[size:32px_32px]"/>

    <section className="relative z-10 w-full max-w-[920px] bg-white rounded-[28px] shadow-[0_28px_70px_rgba(18,59,115,.16)] border border-slate-200 overflow-hidden grid lg:grid-cols-[.88fr_1.12fr]">
      <aside className="bg-[#123b73] text-white p-8 md:p-10 flex flex-col min-h-[520px]">
        <div className="flex items-center gap-3">
          <img src="/upe-logo.png" alt="UPE" className="h-10 w-auto bg-white rounded-md p-1"/>
          <div className="h-8 w-px bg-white/25"/>
          <div><strong className="block text-sm">POLI Energia</strong><span className="text-[11px] text-white/70">Escola Politécnica de Pernambuco</span></div>
        </div>

        <div className="my-auto py-10">
          <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center mb-6"><Zap size={28} fill="currentColor"/></div>
          <div className="text-[11px] font-black tracking-[.18em] text-white/65">IDENTIDADE DIGITAL</div>
          <h1 className="text-3xl md:text-[2.15rem] leading-tight font-black mt-3">Segurança para acessar dados energéticos da POLI.</h1>
          <p className="text-sm text-white/72 leading-relaxed mt-4">A confirmação protege sua conta e ajuda a garantir que o endereço informado pertence realmente a você.</p>
        </div>

        <div className="flex items-center gap-2 text-xs text-white/65"><ShieldCheck size={15}/> Firebase Authentication • ambiente protegido</div>
      </aside>

      <section className="p-7 md:p-10 flex items-center">
        <div className="w-full max-w-[480px] mx-auto">
          <div className="text-[11px] font-black tracking-[.18em] text-[#123b73]">{copy.eyebrow}</div>

          {state==='loading'&&<div className="mt-5">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#123b73] flex items-center justify-center"><MailCheck size={31}/></div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-5">{copy.title}</h2>
            <p className="text-sm text-slate-500 leading-relaxed mt-3">{copy.loading}</p>
            <div className="mt-7 h-2 rounded-full bg-slate-100 overflow-hidden"><div className="h-full w-2/3 bg-[#123b73] rounded-full animate-pulse"/></div>
          </div>}

          {state==='success'&&<div className="mt-5">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><CheckCircle2 size={33}/></div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-5">{successTitle}</h2>
            <p className="text-sm text-slate-500 leading-relaxed mt-3">{successText}</p>
            {email&&<div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"><span className="block text-[10px] uppercase tracking-wider font-black text-slate-400">Endereço confirmado</span><strong className="text-sm text-slate-700">{email}</strong></div>}
            <button onClick={()=>{window.location.href='/'}} className="mt-7 w-full h-12 rounded-xl bg-[#ed1c2e] text-white font-black flex items-center justify-center gap-2 shadow-[0_12px_24px_rgba(237,28,46,.18)]">Ir para o POLI Energia <ArrowRight size={17}/></button>
          </div>}

          {state==='error'&&<div className="mt-5">
            <div className="w-16 h-16 rounded-2xl bg-red-50 text-[#ed1c2e] flex items-center justify-center"><AlertTriangle size={31}/></div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-5">Não foi possível confirmar</h2>
            <p className="text-sm text-slate-500 leading-relaxed mt-3">{detail}</p>
            <button onClick={()=>{window.location.href='/'}} className="mt-7 w-full h-12 rounded-xl bg-[#123b73] text-white font-black flex items-center justify-center gap-2">Voltar ao início <ArrowRight size={17}/></button>
          </div>}

          {state==='password'&&<div className="mt-5">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#123b73] flex items-center justify-center"><KeyRound size={31}/></div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-5">Crie uma nova senha</h2>
            <p className="text-sm text-slate-500 mt-3">Redefinindo o acesso de <strong>{email}</strong>.</p>
            <form onSubmit={savePassword} className="mt-6 space-y-4">
              <label className="block"><span className="text-xs font-black text-slate-600">Nova senha</span><div className="mt-2 h-12 rounded-xl border border-slate-200 flex items-center gap-3 px-3 bg-white"><LockKeyhole size={16} className="text-slate-400"/><input className="flex-1 outline-none text-sm" type={showPassword?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Mínimo de 6 caracteres"/><button type="button" onClick={()=>setShowPassword(v=>!v)} className="text-slate-400">{showPassword?<EyeOff size={17}/>:<Eye size={17}/>}</button></div></label>
              <label className="block"><span className="text-xs font-black text-slate-600">Confirmar senha</span><div className="mt-2 h-12 rounded-xl border border-slate-200 flex items-center gap-3 px-3 bg-white"><LockKeyhole size={16} className="text-slate-400"/><input className="flex-1 outline-none text-sm" type={showPassword?'text':'password'} value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} placeholder="Digite novamente"/></div></label>
              {detail&&<div className="rounded-xl bg-red-50 text-red-700 text-xs font-bold p-3">{detail}</div>}
              <button disabled={busy} className="w-full h-12 rounded-xl bg-[#ed1c2e] text-white font-black flex items-center justify-center gap-2">{busy?'Salvando...':'Atualizar senha'} <ArrowRight size={17}/></button>
            </form>
          </div>}
        </div>
      </section>
    </section>
  </main>
}
