import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile
} from 'firebase/auth'
import { firebaseAuth, firebaseConfigured } from '../lib/firebase'

const AuthContext=createContext(null)

export function AuthProvider({children}){
  const [loading,setLoading]=useState(true)
  const [firebaseUser,setFirebaseUser]=useState(null)
  const [authError,setAuthError]=useState(null)

  useEffect(()=>{
    const timeout=setTimeout(()=>{
      setLoading(false)
      setAuthError('FIREBASE_LOAD_TIMEOUT')
    },8000)

    const unsubscribe=onAuthStateChanged(firebaseAuth,user=>{
      clearTimeout(timeout)
      setFirebaseUser(user)
      setAuthError(null)
      setLoading(false)
    },error=>{
      console.error('Erro ao inicializar Firebase Auth:',error)
      clearTimeout(timeout)
      setAuthError(error?.code||'FIREBASE_AUTH_ERROR')
      setLoading(false)
    })

    return()=>{
      clearTimeout(timeout)
      unsubscribe()
    }
  },[])

  const user=useMemo(()=>{
    if(!firebaseUser)return null
    return {
      id:firebaseUser.uid,
      email:firebaseUser.email||'',
      name:firebaseUser.displayName||'',
      emailVerified:Boolean(firebaseUser.emailVerified),
      imageUrl:firebaseUser.photoURL||''
    }
  },[firebaseUser])

  const value=useMemo(()=>({
    enabled:true,
    configured:firebaseConfigured,
    loading,
    authError,
    session:firebaseUser?{id:firebaseUser.uid}:null,
    user,
    async signIn(email,password){
      try{
        const result=await signInWithEmailAndPassword(firebaseAuth,email,password)
        return {data:result,error:null}
      }catch(error){
        return {data:null,error}
      }
    },
    async signUp(nome,email,password){
      try{
        const result=await createUserWithEmailAndPassword(firebaseAuth,email,password)
        if(nome?.trim())await updateProfile(result.user,{displayName:nome.trim()})
        await result.user.reload()
        setFirebaseUser(firebaseAuth.currentUser)
        return {data:result,error:null}
      }catch(error){
        return {data:null,error}
      }
    },
    async resetPassword(email){
      try{
        await sendPasswordResetEmail(firebaseAuth,email)
        return {error:null}
      }catch(error){
        return {error}
      }
    },
    async signOut(){
      await firebaseSignOut(firebaseAuth)
    }
  }),[loading,authError,firebaseUser,user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(){
  const value=useContext(AuthContext)
  if(!value)throw new Error('useAuth deve ser usado dentro de AuthProvider.')
  return value
}
