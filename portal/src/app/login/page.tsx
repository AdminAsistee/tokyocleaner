'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Mail, Lock, Sparkles, Globe, UserPlus } from 'lucide-react'
import { useLang } from '@/hooks/useLang'

type Mode = 'magic' | 'password' | 'signup'

/** Map role → home path */
function homeForRole(role?: string): string {
  switch (role) {
    case 'admin': return '/admin'
    case 'staff': return '/staff'
    default:      return '/client'
  }
}

const i18n = {
  en: {
    welcome: 'Welcome Back',
    subtitle: 'Sign in to your TokyoCleaner portal',
    emailLabel: 'Email Address',
    emailPlaceholder: 'your@email.com',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Enter your password',
    sendLink: 'Send Magic Link',
    signInPassword: 'Sign In',
    signUp: 'Sign Up',
    sending: 'Sending...',
    signingIn: 'Signing in...',
    creatingAccount: 'Creating account...',
    successTitle: 'Check your inbox!',
    successMsg: (email: string) => `We sent a secure sign-in link to ${email}. Click it to access your portal.`,
    signupSuccess: 'Account created! Check your email for login credentials.',
    spam: "Check your spam folder if you don't see it within 2 minutes.",
    poweredBy: 'Secure login powered by',
    tagline: 'Premium Cleaning Management',
    useMagicLink: 'Use Magic Link instead',
    usePassword: 'Use Password instead',
    noAccount: "Don't have an account?",
    haveAccount: 'Already have an account?',
    backToLogin: 'Back to Login',
  },
  jp: {
    welcome: 'おかえりなさい',
    subtitle: 'TokyoCleanerポータルにサインイン',
    emailLabel: 'メールアドレス',
    emailPlaceholder: 'your@email.com',
    passwordLabel: 'パスワード',
    passwordPlaceholder: 'パスワードを入力',
    sendLink: 'マジックリンクを送信',
    signInPassword: 'サインイン',
    signUp: 'アカウント作成',
    sending: '送信中...',
    signingIn: 'サインイン中...',
    creatingAccount: '作成中...',
    successTitle: 'メールをご確認ください！',
    successMsg: (email: string) => `${email} にサインインリンクを送信しました。`,
    signupSuccess: 'アカウントが作成されました！メールでログイン情報をご確認ください。',
    spam: '2分以内に届かない場合は迷惑メールフォルダをご確認ください。',
    poweredBy: 'セキュアログイン提供:',
    tagline: 'プレミアムクリーニング管理',
    useMagicLink: 'マジックリンクでログイン',
    usePassword: 'パスワードでログイン',
    noAccount: 'アカウントをお持ちでないですか？',
    haveAccount: 'すでにアカウントをお持ちですか？',
    backToLogin: 'ログインに戻る',
  },
}

