'use client'

import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Sidebar from '@/components/Sidebar'
import { useLang } from '@/hooks/useLang'
import { UserIcon, Mail, Phone, Shield, Save, Loader2, CheckCircle2, Lock, Eye, EyeOff, MapPin, Building2, Hash } from 'lucide-react'

type ClientRecord = {
  id: number
  name: string
  address: string | null
  building_name: string | null
  room_number: string | null
  phone_number: string | null
  invoice_method: string | null
  invoice_type: string | null
  is_active: boolean
  created_at: string
  auth_user_id: string | null
} | null

const i18n = {
  en: {
    settingsTitle: 'Account Settings',
    settingsSub: 'Manage your profile and preferences',
    personalInfo: 'Personal Information',
    fullName: 'Full Name',
    email: 'Email Address',
    phone: 'Phone Number',
    address: 'Address',
    addressPlaceholder: 'e.g. 1-2-3 Shibuya, Shibuya-ku, Tokyo',
    buildingName: 'Building Name (Optional)',
    buildingPlaceholder: 'e.g. Sunshine Mansion',
    roomNumber: 'Room Number (Optional)',
    roomPlaceholder: 'e.g. 301',
    readonlyEmail: 'Your email is used for secure login and cannot be changed here.',
    securityInfo: 'Security',
    newPassword: 'New Password',
    confirmPassword: 'Confirm Password',
    changePassword: 'Change Password',
    changingPassword: 'Changing...',
    passwordChanged: 'Password updated successfully',
    passwordMismatch: 'Passwords do not match',
    passwordTooShort: 'Password must be at least 6 characters',
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
    address: '住所',
    addressPlaceholder: '例: 東京都渋谷区渋谷1-2-3',
    buildingName: '建物名（任意）',
    buildingPlaceholder: '例: サンシャインマンション',
    roomNumber: '部屋番号（任意）',
    roomPlaceholder: '例: 301',
    readonlyEmail: 'このメールアドレスは安全なログインに使用されるため、ここでは変更できません。',
    securityInfo: 'セキュリティ',
    newPassword: '新しいパスワード',
    confirmPassword: 'パスワード確認',
    changePassword: 'パスワードを変更',
    changingPassword: '変更中...',
    passwordChanged: 'パスワードが更新されました',
    passwordMismatch: 'パスワードが一致しません',
    passwordTooShort: 'パスワードは6文字以上にしてください',
    saveChanges: '変更を保存',
    saving: '保存中...',
    saved: '保存しました',
  }
}

const inputStyle = {
  width: '100%', padding: '10px 12px 10px 36px', borderRadius: '8px',
  border: '1px solid #D1D5DB', fontSize: '14px', outline: 'none'
}

const labelStyle = {
  display: 'block' as const, fontSize: '13px', fontWeight: 500, color: '#4B5563', marginBottom: '6px'
}

