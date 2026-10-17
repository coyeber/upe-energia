import { createClient } from '@supabase/supabase-js'

export const AUTH_ENABLED = String(import.meta.env.VITE_AUTH_ENABLED || '').toLowerCase() === 'true'
export const SUPABASE_URL = String(import.meta.env.VITE_SUPABASE_URL || '').trim()
export const SUPABASE_ANON_KEY = String(import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim()
export const SUPABASE_CONFIGURED = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)

export const supabase = SUPABASE_CONFIGURED
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null
