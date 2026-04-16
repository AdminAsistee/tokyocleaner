'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [status, setStatus] = useState('Signing you in...')

  useEffect(() => {
    const supabase = createClient()
    let redirected = false

    const goToDashboard = () => {
      if (!redirected) {
        redirected = true
        router.replace('/dashboard')
      }
    }

    // 1. Listen for auth state change — fires when Supabase
    //    detects tokens in the URL hash (implicit flow) or sets a session
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
        goToDashboard()
      }
    })

    // 2. Also handle token_hash in search params (Supabase OTP-style link)
    const handleParams = async () => {
      const params = new URLSearchParams(window.location.search)
      const token_hash = params.get('token_hash')
      const type = params.get('type') as 'magiclink' | 'email' | null
      const code = params.get('code')

      if (token_hash && type) {
        const { error } = await supabase.auth.verifyOtp({ token_hash, type })
        if (!error) { goToDashboard(); return }
        setStatus('Verification failed: ' + error.message)
        setTimeout(() => router.replace('/login?error=' + encodeURIComponent(error.message)), 2500)
        return
      }

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) { goToDashboard(); return }
        setStatus('Code exchange failed: ' + error.message)
        setTimeout(() => router.replace('/login?error=' + encodeURIComponent(error.message)), 2500)
        return
      }

      // 3. Check if a session already exists (user re-visits this page logged in)
      const { data: { session } } = await supabase.auth.getSession()
      if (session) { goToDashboard(); return }

      // 4. Give the hash-based implicit flow a moment to fire onAuthStateChange
      //    If nothing happens in 6s, something went wrong
      setTimeout(() => {
        if (!redirected) {
          setStatus('Sign-in timed out. Please try again.')
          setTimeout(() => router.replace('/login'), 2000)
        }
      }, 6000)
    }

    handleParams()

    return () => subscription.unsubscribe()
  }, [router])

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', background: '#F0F2F5',
      fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{
        width: '48px', height: '48px',
        border: '3px solid #0EA5A0', borderTopColor: 'transparent',
        borderRadius: '50%', animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ color: '#6B7280', fontSize: '0.95rem', marginTop: '16px' }}>{status}</p>
    </div>
  )
}
