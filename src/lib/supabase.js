import { createClient } from '@supabase/supabase-js'
import { firebaseAuth } from './firebase'

// URL e chave publishable são públicas. Nenhuma service_role é exposta ao navegador.
export const SUPABASE_URL=String(import.meta.env.VITE_SUPABASE_URL||'https://nzplaxmbcgestdsctqwb.supabase.co').trim()
export const SUPABASE_PUBLISHABLE_KEY=String(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY||import.meta.env.VITE_SUPABASE_ANON_KEY||'sb_publishable_BqTNdl-JlC_h6XMf1NGdyw_eoRicBd0').trim()
export const SUPABASE_CONFIGURED=Boolean(SUPABASE_URL&&SUPABASE_PUBLISHABLE_KEY)

export const supabase=SUPABASE_CONFIGURED
 ? createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{
     auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false},
     accessToken:async()=>firebaseAuth.currentUser
       ? await firebaseAuth.currentUser.getIdToken(false)
       : null
   })
 : null
