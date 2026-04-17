'use client'

import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { useLang } from '@/hooks/useLang'
import { ChevronRight } from 'lucide-react'

/* ================================================================
   i18n
   ================================================================ */
const i18n = {
  en: {
    pageTitle: 'Order History',
    upcomingCleanings: 'Upcoming Cleanings',
    pastCleanings: 'Past Cleanings',
    scheduled: 'Scheduled',
    confirmed: 'Confirmed',
    pending: 'Pending',
    ongoing: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
    photos: 'Photos',
    noUpcoming: 'No upcoming cleanings',
    noPast: 'No past cleanings',
    totalOrders: 'Total Orders',
    ongoingOrders: 'Ongoing',
    completedOrders: 'Completed',
    cancelledOrders: 'Cancelled',
    filtered: '✓ Filtered',
    noResults: 'No orders match this filter.',
    allOrders: 'All Orders',
    // Table headers
    thDate: 'Date',
    thService: 'Service',
    thProperty: 'Property',
    thStatus: 'Status',
    thTime: 'Time',
  },
  jp: {
    pageTitle: '注文履歴',
    upcomingCleanings: '今後の清掃予定',
    pastCleanings: '過去の清掃履歴',
    scheduled: '予約済み',
    confirmed: '確定済み',
    pending: '承認待ち',
    ongoing: '進行中',
    completed: '完了',
    cancelled: 'キャンセル',
    photos: '写真あり',
    noUpcoming: '今後の予定はありません',
    noPast: '過去の履歴はありません',
    totalOrders: '合計注文',
    ongoingOrders: '進行中',
    completedOrders: '完了',
    cancelledOrders: 'キャンセル',
    filtered: '✓ フィルター中',
    noResults: 'この条件に一致する注文はありません。',
    allOrders: 'すべての注文',
    // Table headers
    thDate: '日付',
    thService: 'サービス',
    thProperty: '物件',
    thStatus: 'ステータス',
    thTime: '時間',
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

interface OrdersClientProps {
  user: User
  bookings: Booking[]
}

/* ================================================================
   HELPERS
   ================================================================ */
const DAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAYS_JP = ['日', '月', '火', '水', '木', '金', '土']
const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTHS_JP = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

function getStatusStyle(status: string) {
  switch (status) {
    case 'completed': return { bg: '#ECFDF5', color: '#059669', border: '#BBF7D0' }
    case 'confirmed': return { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' }
    case 'scheduled': return { bg: '#FFF7ED', color: '#C2410C', border: '#FED7AA' }
    case 'pending':   return { bg: '#FEF9C3', color: '#A16207', border: '#FEF08A' }
    case 'ongoing':   return { bg: '#F5F3FF', color: '#6D28D9', border: '#E9D5FF' }
    case 'cancelled': return { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' }
    default:          return { bg: '#F3F4F6', color: '#6B7280', border: '#E5E7EB' }
  }
}

/* ================================================================
   ORDER CARD
   ================================================================ */
function OrderCard({ booking, lang, onClick }: { booking: Booking; lang: 'en' | 'jp'; onClick: () => void }) {
  const t = i18n[lang]
  const d = new Date(booking.scheduled_date + 'T00:00:00')
  const month = lang === 'en' ? MONTHS_EN[d.getMonth()] : MONTHS_JP[d.getMonth()]
  const day = d.getDate()
  const dow = lang === 'en' ? DAYS_EN[d.getDay()] : DAYS_JP[d.getDay()]
  const s = getStatusStyle(booking.status)
  const statusLabel = t[booking.status as keyof typeof t] || booking.status

  return (
    <div className="order-card-grid" onClick={onClick} style={{
      display: 'grid', gridTemplateColumns: '60px 1fr auto',
      alignItems: 'center', gap: '16px',
      background: 'white', border: '1px solid #E5E7EB', borderRadius: '12px',
      padding: '16px 20px', marginBottom: '10px', cursor: 'pointer',
      transition: 'all 0.15s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.borderColor = '#0EA5A0'
      e.currentTarget.style.boxShadow = '0 2px 8px rgba(14,165,160,0.12)'
    }}
    onMouseLeave={e => {
      e.currentTarget.style.borderColor = '#E5E7EB'
      e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)'
    }}
    >
      {/* Date box */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '8px 0', borderRadius: '8px', background: '#F9FAFB',
        border: '1px solid #F3F4F6',
      }}>
        <span style={{ fontSize: '10px', fontWeight: 700, color: '#0EA5A0', textTransform: 'uppercase' as const, lineHeight: 1 }}>
          {month}
        </span>
        <span style={{ fontSize: '20px', fontWeight: 800, color: '#111827', lineHeight: 1.2 }}>
          {day}
        </span>
        <span style={{ fontSize: '10px', color: '#9CA3AF', fontWeight: 500 }}>
          {dow}
        </span>
      </div>

      {/* Info */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' as const }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px',
            padding: '3px 10px', borderRadius: '100px', fontSize: '10px', fontWeight: 600,
            background: s.bg, color: s.color, border: `1px solid ${s.border}`,
          }}>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'currentColor' }} />
            {statusLabel}
          </span>
          {booking.status === 'completed' && (
            <span style={{
              fontSize: '11px', color: '#0EA5A0', fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: '4px',
            }}>
              📷 {t.photos}
            </span>
          )}
        </div>
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#111827', margin: '0 0 4px' }}>
          {booking.service_type}
        </h3>
        <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#6B7280' }}>
          {booking.scheduled_time && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              🕒 {booking.scheduled_time}
            </span>
          )}
          {booking.properties && booking.properties.length > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              👤 {booking.properties[0].name}
            </span>
          )}
        </div>
      </div>

      {/* Arrow */}
      <div style={{ color: '#D1D5DB', flexShrink: 0 }}>
        <ChevronRight size={20} />
      </div>
    </div>
  )
}

