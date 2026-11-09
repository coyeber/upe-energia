import { createClient } from '@supabase/supabase-js'

export const SUPABASE_URL=String(import.meta.env.VITE_SUPABASE_URL||'').trim()
export const SUPABASE_PUBLISHABLE_KEY=String(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY||import.meta.env.VITE_SUPABASE_ANON_KEY||'').trim()
export const SUPABASE_CONFIGURED=Boolean(SUPABASE_URL&&SUPABASE_PUBLISHABLE_KEY)

export const supabase=SUPABASE_CONFIGURED
  ? createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY)
  : null
