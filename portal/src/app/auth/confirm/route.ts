import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /auth/confirm?token_hash=...&type=magiclink
 *
 * Server-side OTP verification — handles magic link tokens from
 * admin.generateLink(). Verifies the token, establishes the session
 * cookie, and redirects to the correct portal based on role.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as 'magiclink' | 'email' | 'signup' | 'recovery' | 'invite'

  const redirectUrl = request.nextUrl.clone()
  redirectUrl.pathname = '/login'
  redirectUrl.searchParams.delete('token_hash')
  redirectUrl.searchParams.delete('type')

  if (!token_hash || !type) {
    redirectUrl.searchParams.set('error', 'Missing token')
    return NextResponse.redirect(redirectUrl)
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.verifyOtp({ token_hash, type })

  if (error) {
    redirectUrl.searchParams.set('error', error.message)
    return NextResponse.redirect(redirectUrl)
  }

  // Get user after verification to determine role
  const { data: { user } } = await supabase.auth.getUser()
  const role = user?.app_metadata?.role as string | undefined

  // Redirect to correct portal
  switch (role) {
    case 'admin':
      redirectUrl.pathname = '/admin'
      break
    case 'staff':
      redirectUrl.pathname = '/staff'
      break
    default:
      redirectUrl.pathname = '/client'
  }
  redirectUrl.search = ''

  return NextResponse.redirect(redirectUrl)
}