/* ================================================================
   MAIN COMPONENT
   ================================================================ */
export default function OrdersClient({ user, bookings }: OrdersClientProps) {
  const [lang, setLang] = useLang()
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const t = i18n[lang]

  const today = new Date().toISOString().split('T')[0]

  // Counts
  const totalCount = bookings.length
  const pendingCount = bookings.filter(b => b.status === 'pending').length
  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length
  const ongoingCount = bookings.filter(b => b.status === 'ongoing' || (b.status === 'scheduled' && b.scheduled_date >= today)).length
  const completedCount = bookings.filter(b => b.status === 'completed').length
  const cancelledCount = bookings.filter(b => b.status === 'cancelled').length

  // Scorecard config
  const scorecards = [
    { key: null, label: t.totalOrders, count: totalCount, color: '#0EA5A0', bg: '#F0FDFC', border: 'rgba(14,165,160,0.3)' },
    { key: 'pending', label: t.pending || (lang === 'en' ? 'Pending' : '承認待ち'), count: pendingCount, color: '#A16207', bg: '#FEF9C3', border: '#FEF08A' },
    { key: 'confirmed', label: t.confirmed || (lang === 'en' ? 'Confirmed' : '確定済み'), count: confirmedCount, color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE' },
    { key: 'ongoing', label: t.ongoingOrders, count: ongoingCount, color: '#6D28D9', bg: '#F5F3FF', border: '#E9D5FF' },
    { key: 'completed', label: t.completedOrders, count: completedCount, color: '#059669', bg: '#ECFDF5', border: '#BBF7D0' },
    { key: 'cancelled', label: t.cancelledOrders, count: cancelledCount, color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
  ]

  // Filter logic
  const filteredBookings = statusFilter
    ? statusFilter === 'ongoing'
      ? bookings.filter(b => b.status === 'ongoing' || (b.status === 'scheduled' && b.scheduled_date >= today))
      : bookings.filter(b => b.status === statusFilter)
    : bookings

  // Group into upcoming / past (only when no filter active)
  const upcoming = filteredBookings.filter(b =>
    b.scheduled_date >= today && b.status !== 'completed' && b.status !== 'cancelled'
  ).sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date))

  const past = filteredBookings.filter(b =>
    b.scheduled_date < today || b.status === 'completed' || b.status === 'cancelled'
  )

  const handleCardClick = (key: string | null) => {
    setStatusFilter(prev => prev === key ? null : key)
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F9FAFB', fontFamily: "'Inter', 'Noto Sans JP', sans-serif" }}>
      <Sidebar lang={lang} onLangToggle={() => setLang(lang === 'en' ? 'jp' : 'en')} activeNav="orders" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} role="client" />

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
              boxShadow: lang === 'en' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
            }}>EN</button>
            <button onClick={() => setLang('jp')} style={{
              padding: '5px 10px', border: 'none', fontSize: '11px', fontWeight: 600, cursor: 'pointer',
              background: lang === 'jp' ? 'white' : 'transparent',
              color: lang === 'jp' ? '#1F2937' : '#6B7280',
              boxShadow: lang === 'jp' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
            }}>JP</button>
          </div>
        </header>

        <main className="tc-page-content" style={{ flex: 1, padding: '28px 32px 40px', maxWidth: '960px' }}>

          {/* ========== SCORECARDS ========== */}
          <div className="scorecards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '28px' }}>
            {scorecards.map(card => {
              const isActive = statusFilter === card.key
              return (
                <div
                  key={card.label}
                  onClick={() => handleCardClick(card.key)}
                  style={{
                    background: 'white',
                    border: `2px solid ${isActive ? card.color : '#E5E7EB'}`,
                    borderRadius: '12px',
                    padding: '16px 18px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: isActive ? `0 0 0 3px ${card.border}` : '0 1px 2px rgba(0,0,0,0.05)',
                    position: 'relative' as const,
                  }}
                  onMouseEnter={e => {
                    if (!isActive) e.currentTarget.style.borderColor = card.color
                  }}
                  onMouseLeave={e => {
                    if (!isActive) e.currentTarget.style.borderColor = '#E5E7EB'
                  }}
                >
                  <div style={{ fontSize: '26px', fontWeight: 800, color: card.color, lineHeight: 1, marginBottom: '4px' }}>
                    {card.count}
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 500, color: '#6B7280' }}>
                    {card.label}
                  </div>
                  {isActive && (
                    <div style={{
                      position: 'absolute' as const, top: '8px', right: '10px',
                      fontSize: '9px', fontWeight: 700, color: card.color,
                      background: card.bg, padding: '2px 6px', borderRadius: '4px',
                    }}>
                      {t.filtered}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* ========== FILTERED LIST ========== */}
          {statusFilter !== null ? (
            <>
              <h2 style={{
                fontSize: '13px', fontWeight: 700, color: '#9CA3AF',
                textTransform: 'uppercase' as const, letterSpacing: '1px',
                marginBottom: '12px',
              }}>
                {scorecards.find(c => c.key === statusFilter)?.label ?? t.allOrders}
              </h2>
              {filteredBookings.length === 0 ? (
                <div style={{
                  background: 'white', border: '1px solid #E5E7EB', borderRadius: '12px',
                  padding: '24px', textAlign: 'center', color: '#9CA3AF', fontSize: '13px',
                }}>
                  {t.noResults}
                </div>
              ) : (
                <>
                  {/* Desktop table */}
                  <div className="orders-table-wrap">
                    <OrderTable bookings={filteredBookings} lang={lang} t={t} onRowClick={(id) => router.push(`/client/orders/${id}`)} />
                  </div>
                  {/* Mobile cards */}
                  <div className="orders-cards-wrap">
                    {filteredBookings.map(b => (
                      <OrderCard key={b.id} booking={b} lang={lang}
                        onClick={() => router.push(`/client/orders/${b.id}`)} />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              {/* Upcoming */}
              <h2 style={{
                fontSize: '13px', fontWeight: 700, color: '#9CA3AF',
                textTransform: 'uppercase' as const, letterSpacing: '1px',
                marginBottom: '12px',
              }}>
                {t.upcomingCleanings}
              </h2>
              {upcoming.length === 0 ? (
                <div style={{
                  background: 'white', border: '1px solid #E5E7EB', borderRadius: '12px',
                  padding: '24px', textAlign: 'center', color: '#9CA3AF', fontSize: '13px',
                  marginBottom: '32px',
                }}>
                  {t.noUpcoming}
                </div>
              ) : (
                <div style={{ marginBottom: '32px' }}>
                  {/* Desktop table */}
                  <div className="orders-table-wrap">
                    <OrderTable bookings={upcoming} lang={lang} t={t} onRowClick={(id) => router.push(`/client/orders/${id}`)} />
                  </div>
                  {/* Mobile cards */}
                  <div className="orders-cards-wrap">
                    {upcoming.map(b => (
                      <OrderCard key={b.id} booking={b} lang={lang}
                        onClick={() => router.push(`/client/orders/${b.id}`)} />
                    ))}
                  </div>
                </div>
              )}

              {/* Past */}
              <h2 style={{
                fontSize: '13px', fontWeight: 700, color: '#9CA3AF',
                textTransform: 'uppercase' as const, letterSpacing: '1px',
                marginBottom: '12px',
              }}>
                {t.pastCleanings}
              </h2>
              {past.length === 0 ? (
                <div style={{
                  background: 'white', border: '1px solid #E5E7EB', borderRadius: '12px',
                  padding: '24px', textAlign: 'center', color: '#9CA3AF', fontSize: '13px',
                }}>
                  {t.noPast}
                </div>
              ) : (
                <div>
                  {/* Desktop table */}
                  <div className="orders-table-wrap">
                    <OrderTable bookings={past} lang={lang} t={t} onRowClick={(id) => router.push(`/client/orders/${id}`)} />
                  </div>
                  {/* Mobile cards */}
                  <div className="orders-cards-wrap">
                    {past.map(b => (
                      <OrderCard key={b.id} booking={b} lang={lang}
                        onClick={() => router.push(`/client/orders/${b.id}`)} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}

/* ================================================================
   DESKTOP TABLE COMPONENT
   ================================================================ */
function OrderTable({ bookings, lang, t, onRowClick }: {
  bookings: Booking[]; lang: 'en' | 'jp';
  t: typeof i18n['en']; onRowClick: (id: string) => void
}) {
  return (
    <table style={{
      width: '100%', borderCollapse: 'separate', borderSpacing: 0,
      background: 'white', border: '1px solid #E5E7EB', borderRadius: '12px',
      overflow: 'hidden', fontSize: '13px',
    }}>
      <thead>
        <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
          {[t.thDate, t.thService, t.thProperty, t.thStatus, t.thTime].map((h, i) => (
            <th key={i} style={{
              padding: '12px 16px', textAlign: 'left', fontSize: '11px',
              fontWeight: 700, color: '#6B7280', textTransform: 'uppercase',
              letterSpacing: '0.5px', borderBottom: '1px solid #E5E7EB',
            }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {bookings.map((b, idx) => {
          const d = new Date(b.scheduled_date + 'T00:00:00')
          const dateStr = lang === 'en'
            ? `${MONTHS_EN[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
            : `${d.getFullYear()}/${d.getMonth()+1}/${d.getDate()}`
          const dayStr = lang === 'en' ? DAYS_EN[d.getDay()] : DAYS_JP[d.getDay()]
          const s = getStatusStyle(b.status)
          const statusLabel = t[b.status as keyof typeof t] || b.status
          const propObj = b.properties as any
          const propName = propObj ? (Array.isArray(propObj) ? propObj[0]?.name : propObj.name) ?? '—' : '—'

          return (
            <tr key={b.id}
              onClick={() => onRowClick(b.id)}
              style={{
                cursor: 'pointer', transition: 'background 0.15s',
                borderBottom: idx < bookings.length - 1 ? '1px solid #F3F4F6' : 'none',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#F9FAFB')}
              onMouseLeave={e => (e.currentTarget.style.background = 'white')}
            >
              <td style={{ padding: '14px 16px', fontWeight: 600, color: '#1F2937', whiteSpace: 'nowrap' }}>
                {dateStr}
                <span style={{ color: '#9CA3AF', fontWeight: 400, marginLeft: '6px', fontSize: '11px' }}>{dayStr}</span>
              </td>
              <td style={{ padding: '14px 16px', color: '#374151' }}>
                {b.service_type}
              </td>
              <td style={{ padding: '14px 16px', color: '#6B7280' }}>
                {propName}
              </td>
              <td style={{ padding: '14px 16px' }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  padding: '4px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 600,
                  background: s.bg, color: s.color, border: `1px solid ${s.border}`,
                }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'currentColor' }} />
                  {statusLabel}
                </span>
              </td>
              <td style={{ padding: '14px 16px', color: '#6B7280', fontSize: '12px' }}>
                {b.scheduled_time || '—'}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
