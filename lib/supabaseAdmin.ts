import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log(`🔧 [SupabaseAdmin] Using Supabase URL: ${supabaseUrl}`)
console.log(
  `🔧 [SupabaseAdmin] Service role key ${supabaseServiceRoleKey ? 'SET' : 'NOT SET'}`,
)

let supabaseAdmin: SupabaseClient

if (supabaseUrl && supabaseServiceRoleKey) {
  try {
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${supabaseServiceRoleKey}`,
          apikey: supabaseServiceRoleKey,
        },
      },
    })
  } catch (e: any) {
    // Handle the error appropriately, maybe rethrow or set supabaseAdmin to a state that indicates failure
  }
} else {
  // Handle missing config
}

export { supabaseAdmin }
