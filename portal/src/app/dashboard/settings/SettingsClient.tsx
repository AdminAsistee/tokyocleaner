'use client'

import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Sidebar from '@/components/Sidebar'
import { useLang } from '@/hooks/useLang'
import { UserIcon, Mail, Phone, Shield, Save, Loader2, CheckCircle2 } from 'lucide-react'

const i18n = {
  en: {
    settingsTitle: 'Account Settings',
    settingsSub: 'Manage your profile and preferences',
    personalInfo: 'Personal Information',
    fullName: 'Full Name',
    email: 'Email Address',
    phone: 'Phone Number',
    readonlyEmail: 'Your email is used for secure login and cannot be changed here.',
    securityInfo: 'Security',
    securityDesc: 'You are signed in with a secure magic link. No password is required.',
    saveChanges: 'Save Changes',
    saving: 'Saving...',
    saved: 'Saved successfully',
  },
  jp: {
    settingsTitle: 'アカウント設定',
    settingsSub: 'プロフィールと設定を管理します',
    personalInfo: '個人情報',
    fullName: '氏名',
    email: 'メールアドレス',
    phone: '電話番号',
    readonlyEmail: 'このメールアドレスは安全なログインに使用されるため、ここでは変更できません。',
    securityInfo: 'セキュリティ',
    securityDesc: '安全なマジックリンクを使用してサインインしています。パスワードは不要です。',
    saveChanges: '変更を保存',
    saving: '保存中...',
    saved: '保存しました',
  }
}

export default function SettingsClient({ user }: { user: User }) {
  const [lang, setLang] = useLang()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const t = i18n[lang]

  // Extract from user_metadata (which comes from Supabase)
  const [fullName, setFullName] = useState(user.user_metadata?.full_name || '')
  const [phone, setPhone] = useState(user.user_metadata?.phone || '')

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    const supabase = createClient()
    
    // Update user metadata in Supabase
    await supabase.auth.updateUser({
      data: { full_name: fullName, phone: phone }
    })
    
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    router.refresh()
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F9FAFB', fontFamily: "'Inter', 'Noto Sans JP', sans-serif" }}>
      <Sidebar lang={lang} onLangToggle={() => setLang(lang === 'en' ? 'jp' : 'en')} activeNav="settings" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="tc-main">
        {/* Top bar */}
        <header style={{
          height: '64px', background: 'white', borderBottom: '1px solid #F3F4F6',
          display: 'flex', alignItems: 'center', padding: '0 24px',
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <button className="tc-hamburger" onClick={() => setSidebarOpen(true)}>☰</button>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%', background: '#0EA5A0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 600, fontSize: '14px', textTransform: 'uppercase'
            }}>
              {(user.user_metadata?.full_name || user.email || 'A').charAt(0)}
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="tc-page-content" style={{ flex: 1, padding: '28px 32px 120px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>

          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', letterSpacing: '-0.5px', marginBottom: '6px' }}>
              {t.settingsTitle}
            </h1>
            <p style={{ fontSize: '14px', color: '#6B7280' }}>{t.settingsSub}</p>
          </div>

          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '24px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserIcon size={18} color="#0B8A86" />
              {t.personalInfo}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#4B5563', marginBottom: '6px' }}>
                  {t.fullName}
                </label>
                <div style={{ position: 'relative' }}>
                  <UserIcon size={16} color="#9CA3AF" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                    style={{
                      width: '100%', padding: '10px 12px 10px 36px', borderRadius: '8px',
                      border: '1px solid #D1D5DB', fontSize: '14px', outline: 'none'
                    }} 
                    onFocus={(e) => e.target.style.borderColor = '#0EA5A0'}
                    onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#4B5563', marginBottom: '6px' }}>
                  {t.phone}
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} color="#9CA3AF" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                    placeholder="+81 90-1234-5678"
                    style={{
                      width: '100%', padding: '10px 12px 10px 36px', borderRadius: '8px',
                      border: '1px solid #D1D5DB', fontSize: '14px', outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#0EA5A0'}
                    onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#4B5563', marginBottom: '6px' }}>
                  {t.email}
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="#9CA3AF" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input type="email" value={user.email} disabled
                    style={{
                      width: '100%', padding: '10px 12px 10px 36px', borderRadius: '8px',
                      border: '1px solid #E5E7EB', fontSize: '14px', background: '#F3F4F6', color: '#6B7280', cursor: 'not-allowed'
                    }} />
                </div>
                <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '6px' }}>{t.readonlyEmail}</p>
              </div>
            </div>
            
            <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '16px' }}>
              {saved && <span style={{ color: '#059669', fontSize: '13px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={16} /> {t.saved}
              </span>}
              <button 
                onClick={handleSave} 
                disabled={saving}
                style={{
                  background: '#0EA5A0', color: 'white', border: 'none', borderRadius: '8px',
                  padding: '10px 24px', fontSize: '14px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: '8px', opacity: saving ? 0.7 : 1
                }}
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {saving ? t.saving : t.saveChanges}
              </button>
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={18} color="#0B8A86" />
              {t.securityInfo}
            </h2>
            <div style={{ background: '#F0FDFC', border: '1px solid #CCFBF1', borderRadius: '8px', padding: '16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
               <Shield size={20} color="#0EA5A0" style={{ flexShrink: 0, marginTop: '2px' }} />
               <p style={{ fontSize: '13px', color: '#111827', lineHeight: 1.5, margin: 0 }}>
                 {t.securityDesc}
               </p>
            </div>
          </div>

        </div>
      </div>
      
      <style>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
