'use client'

import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import {
  ChevronRight, MapPin, Clock, User as UserIcon, Building2,
  CalendarPlus, X, Sparkles
} from 'lucide-react'
import { useLang } from '@/hooks/useLang'

/* ================================================================
   i18n
   ================================================================ */
const i18n = {
  en: {
    welcomeBack: 'Welcome back,',
    dashboardTitle: 'Dashboard',
    dashboardSub: 'Your cleaning overview',
    onboardingTitle: 'Complete your property profile',
    onboardingDesc: 'Register your property details once, and we\'ll remember them for every future booking.',
    registerProperty: 'Register Property',
    nextCleaning: 'Next Cleaning',
    confirmed: 'Confirmed',
    scheduled: 'Scheduled',
    ongoing: 'Ongoing',
    completed: 'Completed',
    cancelled: 'Cancelled',
    viewDetails: 'View Details',
    noUpcoming: 'No upcoming cleanings scheduled',
    bookNow: 'Book your next cleaning',
    recentOrders: 'Recent Orders',
    viewAll: 'View All →',
    mySchedule: 'My Schedule',
    comingSoon: 'Schedule features coming soon',
    yourProperty: 'Your Property',
    noProperty: 'No property registered yet',
    edit: 'Edit',
    bookCleaning: 'Book a Cleaning',
    nextAvailable: 'Next available slot:',
    tomorrow: 'Tomorrow',
    cleaner: 'Cleaner',
    property: 'Property',
    type: 'Type',
    done: 'Done',
    photos: 'Photos',
  },
  jp: {
    welcomeBack: 'お帰りなさい、',
    dashboardTitle: 'ダッシュボード',
    dashboardSub: 'クリーニング概要',
    onboardingTitle: '物件情報を登録しましょう',
    onboardingDesc: '物件情報を一度登録すれば、次回以降の予約に引き継がれます。',
    registerProperty: '物件を登録する',
    nextCleaning: '次回のクリーニング',
    confirmed: '確認済み',
    scheduled: '予約済み',
    ongoing: '進行中',
    completed: '完了',
    cancelled: 'キャンセル',
    viewDetails: '詳細を見る',
    noUpcoming: '予定されたクリーニングはありません',
    bookNow: '次のクリーニングを予約',
    recentOrders: '最近の注文',
    viewAll: 'すべて見る →',
    mySchedule: 'スケジュール',
    comingSoon: 'スケジュール機能は近日公開',
    yourProperty: '登録物件',
    noProperty: 'まだ物件が登録されていません',
    edit: '編集',
    bookCleaning: 'クリーニングを予約',
    nextAvailable: '次の空き:',
    tomorrow: '明日',
    cleaner: '担当スタッフ',
    property: '物件',
    type: 'タイプ',
    done: '完了',
    photos: '写真あり',
  },
}

/* ================================================================
   TYPES
   ================================================================ */
interface Booking {
  id: string
  scheduled_date: string
  scheduled_time: string | null
  service_type: string
  status: string
  notes: string
  properties: Array<{ name: string; address: string }> | null
}

interface DashboardClientProps {
  user: User
  nextBooking: Booking | null
  recentBookings: Booking[]
  totalCount: number
  upcomingCount: number
}

/* ================================================================
   HELPERS
   ================================================================ */
function formatDate(dateStr: string, lang: 'en' | 'jp') {
  const d = new Date(dateStr + 'T00:00:00')
  const days = lang === 'en'
    ? ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
    : ['日','月','火','水','木','金','土']
  const months = lang === 'en'
    ? ['January','February','March','April','May','June','July','August','September','October','November','December']
    : ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']
  const year = d.getFullYear()
  return {
    month: months[d.getMonth()],
    monthShort: lang === 'en' ? months[d.getMonth()].substring(0, 3).toUpperCase() : months[d.getMonth()],
    day: d.getDate(),
    dayName: days[d.getDay()],
    year,
    full: lang === 'en'
      ? `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}, ${year}`
      : `${year}年${months[d.getMonth()]}${d.getDate()}日 (${days[d.getDay()]})`,
  }
}

