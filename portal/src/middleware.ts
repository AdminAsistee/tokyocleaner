import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/** Map role → home path */
function homeForRole(role?: string): string {
  switch (role) {
    case 'admin': return '/admin'
    case 'staff': return '/staff'
    default:      return '/client'
  }
}

export async function middleware(request: NextRequest) {
  // Skip auth callback routes entirely — let the client-side page handle them
  if (request.nextUrl.pathname.startsWith('/auth/')) {
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const role = user?.app_metadata?.role as string | undefined
  const path = request.nextUrl.pathname

  // ──────────────────────────────────────────────
  // 1. Unauthenticated — protect all portals
  // ──────────────────────────────────────────────
  if (!user) {
    if (path.startsWith('/client') || path.startsWith('/admin') || path.startsWith('/staff')) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
    return supabaseResponse
  }

  // ──────────────────────────────────────────────
  // 2. Authenticated — redirect /login to home
  // ──────────────────────────────────────────────
  if (path === '/login') {
    const url = request.nextUrl.clone()
    url.pathname = homeForRole(role)
    return NextResponse.redirect(url)
  }

  // ──────────────────────────────────────────────
  // 3. Role-based access control
  // ──────────────────────────────────────────────
  // Admin can access /admin only
  if (path.startsWith('/admin') && role !== 'admin') {
    const url = request.nextUrl.clone()
    url.pathname = homeForRole(role)
    return NextResponse.redirect(url)
  }

  // Staff can access /staff only
  if (path.startsWith('/staff') && role !== 'staff') {
    const url = request.nextUrl.clone()
    url.pathname = homeForRole(role)
    return NextResponse.redirect(url)
  }

  // Client portal — only clients
  if (path.startsWith('/client') && role !== 'client') {
    const url = request.nextUrl.clone()
    url.pathname = homeForRole(role)
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|auth/callback|api/.*|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
