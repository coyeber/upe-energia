import { createClient } from '@supabase/supabase-js'

export const AUTH_ENABLED = String(import.meta.env.VITE_AUTH_ENABLED || '').toLowerCase() === 'true'
export const CLERK_PUBLISHABLE_KEY = String(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '').trim()
export const CLERK_CONFIGURED = Boolean(CLERK_PUBLISHABLE_KEY)

export const SUPABASE_URL = String(import.meta.env.VITE_SUPABASE_URL || '').trim()
export const SUPABASE_PUBLISHABLE_KEY = String(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim()
export const SUPABASE_CONFIGURED = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY)

export function createClerkSupabaseClient(session){
  if(!SUPABASE_CONFIGURED) return null

  return createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{
    accessToken:async()=>session?.getToken?.() ?? null
  })
}

export const supabase = SUPABASE_CONFIGURED
  ? createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY)
  : null