export default function LoginPage() {
  const [lang, setLang] = useLang()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<Mode>('password')
  const [sent, setSent] = useState(false)
  const [signedUp, setSignedUp] = useState(false)
  const [error, setError] = useState('')
  const t = i18n[lang]

  // Magic link
  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) setError(data.error || 'Failed to send magic link')
      else setSent(true)
    } catch {
      setError('Network error')
    }
    setLoading(false)
  }

  // Password login
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      // Redirect based on role
      const role = data.user?.app_metadata?.role
      window.location.href = homeForRole(role)
    }
  }

  // Sign up
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Sign up failed')
      } else {
        setSignedUp(true)
      }
    } catch {
      setError('Network error')
    }
    setLoading(false)
  }

  const handleSubmit = mode === 'magic' ? handleMagicLink : mode === 'signup' ? handleSignUp : handlePasswordLogin

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
            {mode === 'signup' ? t.signUp : t.welcome}
          </h2>
          <p style={{ color: '#64748B', margin: '0 0 32px', fontSize: '0.95rem' }}>
            {t.subtitle}
          </p>

          {/* Success states */}
          {sent ? (
            <div style={{ background: '#DCFCE7', border: '1px solid #BBF7D0', borderRadius: '14px', padding: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '12px' }}>📬</div>
              <h3 style={{ color: '#15803D', fontSize: '1.1rem', fontWeight: 700, margin: '0 0 8px' }}>{t.successTitle}</h3>
              <p style={{ color: '#166534', fontSize: '0.9rem', margin: '0 0 10px', lineHeight: 1.6 }}>{t.successMsg(email)}</p>
              <p style={{ color: '#16A34A', fontSize: '0.78rem', margin: 0 }}>{t.spam}</p>
            </div>
          ) : signedUp ? (
            <div style={{ background: '#DCFCE7', border: '1px solid #BBF7D0', borderRadius: '14px', padding: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '12px' }}>✅</div>
              <h3 style={{ color: '#15803D', fontSize: '1.1rem', fontWeight: 700, margin: '0 0 8px' }}>{t.successTitle}</h3>
              <p style={{ color: '#166534', fontSize: '0.9rem', margin: '0 0 10px', lineHeight: 1.6 }}>{t.signupSuccess}</p>
              <button onClick={() => { setSignedUp(false); setMode('password') }}
                style={{ marginTop: '12px', padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#0EA5A0', color: 'white', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                {t.backToLogin}
              </button>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit}>
                {/* Email */}
                <div style={{ marginBottom: '16px' }}>
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

                {/* Password field — shown in password & signup mode is hidden */}
                {mode === 'password' && (
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '0.83rem', fontWeight: 600, color: '#374151', marginBottom: '7px' }}>
                      {t.passwordLabel}
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                      <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder={t.passwordPlaceholder}
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
                )}

                {error && (
                  <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: '10px', padding: '12px 14px', marginBottom: '16px', fontSize: '0.85rem', color: '#DC2626' }}>
                    {error}
                  </div>
                )}

                {/* Submit button */}
                <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
                  {mode === 'magic' && <Mail size={16} />}
                  {mode === 'password' && <Lock size={16} />}
                  {mode === 'signup' && <UserPlus size={16} />}
                  {loading
                    ? (mode === 'signup' ? t.creatingAccount : mode === 'magic' ? t.sending : t.signingIn)
                    : (mode === 'signup' ? t.signUp : mode === 'magic' ? t.sendLink : t.signInPassword)
                  }
                </button>
              </form>

              {/* Mode switchers */}
              <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.85rem' }}>
                {mode === 'password' && (
                  <button onClick={() => { setMode('magic'); setError('') }}
                    style={{ background: 'none', border: 'none', color: '#14B8A6', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                    {t.useMagicLink}
                  </button>
                )}
                {mode === 'magic' && (
                  <button onClick={() => { setMode('password'); setError('') }}
                    style={{ background: 'none', border: 'none', color: '#14B8A6', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                    {t.usePassword}
                  </button>
                )}
              </div>

              {mode !== 'signup' && (
                <div style={{ marginTop: '12px', textAlign: 'center', fontSize: '0.83rem', color: '#64748B' }}>
                  {t.noAccount}{' '}
                  <button onClick={() => { setMode('signup'); setError('') }}
                    style={{ background: 'none', border: 'none', color: '#14B8A6', cursor: 'pointer', fontWeight: 600, fontSize: '0.83rem' }}>
                    {t.signUp}
                  </button>
                </div>
              )}

              {mode === 'signup' && (
                <div style={{ marginTop: '12px', textAlign: 'center', fontSize: '0.83rem', color: '#64748B' }}>
                  {t.haveAccount}{' '}
                  <button onClick={() => { setMode('password'); setError('') }}
                    style={{ background: 'none', border: 'none', color: '#14B8A6', cursor: 'pointer', fontWeight: 600, fontSize: '0.83rem' }}>
                    {t.backToLogin}
                  </button>
                </div>
              )}
            </>
          )}

          <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '0.78rem', color: '#94A3B8' }}>
            {t.poweredBy} <a href="https://supabase.com" style={{ color: '#14B8A6', fontWeight: 600 }}>Supabase Auth</a>
          </div>
        </div>
      </div>
    </div>
  )
}
