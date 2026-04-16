'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { useLang } from '@/hooks/useLang'
import { Shield, ArrowLeft } from 'lucide-react'

const i18n = {
  en: {
    title: 'Privacy & Security',
    intro: 'To save time on future bookings, we can store your property details on your account — including your address, access instructions, and photos.',
    optSaveTitle: 'Yes, save my property details',
    optSaveDesc: 'Register once. Pre-filled for every future booking.',
    optNoTitle: 'No thanks, I\'ll fill in each time',
    optNoDesc: 'No sensitive property data will be saved.',
    continue: 'Continue',
    footerNote: 'You can view, update, or permanently delete this information at any time from Account Settings.',
    backToDashboard: 'Back to Properties',
  },
  jp: {
    title: 'プライバシーと安全',
    intro: '今後の予約をスムーズにするために、ご自宅の住所やアクセス方法、お写真などをアカウントに保存することができます。',
    optSaveTitle: 'はい、物件情報を保存する',
    optSaveDesc: '一度登録すれば、次回から入力不要になります。',
    optNoTitle: 'いいえ、毎回手動で入力する',
    optNoDesc: '機密性の高い物件情報は保存されません。',
    continue: '次へ進む',
    footerNote: '保存された情報は、アカウント設定からいつでも確認・更新・一括削除が可能です。',
    backToDashboard: '物件一覧へ戻る',
  },
}

export default function PropertyConsentPage() {
  const [lang, setLang] = useLang()
  const [selected, setSelected] = useState<'save' | 'none' | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const t = i18n[lang]

  const handleContinue = () => {
    if (selected === 'save') {
      router.push('/dashboard/property/register')
    } else {
      router.push('/dashboard/property')
    }
  }

  const optionCard = (type: 'save' | 'none', title: string, desc: string) => {
    const isSelected = selected === type
    return (
      <div
        onClick={() => setSelected(type)}
        style={{
          cursor: 'pointer',
          border: `2px solid ${isSelected ? '#7C3AED' : '#E5E7EB'}`,
          borderRadius: '12px',
          padding: '20px',
          display: 'flex', gap: '16px', alignItems: 'center',
          background: isSelected ? '#F5F3FF' : 'white',
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = '#7C3AED' }}
        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = '#E5E7EB' }}
      >
        {/* Radio circle */}
        <div style={{
          width: '22px', height: '22px', borderRadius: '50%',
          border: `2px solid ${isSelected ? '#7C3AED' : '#D1D5DB'}`,
          background: 'white', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            width: '10px', height: '10px', borderRadius: '50%',
            background: '#7C3AED',
            transform: isSelected ? 'scale(1)' : 'scale(0)',
            transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          }} />
        </div>
        <div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>{title}</div>
          <div style={{ fontSize: '13px', color: '#6B7280', lineHeight: 1.4 }}>{desc}</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F9FAFB', fontFamily: "'Inter', 'Noto Sans JP', sans-serif" }}>
      <Sidebar lang={lang} onLangToggle={() => setLang(lang === 'en' ? 'jp' : 'en')} activeNav="property" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="tc-main">
        {/* Top bar */}
        <header className="tc-topbar" style={{
          height: '64px', background: 'white', borderBottom: '1px solid #E5E7EB',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 32px', position: 'sticky', top: 0, zIndex: 90,
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button className="tc-hamburger" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Menu" style={{ position: 'relative' }}>
              <span className="bar" /><span className="bar" /><span className="bar" />
            </button>
            <button onClick={() => router.push('/dashboard/property')} style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#6B7280', fontWeight: 600, fontSize: '13px',
            }}
              onMouseEnter={e => (e.currentTarget.style.color = '#7C3AED')}
              onMouseLeave={e => (e.currentTarget.style.color = '#6B7280')}>
              <ArrowLeft size={16} /> {t.backToDashboard}
            </button>
          </div>
          <div style={{
            display: 'flex', background: '#F3F4F6', borderRadius: '6px', overflow: 'hidden',
            border: '1px solid #E5E7EB',
          }}>
            <button onClick={() => setLang('en')} style={{
              padding: '5px 10px', border: 'none', fontSize: '11px', fontWeight: 600, cursor: 'pointer',
              background: lang === 'en' ? 'white' : 'transparent',
              color: lang === 'en' ? '#1F2937' : '#6B7280',
            }}>EN</button>
            <button onClick={() => setLang('jp')} style={{
              padding: '5px 10px', border: 'none', fontSize: '11px', fontWeight: 600, cursor: 'pointer',
              background: lang === 'jp' ? 'white' : 'transparent',
              color: lang === 'jp' ? '#1F2937' : '#6B7280',
            }}>JP</button>
          </div>
        </header>

        {/* Centered consent card */}
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '32px 20px',
        }}>
          <div style={{ width: '100%', maxWidth: '520px' }}>
            <div style={{
              background: 'white', padding: '40px', borderRadius: '12px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 10px 15px rgba(0,0,0,0.06), 0 4px 6px rgba(0,0,0,0.04)',
            }}>
              {/* Icon */}
              <div style={{
                width: '56px', height: '56px', borderRadius: '14px',
                background: '#F5F3FF', color: '#7C3AED',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '24px',
              }}>
                <Shield size={28} />
              </div>

              <h1 style={{
                fontSize: '22px', fontWeight: 800, color: '#111827',
                marginBottom: '12px', letterSpacing: '-0.5px',
              }}>
                {t.title}
              </h1>

              <p style={{
                color: '#6B7280', fontSize: '15px', lineHeight: 1.6,
                marginBottom: '32px',
              }}>
                {t.intro}
              </p>

              {/* Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                {optionCard('save', t.optSaveTitle, t.optSaveDesc)}
                {optionCard('none', t.optNoTitle, t.optNoDesc)}
              </div>

              {/* Continue button */}
              <button
                onClick={handleContinue}
                disabled={!selected}
                style={{
                  width: '100%', padding: '14px',
                  background: selected ? '#7C3AED' : '#E5E7EB',
                  color: selected ? 'white' : '#9CA3AF',
                  border: 'none', borderRadius: '8px',
                  fontSize: '15px', fontWeight: 700,
                  cursor: selected ? 'pointer' : 'not-allowed',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { if (selected) e.currentTarget.style.background = '#5B21B6' }}
                onMouseLeave={e => { if (selected) e.currentTarget.style.background = '#7C3AED' }}
              >
                {t.continue}
              </button>

              <p style={{
                marginTop: '24px', fontSize: '12px', color: '#9CA3AF',
                textAlign: 'center', lineHeight: 1.5,
              }}>
                {t.footerNote}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
