import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        // Use implicit flow so magic link tokens arrive as URL hash fragments.
        // This avoids the PKCE verifier problem where the email link opens
        // in a different browser context (email app) than where login was initiated.
        flowType: 'implicit',
        detectSessionInUrl: true,
      },
    }
  )
}