export default function SettingsClient({ user, clientRecord }: { user: User; clientRecord: ClientRecord }) {
  const [lang, setLang] = useLang()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const t = i18n[lang]

  // Profile fields
  const [fullName, setFullName] = useState(clientRecord?.name || '')
  const [phone, setPhone] = useState(clientRecord?.phone_number || '')
  const [address, setAddress] = useState(clientRecord?.address || '')
  const [buildingName, setBuildingName] = useState(clientRecord?.building_name || '')
  const [roomNumber, setRoomNumber] = useState(clientRecord?.room_number || '')

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')

  // Password state
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPw, setShowNewPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)
  const [pwSaving, setPwSaving] = useState(false)
  const [pwSuccess, setPwSuccess] = useState(false)
  const [pwError, setPwError] = useState('')

  const handleSave = async () => {
    setSaveError('')
    // Validate phone: if provided, must have exactly 11 digits
    if (phone) {
      const digitsOnly = phone.replace(/\D/g, '')
      if (digitsOnly.length !== 12) {
        setSaveError(lang === 'en' ? 'Phone number must be 12 digits (e.g. +81 90-1234-5678)' : '電話番号は12桁である必要があります')
        return
      }
    }

    setSaving(true)
    setSaved(false)
    const supabase = createClient()

    // Update user_metadata
    await supabase.auth.updateUser({
      data: { full_name: fullName }
    })

    // Update clients table
    if (clientRecord) {
      await supabase.from('clients').update({
        name: fullName,
        address: address || null,
        building_name: buildingName || null,
        room_number: roomNumber || null,
        phone_number: phone || null,
      }).eq('id', clientRecord.id)
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    router.refresh()
  }

  const handlePasswordChange = async () => {
    setPwError(''); setPwSuccess(false)
    if (newPassword.length < 6) { setPwError(t.passwordTooShort); return }
    if (newPassword !== confirmPassword) { setPwError(t.passwordMismatch); return }
    setPwSaving(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (!error) {
      await supabase.auth.updateUser({ data: { password_changed: true } })
    }
    setPwSaving(false)
    if (error) { setPwError(error.message) }
    else { setPwSuccess(true); setNewPassword(''); setConfirmPassword('') }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F9FAFB', fontFamily: "'Inter', 'Noto Sans JP', sans-serif" }}>
      <Sidebar lang={lang} onLangToggle={() => setLang(lang === 'en' ? 'jp' : 'en')} activeNav="settings" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} role="client" />

      <div className="tc-main">
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
              {(fullName || user.email || 'A').charAt(0)}
            </div>
          </div>
        </header>

        <div className="tc-page-content" style={{ flex: 1, padding: '28px 32px 120px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>

          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', letterSpacing: '-0.5px', marginBottom: '6px' }}>
              {t.settingsTitle}
            </h1>
            <p style={{ fontSize: '14px', color: '#6B7280' }}>{t.settingsSub}</p>
          </div>

          {/* Personal Information Card */}
          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '24px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserIcon size={18} color="#0B8A86" />
              {t.personalInfo}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Full Name */}
              <div>
                <label style={labelStyle}>{t.fullName}</label>
                <div style={{ position: 'relative' }}>
                  <UserIcon size={16} color="#9CA3AF" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#0EA5A0'}
                    onBlur={e => e.target.style.borderColor = '#D1D5DB'}
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label style={labelStyle}>{t.phone}</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} color="#9CA3AF" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input type="tel" value={phone}
                    onChange={e => {
                      let digits = e.target.value.replace(/\D/g, '').slice(0, 12)
                      let formatted = ''
                      if (digits.length > 0) formatted = '+' + digits.slice(0, 2)
                      if (digits.length > 2) formatted += ' ' + digits.slice(2, 4)
                      if (digits.length > 4) formatted += '-' + digits.slice(4, 8)
                      if (digits.length > 8) formatted += '-' + digits.slice(8, 12)
                      setPhone(formatted)
                    }}
                    placeholder="+81 90-1234-5678" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#0EA5A0'}
                    onBlur={e => e.target.style.borderColor = '#D1D5DB'}
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label style={labelStyle}>{t.address}</label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={16} color="#9CA3AF" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input type="text" value={address} onChange={e => setAddress(e.target.value)}
                    placeholder={t.addressPlaceholder} style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#0EA5A0'}
                    onBlur={e => e.target.style.borderColor = '#D1D5DB'}
                  />
                </div>
              </div>

              {/* Building Name + Room Number (side by side) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>{t.buildingName}</label>
                  <div style={{ position: 'relative' }}>
                    <Building2 size={16} color="#9CA3AF" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input type="text" value={buildingName} onChange={e => setBuildingName(e.target.value)}
                      placeholder={t.buildingPlaceholder} style={inputStyle}
                      onFocus={e => e.target.style.borderColor = '#0EA5A0'}
                      onBlur={e => e.target.style.borderColor = '#D1D5DB'}
                    />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>{t.roomNumber}</label>
                  <div style={{ position: 'relative' }}>
                    <Hash size={16} color="#9CA3AF" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input type="text" value={roomNumber} onChange={e => setRoomNumber(e.target.value)}
                      placeholder={t.roomPlaceholder} style={inputStyle}
                      onFocus={e => e.target.style.borderColor = '#0EA5A0'}
                      onBlur={e => e.target.style.borderColor = '#D1D5DB'}
                    />
                  </div>
                </div>
              </div>

              {/* Email (readonly) */}
              <div>
                <label style={labelStyle}>{t.email}</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="#9CA3AF" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input type="email" value={user.email} disabled
                    style={{
                      ...inputStyle,
                      background: '#F3F4F6', color: '#6B7280', cursor: 'not-allowed', border: '1px solid #E5E7EB'
                    }} />
                </div>
                <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '6px' }}>{t.readonlyEmail}</p>
              </div>
            </div>

            <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {saveError && (
                <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#DC2626' }}>
                  {saveError}
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '16px' }}>
              {saved && <span style={{ color: '#059669', fontSize: '13px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={16} /> {t.saved}
              </span>}
              <button onClick={handleSave} disabled={saving}
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
          </div>

          {/* Security Card */}
          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={18} color="#0B8A86" />
              {t.securityInfo}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>{t.newPassword}</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="#9CA3AF" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input type={showNewPw ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{ ...inputStyle, paddingRight: '40px' }}
                    onFocus={e => e.target.style.borderColor = '#0EA5A0'}
                    onBlur={e => e.target.style.borderColor = '#D1D5DB'}
                  />
                  <button onClick={() => setShowNewPw(!showNewPw)} style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', display: 'flex'
                  }}>
                    {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label style={labelStyle}>{t.confirmPassword}</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="#9CA3AF" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input type={showConfirmPw ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{ ...inputStyle, paddingRight: '40px' }}
                    onFocus={e => e.target.style.borderColor = '#0EA5A0'}
                    onBlur={e => e.target.style.borderColor = '#D1D5DB'}
                  />
                  <button onClick={() => setShowConfirmPw(!showConfirmPw)} style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', display: 'flex'
                  }}>
                    {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {pwError && (
                <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#DC2626' }}>
                  {pwError}
                </div>
              )}
              {pwSuccess && (
                <div style={{ background: '#DCFCE7', border: '1px solid #BBF7D0', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#059669', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={16} /> {t.passwordChanged}
                </div>
              )}
            </div>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={handlePasswordChange} disabled={pwSaving || !newPassword}
                style={{
                  background: '#0EA5A0', color: 'white', border: 'none', borderRadius: '8px',
                  padding: '10px 24px', fontSize: '14px', fontWeight: 600,
                  cursor: pwSaving || !newPassword ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: '8px',
                  opacity: pwSaving || !newPassword ? 0.5 : 1
                }}
              >
                {pwSaving ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
                {pwSaving ? t.changingPassword : t.changePassword}
              </button>
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
