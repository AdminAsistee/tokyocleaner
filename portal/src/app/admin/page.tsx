'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AdminPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user || user.app_metadata?.role !== 'admin') {
        router.replace('/login')
        return
      }
      setEmail(user.email || '')
      setLoading(false)
    })
  }, [router])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) return null

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F9FAFB',
      fontFamily: "'Inter', 'Noto Sans JP', sans-serif",
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '48px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        border: '1px solid #E5E7EB',
        textAlign: 'center',
        maxWidth: '480px',
      }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '16px',
          background: 'linear-gradient(135deg, #0EA5A0, #0B8A86)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px', fontSize: '28px',
        }}>🛡️</div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
          Admin Dashboard
        </h1>
        <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '24px' }}>
          Welcome, {email}. This page is under construction.
        </p>
        <div style={{
          padding: '12px 16px', background: '#F0FDFC', borderRadius: '10px',
          border: '1px solid rgba(14,165,160,0.2)', fontSize: '13px', color: '#0B8A86',
          marginBottom: '24px',
        }}>
          Role: <strong>admin</strong>
        </div>
        <button onClick={handleSignOut} style={{
          padding: '10px 24px', borderRadius: '8px', border: '1px solid #FECACA',
          background: '#FEF2F2', color: '#DC2626', fontSize: '13px', fontWeight: 600,
          cursor: 'pointer', transition: 'all 0.2s',
        }}>
          Sign Out
        </button>
      </div>
    </div>
  )
}
