import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { AUTH_ENABLED, SUPABASE_CONFIGURED, supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({children}){
  const [session,setSession]=useState(null)
  const [loading,setLoading]=useState(AUTH_ENABLED && SUPABASE_CONFIGURED)

  useEffect(()=>{
    if(!AUTH_ENABLED || !SUPABASE_CONFIGURED || !supabase){
      setLoading(false)
      return
    }

    let mounted=true
    supabase.auth.getSession().then(({data,error})=>{
      if(!mounted)return
      if(error) console.error('Erro ao recuperar sessão:',error)
      setSession(data?.session || null)
      setLoading(false)
    })

    const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,nextSession)=>{
      if(!mounted)return
      setSession(nextSession || null)
      setLoading(false)
    })

    return ()=>{
      mounted=false
      subscription?.unsubscribe()
    }
  },[])

  const value=useMemo(()=>({
    enabled:AUTH_ENABLED,
    configured:SUPABASE_CONFIGURED,
    loading,
    session,
    user:session?.user || null,
    async signIn(email,password){
      if(!supabase) return {error:new Error('Supabase não configurado.')}
      return supabase.auth.signInWithPassword({email,password})
    },
    async signUp(nome,email,password){
      if(!supabase) return {error:new Error('Supabase não configurado.')}
      const emailRedirectTo=typeof window!=='undefined'?window.location.origin:undefined
      return supabase.auth.signUp({
        email,
        password,
        options:{
          data:{nome},
          emailRedirectTo
        }
      })
    },
    async signOut(){
      if(!supabase) return
      await supabase.auth.signOut()
    },
    async resetPassword(email){
      if(!supabase) return {error:new Error('Supabase não configurado.')}
      const redirectTo=typeof window!=='undefined'?window.location.origin:undefined
      return supabase.auth.resetPasswordForEmail(email,{redirectTo})
    }
  }),[loading,session])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(){
  const value=useContext(AuthContext)
  if(!value) throw new Error('useAuth deve ser usado dentro de AuthProvider.')
  return value
}
