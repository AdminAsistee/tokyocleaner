import { createClient } from '@supabase/supabase-js'

/**
 * Server-side Supabase client with SERVICE_ROLE_KEY.
 * Use ONLY in API routes / server components — never expose on the client.
 * This client bypasses RLS and can manage auth users.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY or SUPABASE_URL env vars')
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