function getStatusStyle(status: string) {
  switch (status) {
    case 'completed': return { bg: '#ECFDF5', color: '#059669', border: '#BBF7D0' }
    case 'scheduled': return { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' }
    case 'ongoing':   return { bg: '#FFF7ED', color: '#C2410C', border: '#FED7AA' }
    case 'cancelled': return { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' }
    default:          return { bg: '#F5F3FF', color: '#6D28D9', border: '#E9D5FF' }
  }
}

function getPropertyName(booking: Booking) {
  const propObj = booking.properties as any
  return propObj ? (Array.isArray(propObj) ? propObj[0]?.name : propObj.name) ?? '—' : '—'
}

function buildGoogleCalendarUrl() {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(10, 0, 0, 0)
  const endTime = new Date(tomorrow)
  endTime.setHours(12, 0, 0, 0)
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '')
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('TokyoCleaner - Cleaning Service')}&dates=${fmt(tomorrow)}/${fmt(endTime)}&details=${encodeURIComponent('Cleaning booked via TokyoCleaner Portal')}&location=${encodeURIComponent('Tokyo, Japan')}`
}

/* ================================================================
   COMPONENT
   ================================================================ */
export default function DashboardClient({
  user, nextBooking, recentBookings, totalCount, upcomingCount
}: DashboardClientProps) {
  const [lang, setLang, toggleLang] = useLang()
  const [showOnboarding, setShowOnboarding] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const t = i18n[lang]
  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F9FAFB', fontFamily: "'Inter', 'Noto Sans JP', sans-serif" }}>
      <Sidebar lang={lang} onLangToggle={() => setLang(lang === 'en' ? 'jp' : 'en')} activeNav="dashboard" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="tc-main">
        {/* Top bar */}
        <div className="tc-topbar" style={{
          background: 'white', borderBottom: '1px solid #E5E7EB',
          padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 50,
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button className="tc-hamburger" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Menu" style={{ position: 'relative' }}>
              <span className="bar" /><span className="bar" /><span className="bar" />
            </button>
            <span style={{ fontSize: '14px', color: '#6B7280' }}>
              {t.welcomeBack} <strong style={{ color: '#111827' }}>{userName}</strong>
            </span>
          </div>
          <div style={{
            display: 'flex', background: '#F3F4F6', borderRadius: '6px', overflow: 'hidden',
            border: '1px solid #E5E7EB',
          }}>
            <button onClick={() => setLang('en')} style={{
              padding: '5px 10px', border: 'none', fontSize: '11px', fontWeight: 600, cursor: 'pointer',
              background: lang === 'en' ? 'white' : 'transparent',
              color: lang === 'en' ? '#1F2937' : '#6B7280',
              boxShadow: lang === 'en' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
            }}>EN</button>
            <button onClick={() => setLang('jp')} style={{
              padding: '5px 10px', border: 'none', fontSize: '11px', fontWeight: 600, cursor: 'pointer',
              background: lang === 'jp' ? 'white' : 'transparent',
              color: lang === 'jp' ? '#1F2937' : '#6B7280',
              boxShadow: lang === 'jp' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
            }}>JP</button>
          </div>
        </div>

        {/* Page content */}
        <div className="tc-page-content" style={{ flex: 1, padding: '28px 32px 120px', maxWidth: '960px' }}>

          {/* Page header */}
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', letterSpacing: '-0.5px', marginBottom: '4px' }}>
              {t.dashboardTitle}
            </h1>
            <p style={{ fontSize: '13px', color: '#6B7280' }}>{t.dashboardSub}</p>
          </div>

          {/* Onboarding banner */}
          {showOnboarding && (
            <div className="onboarding-banner-flex" style={{
              background: '#F0FDFC', border: '1px solid rgba(14,165,160,0.2)',
              borderRadius: '12px', padding: '16px 20px', marginBottom: '20px',
              display: 'flex', alignItems: 'center', gap: '16px',
              animation: 'slideDown 0.3s ease',
            }}>
              <div style={{
                width: '40px', height: '40px', background: '#0EA5A0', borderRadius: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <MapPin size={18} color="white" />
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#111827', marginBottom: '2px' }}>
                  {t.onboardingTitle}
                </h4>
                <p style={{ fontSize: '12px', color: '#6B7280', lineHeight: 1.4 }}>
                  {t.onboardingDesc}
                </p>
                <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
                  <div style={{ height: '4px', borderRadius: '100px', flex: 1, background: '#0EA5A0' }} />
                  <div style={{ height: '4px', borderRadius: '100px', flex: 1, background: '#0EA5A0' }} />
                  <div style={{ height: '4px', borderRadius: '100px', flex: 1, background: 'linear-gradient(90deg, #0EA5A0, rgba(14,165,160,0.3))' }} />
                  <div style={{ height: '4px', borderRadius: '100px', flex: 1, background: '#E5E7EB' }} />
                </div>
              </div>
              <div className="onboarding-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                <button style={{
                  padding: '8px 16px', borderRadius: '8px', border: 'none',
                  background: '#0EA5A0', color: 'white', fontSize: '12px', fontWeight: 600,
                  cursor: 'pointer', whiteSpace: 'nowrap',
                }}>
                  {t.registerProperty}
                </button>
                <button onClick={() => setShowOnboarding(false)} style={{
                  width: '28px', height: '28px', borderRadius: '6px', border: 'none',
                  background: 'none', color: '#9CA3AF', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ====================== HERO: NEXT CLEANING ====================== */}
          <div style={{
            background: 'white', border: '1px solid #E5E7EB', borderRadius: '16px',
            overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: '20px',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
              background: 'linear-gradient(90deg, #0EA5A0, #0B8A86)',
            }} />

            {nextBooking ? (
              <div className="hero-inner-flex" style={{ padding: '24px 28px', display: 'flex', alignItems: 'flex-start', gap: '28px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase' as const,
                    color: '#0EA5A0', marginBottom: '12px',
                  }}>
                    <div style={{
                      width: '7px', height: '7px', borderRadius: '50%', background: '#16A34A',
                      animation: 'pulse 2s infinite',
                    }} />
                    {t.nextCleaning}
                  </div>
                  <div className="hero-date-large" style={{ fontSize: '28px', fontWeight: 800, color: '#111827', letterSpacing: '-0.8px', lineHeight: 1.2, marginBottom: '4px' }}>
                    {formatDate(nextBooking.scheduled_date, lang).full}
                  </div>
                  <div style={{ fontSize: '15px', color: '#6B7280', fontWeight: 500, marginBottom: '16px' }}>
                    {nextBooking.scheduled_time || '10:00 AM – 12:00 PM'}
                  </div>
                  <div className="hero-details-flex" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' as const }}>
                    {[
                      { icon: <UserIcon size={14} />, label: t.cleaner, value: 'TBD' },
                      { icon: <Building2 size={14} />, label: t.property, value: getPropertyName(nextBooking) },
                      { icon: <Sparkles size={14} />, label: t.type, value: nextBooking.service_type },
                    ].map(d => (
                      <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#4B5563' }}>
                        <div style={{
                          width: '30px', height: '30px', borderRadius: '6px', background: '#F9FAFB',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>{d.icon}</div>
                        <div>
                          <div style={{ fontSize: '10px', color: '#9CA3AF', textTransform: 'uppercase' as const, letterSpacing: '0.5px', fontWeight: 600 }}>{d.label}</div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#1F2937' }}>{d.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="hero-side" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px', flexShrink: 0 }}>
                  {(() => {
                    const s = getStatusStyle(nextBooking.status)
                    return (
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        padding: '5px 12px', borderRadius: '100px', fontSize: '11px', fontWeight: 600,
                        background: s.bg, color: s.color, border: `1px solid ${s.border}`,
                      }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }} />
                        {t[nextBooking.status as keyof typeof t] || nextBooking.status}
                      </div>
                    )
                  })()}
                  <button
                    onClick={() => router.push(`/dashboard/orders/${nextBooking.id}`)}
                    style={{
                      padding: '8px 14px', borderRadius: '8px', border: '1px solid #E5E7EB',
                      background: 'white', fontSize: '12px', fontWeight: 600, color: '#4B5563',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                    }}
                  >
                    {t.viewDetails} <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ padding: '32px 28px', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '12px' }}>📅</div>
                <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '4px' }}>{t.noUpcoming}</p>
                <a href={buildGoogleCalendarUrl()} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: '13px', color: '#0EA5A0', fontWeight: 600, textDecoration: 'none' }}>
                  {t.bookNow} →
                </a>
              </div>
            )}
          </div>

          {/* ====================== TWO-COLUMN GRID ====================== */}
          <div className="dashboard-grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>

            {/* LEFT: Recent Orders */}
            <div style={{
              background: 'white', border: '1px solid #E5E7EB', borderRadius: '12px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)', overflow: 'hidden',
            }}>
              <div style={{
                padding: '16px 20px 12px', display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', borderBottom: '1px solid #F3F4F6',
              }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#1F2937', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  📋 {t.recentOrders}
                </div>
                <a href="/dashboard/orders" style={{
                  fontSize: '12px', color: '#0EA5A0', fontWeight: 600, textDecoration: 'none',
                }}>{t.viewAll}</a>
              </div>
              <div style={{ padding: '8px 0' }}>
                {recentBookings.length === 0 ? (
                  <div style={{ padding: '24px 20px', textAlign: 'center', color: '#9CA3AF', fontSize: '13px' }}>
                    {t.noUpcoming}
                  </div>
                ) : (
                  recentBookings.slice(0, 3).map(b => {
                    const d = formatDate(b.scheduled_date, lang)
                    const s = getStatusStyle(b.status)
                    return (
                      <div key={b.id}
                        onClick={() => router.push(`/dashboard/orders/${b.id}`)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '12px',
                          padding: '12px 20px', borderBottom: '1px solid #FCFCFD',
                          cursor: 'pointer', transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#FCFCFD')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        {/* Date box */}
                        <div style={{
                          width: '44px', height: '44px', borderRadius: '8px',
                          background: '#F9FAFB', border: '1px solid #F3F4F6',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          <span style={{ fontSize: '9px', fontWeight: 700, color: '#0EA5A0', textTransform: 'uppercase' as const, letterSpacing: '0.5px', lineHeight: 1 }}>
                            {d.monthShort}
                          </span>
                          <span style={{ fontSize: '16px', fontWeight: 800, color: '#1F2937', lineHeight: 1, marginTop: '1px' }}>
                            {d.day}
                          </span>
                        </div>
                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#1F2937', marginBottom: '2px' }}>
                            {b.service_type}
                          </div>
                          <div style={{ fontSize: '11px', color: '#9CA3AF' }}>
                            {b.scheduled_time || '—'} · {getPropertyName(b)}
                          </div>
                        </div>
                        {/* Status */}
                        <div style={{
                          display: 'inline-flex', alignItems: 'center', gap: '6px',
                          padding: '4px 10px', borderRadius: '100px', fontSize: '10px', fontWeight: 600,
                          background: s.bg, color: s.color, border: `1px solid ${s.border}`,
                        }}>
                          <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'currentColor' }} />
                          {t[b.status as keyof typeof t] || b.status}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            {/* RIGHT: My Schedule — Compact Calendar */}
            <div style={{
              background: 'white', border: '1px solid #E5E7EB', borderRadius: '12px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)', overflow: 'hidden',
            }}>
              <div style={{
                padding: '16px 20px 12px', display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', borderBottom: '1px solid #F3F4F6',
              }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#1F2937', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🔄 {t.mySchedule}
                </div>
              </div>
              <div style={{ padding: '16px 20px' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px',
                }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '8px',
                    background: '#F5F3FF', border: '1px solid #E9D5FF',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0,
                  }}>📅</div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#1F2937', marginBottom: '2px' }}>
                      {lang === 'en' ? `${totalCount} total cleanings` : `合計 ${totalCount} 回のクリーニング`}
                    </div>
                    <div style={{ fontSize: '11px', color: '#6B7280' }}>
                      {lang === 'en' ? `${upcomingCount} upcoming` : `${upcomingCount} 件予定あり`}
                    </div>
                  </div>
                </div>
                {/* Compact Calendar */}
                <MiniCalendar lang={lang} bookings={recentBookings} />
              </div>
            </div>
          </div>

          {/* ====================== PROPERTY SUMMARY ====================== */}
          <div className="property-card-flex" style={{
            background: 'white', border: '1px solid #E5E7EB', borderRadius: '12px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)', padding: '18px 20px',
            display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px',
          }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '8px',
              background: '#F0FDFC', border: '1px solid rgba(14,165,160,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0,
            }}>🏢</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: '2px' }}>
                {t.yourProperty}
              </div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#1F2937', marginBottom: '2px' }}>
                {t.noProperty}
              </div>
              <div style={{ fontSize: '12px', color: '#6B7280', display: 'flex', gap: '12px' }}>
                <span>📍 Tokyo</span>
              </div>
            </div>
            <button style={{
              padding: '7px 14px', borderRadius: '8px', border: '1px solid #E5E7EB',
              background: 'white', fontSize: '12px', fontWeight: 600, color: '#4B5563', cursor: 'pointer',
            }}>
              {t.edit}
            </button>
          </div>
        </div>

        {/* ====================== STICKY CTA BAR ====================== */}
        <div className="tc-sticky-cta" style={{
          position: 'sticky', bottom: 0, background: 'white', borderTop: '1px solid #E5E7EB',
          padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 -4px 12px rgba(0,0,0,0.04)', zIndex: 40,
        }}>
          <span style={{ fontSize: '12px', color: '#9CA3AF' }}>
            {t.nextAvailable} <strong style={{ color: '#4B5563' }}>{t.tomorrow}</strong>
          </span>
          <a href={buildGoogleCalendarUrl()} target="_blank" rel="noopener noreferrer" style={{
            padding: '11px 28px', borderRadius: '8px', border: 'none',
            background: '#0EA5A0', color: 'white', fontSize: '14px', fontWeight: 700,
            cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px',
            textDecoration: 'none', letterSpacing: '-0.2px',
          }}>
            <CalendarPlus size={16} /> {t.bookCleaning}
          </a>
        </div>
      </div>


    </div>
  )
}

/* ================================================================
   MINI CALENDAR — Weekly / Monthly toggle with navigation
   ================================================================ */
function MiniCalendar({ lang, bookings }: { lang: 'en' | 'jp'; bookings: Booking[] }) {
  const realToday = new Date()
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month')
  const [viewYear, setViewYear] = useState(realToday.getFullYear())
  const [viewMonth, setViewMonth] = useState(realToday.getMonth())
  const [weekOffset, setWeekOffset] = useState(0) // 0 = current week

  const bookingDates = new Set(bookings.map(b => b.scheduled_date))

  const monthNames = lang === 'en'
    ? ['January','February','March','April','May','June','July','August','September','October','November','December']
    : ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']

  const dayHeaders = lang === 'en'
    ? ['Mo','Tu','We','Th','Fr','Sa','Su']
    : ['月','火','水','木','金','土','日']

  const dayNamesFull = lang === 'en'
    ? ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
    : ['日','月','火','水','木','金','土']

  // Navigation
  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }
  const goToday = () => {
    setViewYear(realToday.getFullYear())
    setViewMonth(realToday.getMonth())
    setWeekOffset(0)
  }

  // Month label
  const monthLabel = lang === 'en'
    ? `${monthNames[viewMonth]} ${viewYear}`
    : `${viewYear}年${monthNames[viewMonth]}`

  // Nav button style
  const navBtn: React.CSSProperties = {
    background: 'none', border: 'none', cursor: 'pointer',
    color: '#6B7280', fontSize: '14px', padding: '4px 6px',
    borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'background 0.15s', lineHeight: 1,
  }

  // Tab style
  const tabStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '4px 12px', border: 'none', borderRadius: '6px',
    fontSize: '10px', fontWeight: 700, cursor: 'pointer',
    background: isActive ? '#0EA5A0' : 'transparent',
    color: isActive ? 'white' : '#9CA3AF',
    transition: 'all 0.15s',
  })

  // ==================== MONTHLY VIEW ====================
  const renderMonthView = () => {
    const firstDay = new Date(viewYear, viewMonth, 1)
    const lastDay = new Date(viewYear, viewMonth + 1, 0)
    const startOffset = (firstDay.getDay() + 6) % 7
    const totalDays = lastDay.getDate()

    const cells: (number | null)[] = []
    for (let i = 0; i < startOffset; i++) cells.push(null)
    for (let d = 1; d <= totalDays; d++) cells.push(d)
    while (cells.length % 7 !== 0) cells.push(null)

    return (
      <>
        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '2px' }}>
          {dayHeaders.map(dh => (
            <div key={dh} style={{
              textAlign: 'center', fontSize: '9px', fontWeight: 700,
              color: '#9CA3AF', textTransform: 'uppercase', padding: '2px 0',
            }}>{dh}</div>
          ))}
        </div>
        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {cells.map((day, i) => {
            if (day === null) return <div key={`e${i}`} />
            const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const isToday = day === realToday.getDate() && viewMonth === realToday.getMonth() && viewYear === realToday.getFullYear()
            const hasBooking = bookingDates.has(dateStr)

            return (
              <div key={day} style={{
                textAlign: 'center', padding: '2px 0',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
              }}>
                <div style={{
                  width: '26px', height: '26px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: isToday ? 700 : 400,
                  background: isToday ? '#0EA5A0' : 'transparent',
                  color: isToday ? 'white' : '#374151',
                }}>
                  {day}
                </div>
                <div style={{
                  width: '4px', height: '4px', borderRadius: '50%',
                  background: hasBooking ? '#0EA5A0' : 'transparent',
                  marginTop: '1px',
                }} />
              </div>
            )
          })}
        </div>
      </>
    )
  }

  // ==================== WEEKLY VIEW ====================
  const renderWeekView = () => {
    // Calculate week start (Monday) based on today + offset
    const baseDate = new Date(realToday)
    baseDate.setDate(baseDate.getDate() + weekOffset * 7)
    const dayOfWeek = baseDate.getDay()
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    const weekStart = new Date(baseDate)
    weekStart.setDate(baseDate.getDate() + mondayOffset)

    const weekDays: Date[] = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart)
      d.setDate(weekStart.getDate() + i)
      weekDays.push(d)
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {weekDays.map(d => {
          const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
          const isToday = d.toDateString() === realToday.toDateString()
          const hasBooking = bookingDates.has(dateStr)
          const booking = hasBooking ? bookings.find(b => b.scheduled_date === dateStr) : null

          return (
            <div key={dateStr} style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '6px 8px', borderRadius: '8px',
              background: isToday ? '#F0FDFC' : 'transparent',
              border: isToday ? '1px solid rgba(14,165,160,0.2)' : '1px solid transparent',
            }}>
              {/* Day name */}
              <div style={{
                width: '28px', fontSize: '10px', fontWeight: 600,
                color: isToday ? '#0EA5A0' : '#9CA3AF',
                textTransform: 'uppercase',
              }}>
                {dayNamesFull[d.getDay()]}
              </div>
              {/* Date number */}
              <div style={{
                width: '26px', height: '26px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px', fontWeight: isToday ? 700 : 500,
                background: isToday ? '#0EA5A0' : 'transparent',
                color: isToday ? 'white' : '#374151',
                flexShrink: 0,
              }}>
                {d.getDate()}
              </div>
              {/* Booking info */}
              {hasBooking && booking ? (
                <div style={{
                  flex: 1, fontSize: '10px', fontWeight: 600,
                  color: '#0EA5A0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {booking.service_type}
                </div>
              ) : (
                <div style={{ flex: 1, fontSize: '10px', color: '#E5E7EB' }}>—</div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  // Week navigation label
  const getWeekLabel = () => {
    const baseDate = new Date(realToday)
    baseDate.setDate(baseDate.getDate() + weekOffset * 7)
    const dayOfWeek = baseDate.getDay()
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    const weekStart = new Date(baseDate)
    weekStart.setDate(baseDate.getDate() + mondayOffset)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)

    if (lang === 'en') {
      return `${monthNames[weekStart.getMonth()].substring(0, 3)} ${weekStart.getDate()} – ${monthNames[weekEnd.getMonth()].substring(0, 3)} ${weekEnd.getDate()}, ${weekEnd.getFullYear()}`
    }
    return `${weekStart.getFullYear()}/${weekStart.getMonth()+1}/${weekStart.getDate()} – ${weekEnd.getMonth()+1}/${weekEnd.getDate()}`
  }

  return (
    <div>
      {/* Header: Month/Week toggle + Navigation */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '10px',
      }}>
        {/* View toggle */}
        <div style={{
          display: 'flex', background: '#F3F4F6', borderRadius: '8px',
          padding: '2px', gap: '2px',
        }}>
          <button style={tabStyle(viewMode === 'month')} onClick={() => setViewMode('month')}>
            {lang === 'en' ? 'Month' : '月'}
          </button>
          <button style={tabStyle(viewMode === 'week')} onClick={() => setViewMode('week')}>
            {lang === 'en' ? 'Week' : '週'}
          </button>
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          <button style={navBtn}
            onClick={() => viewMode === 'month' ? prevMonth() : setWeekOffset(w => w - 1)}
            onMouseEnter={e => (e.currentTarget.style.background = '#F3F4F6')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >‹</button>
          <button style={navBtn}
            onClick={() => viewMode === 'month' ? nextMonth() : setWeekOffset(w => w + 1)}
            onMouseEnter={e => (e.currentTarget.style.background = '#F3F4F6')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >›</button>
        </div>
      </div>

      {/* Date label */}
      <div style={{
        fontSize: '12px', fontWeight: 700, color: '#374151',
        marginBottom: '8px', textAlign: 'center',
      }}>
        {viewMode === 'month' ? monthLabel : getWeekLabel()}
      </div>

      {/* Calendar content */}
      {viewMode === 'month' ? renderMonthView() : renderWeekView()}
    </div>
  )
}
