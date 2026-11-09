import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth as useClerkAuth, useClerk, useSession, useUser } from '@clerk/react'
import { AUTH_ENABLED, CLERK_CONFIGURED, SUPABASE_CONFIGURED, createClerkSupabaseClient } from '../lib/supabase'

const AuthContext=createContext(null)

export function AuthProvider({children}){
  if(!CLERK_CONFIGURED){
    const value={
      enabled:AUTH_ENABLED,
      configured:false,
      loading:false,
      authError:null,
      session:null,
      user:null,
      signOut:async()=>{}
    }
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  }

  return <ClerkAuthBridge>{children}</ClerkAuthBridge>
}

function ClerkAuthBridge({children}){
  const {isLoaded,isSignedIn,sessionId}=useClerkAuth()
  const {user}=useUser()
  const {session}=useSession()
  const clerk=useClerk()
  const [loadTimedOut,setLoadTimedOut]=useState(false)

  useEffect(()=>{
    if(isLoaded){
      setLoadTimedOut(false)
      return
    }
    const timer=setTimeout(()=>{
      console.error('Clerk não concluiu a inicialização em 8 segundos. Verifique Publishable Key, conexão e configuração da instância.')
      setLoadTimedOut(true)
    },8000)
    return()=>clearTimeout(timer)
  },[isLoaded])

  useEffect(()=>{
    if(!isLoaded || !isSignedIn || !session || !user || !SUPABASE_CONFIGURED) return

    const client=createClerkSupabaseClient(session)
    if(!client) return

    const email=user.primaryEmailAddress?.emailAddress || ''
    const nome=user.fullName || user.firstName || email.split('@')[0] || 'Usuário'

    client
      .from('clerk_profiles')
      .upsert({user_id:user.id,nome},{onConflict:'user_id'})
      .then(({error})=>{
        if(error) console.warn('Perfil Clerk ainda não sincronizado com Supabase:',error.message)
      })
  },[isLoaded,isSignedIn,session,user])

  const appUser=useMemo(()=>{
    if(!user) return null
    return {
      id:user.id,
      email:user.primaryEmailAddress?.emailAddress || '',
      name:user.fullName || user.firstName || '',
      imageUrl:user.imageUrl
    }
  },[user])

  const value=useMemo(()=>({
    enabled:AUTH_ENABLED,
    configured:CLERK_CONFIGURED,
    loading:!isLoaded&&!loadTimedOut,
    authError:loadTimedOut?'CLERK_LOAD_TIMEOUT':null,
    session:isSignedIn?{id:sessionId}:null,
    user:appUser,
    async signOut(){
      await clerk.signOut()
    }
  }),[isLoaded,isSignedIn,sessionId,appUser,clerk,loadTimedOut])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(){
  const value=useContext(AuthContext)
  if(!value) throw new Error('useAuth deve ser usado dentro de AuthProvider.')
  return value
}
