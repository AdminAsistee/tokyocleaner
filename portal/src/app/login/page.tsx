'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Mail, Sparkles, Globe } from 'lucide-react'
import { useLang } from '@/hooks/useLang'

const i18n = {
  en: {
    welcome: 'Welcome Back',
    subtitle: 'Enter your email to receive a secure sign-in link',
    emailLabel: 'Email Address',
    emailPlaceholder: 'your@email.com',
    sendLink: 'Send Magic Link',
    sending: 'Sending...',
    successTitle: 'Check your inbox!',
    successMsg: (email: string) => `We sent a secure sign-in link to ${email}. Click it to access your portal.`,
    spam: "Check your spam folder if you don't see it within 2 minutes.",
    poweredBy: 'Secure login powered by',
    tagline: 'Premium Cleaning Management',
  },
  jp: {
    welcome: 'おかえりなさい',
    subtitle: 'メールアドレスを入力してサインインリンクを受け取ってください',
    emailLabel: 'メールアドレス',
    emailPlaceholder: 'your@email.com',
    sendLink: 'マジックリンクを送信',
    sending: '送信中...',
    successTitle: 'メールをご確認ください！',
    successMsg: (email: string) => `${email} にサインインリンクを送信しました。`,
    spam: '2分以内に届かない場合は迷惑メールフォルダをご確認ください。',
    poweredBy: 'セキュアログイン提供:',
    tagline: 'プレミアムクリーニング管理',
  },
}

export default function LoginPage() {
  const [lang, setLang] = useLang()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const t = i18n[lang]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    })
    if (error) setError(error.message)
    else setSent(true)
    setLoading(false)
  }

  return (
    <div className="login-layout" style={{
      minHeight: '100vh',
      display: 'flex',
      background: '#F0F2F5',
    }}>
      {/* Left Panel — Brand */}
      <div className="login-brand" style={{
        flex: '0 0 45%',
        background: 'linear-gradient(135deg, #0D9488 0%, #14B8A6 50%, #2DD4BF 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '300px', height: '300px', background: 'rgba(255,255,255,0.07)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '240px', height: '240px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />

        <div style={{ position: 'relative', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '72px', height: '72px', borderRadius: '20px',
            background: 'rgba(255,255,255,0.2)', marginBottom: '24px',
            backdropFilter: 'blur(10px)',
          }}>
            <Sparkles size={32} color="white" />
          </div>
          <h1 style={{ color: 'white', fontSize: '2.2rem', fontWeight: 700, margin: '0 0 8px' }}>
            TokyoCleaner
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem', margin: '0 0 40px' }}>
            {t.tagline}
          </p>

          {/* Feature list */}
          <div className="login-features">
            {['View your cleaning history', 'Track upcoming schedules', 'See after-service photos'].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.7rem' }}>✓</div>
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Login form */}
      <div className="login-form-panel" style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px',
        position: 'relative',
      }}>
        {/* Lang toggle */}
        <div style={{ position: 'absolute', top: '24px', right: '24px' }}>
          <button onClick={() => setLang(lang === 'en' ? 'jp' : 'en')} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'white', border: '1px solid #E2E8F0',
            borderRadius: '999px', padding: '7px 14px', cursor: 'pointer',
            color: '#64748B', fontSize: '0.82rem', fontWeight: 500,
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}>
            <Globe size={14} />
            {lang === 'en' ? '日本語' : 'English'}
          </button>
        </div>

        <div style={{ width: '100%', maxWidth: '400px' }}>
          <h2 style={{ fontSize: '1.7rem', fontWeight: 700, color: '#1E293B', margin: '0 0 8px' }}>
            {t.welcome}
          </h2>
          <p style={{ color: '#64748B', margin: '0 0 32px', fontSize: '0.95rem' }}>
            {t.subtitle}
          </p>

          {!sent ? (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.83rem', fontWeight: 600, color: '#374151', marginBottom: '7px' }}>
                  {t.emailLabel}
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder={t.emailPlaceholder}
                    required
                    style={{
                      width: '100%', padding: '13px 14px 13px 42px',
                      background: 'white', border: '1px solid #E2E8F0',
                      borderRadius: '10px', color: '#1E293B', fontSize: '0.95rem',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.04)', transition: 'border-color 0.2s',
                    }}
                  />
                </div>
              </div>
              {error && (
                <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: '10px', padding: '12px 14px', marginBottom: '16px', fontSize: '0.85rem', color: '#DC2626' }}>
                  {error}
                </div>
              )}
              <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
                <Mail size={16} />
                {loading ? t.sending : t.sendLink}
              </button>
            </form>
          ) : (
            <div style={{ background: '#DCFCE7', border: '1px solid #BBF7D0', borderRadius: '14px', padding: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '12px' }}>📬</div>
              <h3 style={{ color: '#15803D', fontSize: '1.1rem', fontWeight: 700, margin: '0 0 8px' }}>{t.successTitle}</h3>
              <p style={{ color: '#166534', fontSize: '0.9rem', margin: '0 0 10px', lineHeight: 1.6 }}>{t.successMsg(email)}</p>
              <p style={{ color: '#16A34A', fontSize: '0.78rem', margin: 0 }}>{t.spam}</p>
            </div>
          )}

          <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '0.78rem', color: '#94A3B8' }}>
            {t.poweredBy} <a href="https://supabase.com" style={{ color: '#14B8A6', fontWeight: 600 }}>Supabase Auth</a>
          </div>
        </div>
      </div>
    </div>
  )
}
