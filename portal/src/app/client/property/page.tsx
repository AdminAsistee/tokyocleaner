'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { useLang } from '@/hooks/useLang'
import { Building2, Plus, MapPin, ChevronRight } from 'lucide-react'

/* ================================================================
   i18n
   ================================================================ */
const i18n = {
  en: {
    pageTitle: 'My Properties',
    subtitle: 'Manage your registered properties',
    registerNew: 'Register New Property',
    noProperties: 'No properties registered yet',
    noPropertiesDesc: 'Register your property details once, and we\'ll remember them for every future booking.',
    getStarted: 'Get Started',
    address: 'Address',
    building: 'Building',
    room: 'Room',
    status: 'Status',
    active: 'Active',
    totalProperties: 'Total Properties',
  },
  jp: {
    pageTitle: '物件一覧',
    subtitle: '登録済み物件の管理',
    registerNew: '新しい物件を登録',
    noProperties: 'まだ物件が登録されていません',
    noPropertiesDesc: '物件情報を一度登録すれば、次回から入力不要になります。',
    getStarted: '始める',
    address: '住所',
    building: '建物',
    room: '部屋',
    status: 'ステータス',
    active: '有効',
    totalProperties: '登録物件数',
  },
}

/* ================================================================
   MOCK DATA — will be replaced with Supabase fetch
   ================================================================ */
const MOCK_PROPERTIES = [
  { id: '1', name: 'Shibuya Apartment', address: '東京都渋谷区神南1-2-3', building: 'シブヤビル', room: '802', status: 'active' },
  { id: '2', name: 'Shinjuku Studio', address: '東京都新宿区歌舞伎町1-1-1', building: '新宿マンション', room: '305', status: 'active' },
]

/* ================================================================
   COMPONENT
   ================================================================ */
export default function PropertyListPage() {
  const [lang, setLang] = useLang()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const t = i18n[lang]

  // TODO: Replace with real Supabase data
  const properties = MOCK_PROPERTIES

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F9FAFB', fontFamily: "'Inter', 'Noto Sans JP', sans-serif" }}>
      <Sidebar lang={lang} onLangToggle={() => setLang(lang === 'en' ? 'jp' : 'en')} activeNav="property" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} role="client" />

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
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#111827' }}>{t.pageTitle}</div>
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

        <main className="tc-page-content" style={{ flex: 1, padding: '28px 32px 40px', maxWidth: '960px' }}>

          {/* Page header + Register button */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: '24px', flexWrap: 'wrap', gap: '12px',
          }}>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>
                <Building2 size={20} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '8px', color: '#0EA5A0' }} />
                {t.pageTitle}
              </h1>
              <p style={{ fontSize: '13px', color: '#6B7280' }}>{t.subtitle}</p>
            </div>
            <button onClick={() => router.push('/client/property/consent')}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 20px', borderRadius: '8px',
                background: '#0EA5A0', color: 'white',
                border: 'none', fontWeight: 700, fontSize: '13px',
                cursor: 'pointer', transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#0B8A86')}
              onMouseLeave={e => (e.currentTarget.style.background = '#0EA5A0')}
            >
              <Plus size={16} /> {t.registerNew}
            </button>
          </div>

          {/* Scorecard */}
          <div style={{
            background: 'white', border: '1px solid #E5E7EB', borderRadius: '12px',
            padding: '16px 20px', marginBottom: '20px', display: 'inline-flex',
            alignItems: 'center', gap: '12px',
          }}>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#0EA5A0' }}>{properties.length}</div>
            <div style={{ fontSize: '12px', fontWeight: 500, color: '#6B7280' }}>{t.totalProperties}</div>
          </div>

          {properties.length === 0 ? (
            /* Empty state */
            <div style={{
              background: 'white', border: '1px solid #E5E7EB', borderRadius: '12px',
              padding: '48px 32px', textAlign: 'center',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '16px',
                background: '#E6F8F7', color: '#0EA5A0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px', fontSize: '28px',
              }}>
                <Building2 size={32} />
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
                {t.noProperties}
              </h2>
              <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '24px', maxWidth: '360px', margin: '0 auto 24px' }}>
                {t.noPropertiesDesc}
              </p>
              <button onClick={() => router.push('/client/property/consent')}
                style={{
                  padding: '12px 28px', borderRadius: '8px',
                  background: '#0EA5A0', color: 'white',
                  border: 'none', fontWeight: 700, fontSize: '14px',
                  cursor: 'pointer', transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#0B8A86')}
                onMouseLeave={e => (e.currentTarget.style.background = '#0EA5A0')}
              >
                {t.getStarted}
              </button>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="orders-table-wrap">
                <table style={{
                  width: '100%', borderCollapse: 'separate', borderSpacing: 0,
                  background: 'white', border: '1px solid #E5E7EB', borderRadius: '12px',
                  overflow: 'hidden', fontSize: '13px',
                }}>
                  <thead>
                    <tr style={{ background: '#F9FAFB' }}>
                      {[t.address, t.building, t.room, t.status].map((h, i) => (
                        <th key={i} style={{
                          padding: '12px 16px', textAlign: 'left', fontSize: '11px',
                          fontWeight: 700, color: '#6B7280', textTransform: 'uppercase',
                          letterSpacing: '0.5px', borderBottom: '1px solid #E5E7EB',
                        }}>{h}</th>
                      ))}
                      <th style={{ width: '40px', borderBottom: '1px solid #E5E7EB' }} />
                    </tr>
                  </thead>
                  <tbody>
                    {properties.map((p, idx) => (
                      <tr key={p.id}
                        style={{
                          cursor: 'pointer', transition: 'background 0.15s',
                          borderBottom: idx < properties.length - 1 ? '1px solid #F3F4F6' : 'none',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#F9FAFB')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'white')}
                      >
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontWeight: 600, color: '#1F2937', marginBottom: '2px' }}>{p.name}</div>
                          <div style={{ fontSize: '11px', color: '#9CA3AF' }}>{p.address}</div>
                        </td>
                        <td style={{ padding: '14px 16px', color: '#374151' }}>{p.building}</td>
                        <td style={{ padding: '14px 16px', color: '#374151' }}>{p.room}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '5px',
                            padding: '4px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 600,
                            background: '#ECFDF5', color: '#059669', border: '1px solid #BBF7D0',
                          }}>
                            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'currentColor' }} />
                            {t.active}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', color: '#D1D5DB' }}>
                          <ChevronRight size={16} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="orders-cards-wrap">
                {properties.map(p => (
                  <div key={p.id} style={{
                    background: 'white', border: '1px solid #E5E7EB', borderRadius: '12px',
                    padding: '16px 20px', marginBottom: '10px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '14px',
                    transition: 'all 0.15s',
                  }}>
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '10px',
                      background: '#E6F8F7', color: '#0EA5A0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <MapPin size={20} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, color: '#1F2937', fontSize: '14px', marginBottom: '2px' }}>{p.name}</div>
                      <div style={{ fontSize: '12px', color: '#9CA3AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.address}</div>
                      <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>
                        {p.building} · {t.room} {p.room}
                      </div>
                    </div>
                    <div style={{ color: '#D1D5DB', flexShrink: 0 }}>
                      <ChevronRight size={18} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
