import { createClient } from '@supabase/supabase-js'

const configuredUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseUrl = !configuredUrl || configuredUrl.includes('comerciolleno.supabase.co')
  ? 'https://wtcntclzcubkbtcsqkzc.supabase.co'
  : configuredUrl

export const supabase = createClient(
  supabaseUrl,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_02U2KDLDTR42KxdcFHtfYw_IDM00Deb'
)
