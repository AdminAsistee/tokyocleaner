'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ChevronRight, Clock, CheckCircle2, XCircle, Loader2, Globe, LogOut, LayoutDashboard, CalendarDays, Building2, Settings, HelpCircle } from 'lucide-react'
import { useLang } from '@/hooks/useLang'

// ── MOCK DATA ──────────────────────────────────────────────
const MOCK_BOOKINGS = [
  { id: 'a1b2c3d4-0001', scheduled_date: '2026-04-09', service_type: 'Regular Cleaning',  status: 'completed', properties: [{ name: 'Shibuya Apt 3F',    address: 'Shibuya-ku, Jinnan 1-2-3' }] },
  { id: 'a1b2c3d4-0002', scheduled_date: '2026-04-15', service_type: 'Deep Cleaning',      status: 'scheduled', properties: [{ name: 'Shinjuku Studio',   address: 'Shinjuku-ku, Kabukicho 2-5' }] },
  { id: 'a1b2c3d4-0006', scheduled_date: '2026-04-15', service_type: 'Regular Cleaning',  status: 'ongoing',   properties: [{ name: 'Roppongi Hills 8F', address: 'Minato-ku, Roppongi 6-10' }] },
  { id: 'a1b2c3d4-0003', scheduled_date: '2026-03-28', service_type: 'Regular Cleaning',  status: 'completed', properties: [{ name: 'Shibuya Apt 3F',    address: 'Shibuya-ku, Jinnan 1-2-3' }] },
  { id: 'a1b2c3d4-0004', scheduled_date: '2026-03-14', service_type: 'Move-out Cleaning', status: 'completed', properties: [{ name: 'Minato Mansion',    address: 'Minato-ku, Roppongi 4-1' }] },
  { id: 'a1b2c3d4-0005', scheduled_date: '2026-02-20', service_type: 'Regular Cleaning',  status: 'cancelled', properties: [{ name: 'Shibuya Apt 3F',    address: 'Shibuya-ku, Jinnan 1-2-3' }] },
]

const STATUS_CONFIG: Record<string, { label: string; labelJp: string; badgeBg: string; badgeColor: string; icon: React.ReactNode }> = {
  completed: { label: 'Completed', labelJp: '完了',       badgeBg: '#ECFDF5', badgeColor: '#059669', icon: <CheckCircle2 size={11} /> },
  confirmed: { label: 'Confirmed', labelJp: '確定済み',   badgeBg: '#EFF6FF', badgeColor: '#1D4ED8', icon: <CheckCircle2 size={11} /> },
  pending:   { label: 'Pending',   labelJp: '承認待ち',   badgeBg: '#FEF9C3', badgeColor: '#A16207', icon: <Clock size={11} /> },
  scheduled: { label: 'Scheduled', labelJp: '予定',       badgeBg: '#FFF7ED', badgeColor: '#C2410C', icon: <Clock size={11} /> },
  ongoing:   { label: 'Ongoing',   labelJp: '進行中',     badgeBg: '#F5F3FF', badgeColor: '#6D28D9', icon: <Loader2 size={11} /> },
  cancelled: { label: 'Cancelled', labelJp: 'キャンセル', badgeBg: '#FEF2F2', badgeColor: '#DC2626', icon: <XCircle size={11} /> },
}

const i18n = {
  en: { portal: 'PORTAL', account: 'ACCOUNT', dashboard: 'Dashboard', myOrders: 'My Orders', myProperty: 'My Property', settings: 'Settings', help: 'Help', greeting: 'Good day,', subtitle: "Here's your cleaning service overview", totalOrders: 'Total Orders', completed: 'Completed', upcoming: 'Upcoming', ongoing: 'Ongoing', recentOrders: 'Recent Orders', date: 'Date', property: 'Property', service: 'Service Type', status: 'Status', search: 'Search...', allStatus: 'All Status', noOrders: 'No orders found.', langSwitch: '日本語に切替', previewBanner: '👁 Preview Mode — No login required. Click any row to see the Order Detail page.' },
  jp: { portal: 'ポータル', account: 'アカウント', dashboard: 'ダッシュボード', myOrders: '注文履歴', myProperty: '物件情報', settings: '設定', help: 'ヘルプ', greeting: 'こんにちは、', subtitle: 'クリーニングサービスの概要', totalOrders: '総注文数', completed: '完了済み', upcoming: '予定', ongoing: '進行中', recentOrders: '最近の注文', date: '日付', property: 'プロパティ', service: 'サービス種類', status: 'ステータス', search: '検索...', allStatus: '全ステータス', noOrders: '注文が見つかりません。', langSwitch: 'Switch to English', previewBanner: '👁 プレビューモード — ログイン不要。行をクリックして注文詳細ページを確認できます。' },
}

export default function PreviewDashboard() {
  const [lang, setLang] = useLang()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const router = useRouter()
  const t = i18n[lang]

  const filtered = MOCK_BOOKINGS.filter(b => {
    const matchStatus = statusFilter === 'all' || b.status === statusFilter
    const s = search.toLowerCase()
    const matchSearch = !search || b.properties?.[0]?.name?.toLowerCase().includes(s) || b.service_type?.toLowerCase().includes(s)
    return matchStatus && matchSearch
  })

  const stats = {
    total:     MOCK_BOOKINGS.length,
    completed: MOCK_BOOKINGS.filter(b => b.status === 'completed').length,
    scheduled: MOCK_BOOKINGS.filter(b => b.status === 'scheduled').length,
    ongoing:   MOCK_BOOKINGS.filter(b => b.status === 'ongoing').length,
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F9FAFB', fontFamily: "'Inter', sans-serif" }}>
      {/* Sidebar */}
      <aside style={{ width: '220px', background: 'white', borderRight: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', position: 'fixed', left: 0, top: 0, bottom: 0 }}>
        <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid #F3F4F6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#0EA5A0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>🧹</div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>TokyoCleaner</div>
              <div style={{ fontSize: '11px', color: '#9CA3AF' }}>Customer Portal</div>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, padding: '8px 10px' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, color: '#9CA3AF', letterSpacing: '1.2px', textTransform: 'uppercase', padding: '12px 8px 4px' }}>{t.portal}</div>
          {[
            { icon: <LayoutDashboard size={16}/>, label: t.dashboard, active: false },
            { icon: <CalendarDays size={16}/>, label: t.myOrders, active: true, badge: MOCK_BOOKINGS.length },
            { icon: <Building2 size={16}/>, label: t.myProperty, active: false },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 10px', borderRadius: '8px', marginBottom: '2px', cursor: 'pointer', background: item.active ? '#E6F8F7' : 'transparent', color: item.active ? '#0B8A86' : '#4B5563', fontWeight: item.active ? 600 : 500, fontSize: '13px' }}>
              {item.icon} {item.label}
              {item.badge && <span style={{ marginLeft: 'auto', background: '#0EA5A0', color: 'white', fontSize: '10px', fontWeight: 700, padding: '1px 7px', borderRadius: '100px' }}>{item.badge}</span>}
            </div>
          ))}

          <div style={{ fontSize: '10px', fontWeight: 700, color: '#9CA3AF', letterSpacing: '1.2px', textTransform: 'uppercase', padding: '16px 8px 4px' }}>{t.account}</div>
          {[{ icon: <Settings size={16}/>, label: t.settings }, { icon: <HelpCircle size={16}/>, label: t.help }].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 10px', borderRadius: '8px', cursor: 'pointer', color: '#4B5563', fontSize: '13px', fontWeight: 500 }}>{item.icon} {item.label}</div>
          ))}
        </div>

        <div style={{ padding: '12px 10px', borderTop: '1px solid #F3F4F6' }}>
          <button onClick={() => setLang(lang === 'en' ? 'jp' : 'en')} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 10px', background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', fontSize: '12px', borderRadius: '8px' }}>
            <Globe size={14}/> {t.langSwitch}
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 10px', background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', fontSize: '12px', borderRadius: '8px' }}>
            <LogOut size={14}/> {lang === 'en' ? 'Sign Out' : 'サインアウト'}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, marginLeft: '220px', padding: '0' }}>
        {/* Preview Banner */}
        <div style={{ background: '#0EA5A0', color: 'white', padding: '10px 32px', fontSize: '13px', fontWeight: 500 }}>
          {t.previewBanner}
        </div>

        <div style={{ padding: '32px 36px' }}>
          {/* Greeting */}
          <div style={{ marginBottom: '28px' }}>
            <p style={{ color: '#6B7280', fontSize: '14px', margin: '0 0 2px' }}>{t.greeting} <strong style={{ color: '#111827' }}>demo_user</strong></p>
            <p style={{ color: '#9CA3AF', margin: 0, fontSize: '13px' }}>{t.subtitle}</p>
          </div>

          {/* Stats — clickable to filter */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' }}>
            {[
              { label: t.totalOrders, value: stats.total,     filterKey: 'all',       color: '#0EA5A0', activeBg: '#E6F8F7' },
              { label: t.completed,   value: stats.completed, filterKey: 'completed', color: '#059669', activeBg: '#ECFDF5' },
              { label: t.upcoming,    value: stats.scheduled, filterKey: 'scheduled', color: '#2563EB', activeBg: '#EFF6FF' },
              { label: t.ongoing,     value: stats.ongoing,   filterKey: 'ongoing',   color: '#C2410C', activeBg: '#FFF7ED' },
            ].map(s => {
              const isActive = statusFilter === s.filterKey
              return (
                <div key={s.label}
                  onClick={() => setStatusFilter(isActive && s.filterKey !== 'all' ? 'all' : s.filterKey)}
                  style={{
                    background: isActive ? s.activeBg : 'white',
                    border: `2px solid ${isActive ? s.color : '#E5E7EB'}`,
                    borderRadius: '12px', padding: '18px 20px',
                    boxShadow: isActive ? `0 0 0 3px ${s.color}22` : '0 1px 2px rgba(0,0,0,0.05)',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.borderColor = s.color }}
                  onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.borderColor = '#E5E7EB' }}>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px', fontWeight: isActive ? 600 : 400 }}>{s.label}</div>
                  {isActive && s.filterKey !== 'all' && (
                    <div style={{ fontSize: '10px', color: s.color, fontWeight: 700, marginTop: '4px' }}>✓ Filtered</div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Table */}
          <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#111827' }}>{t.recentOrders}</h2>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ position: 'relative' }}>
                  <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t.search}
                    style={{ padding: '8px 12px 8px 30px', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', color: '#111827', outline: 'none', width: '180px' }} />
                </div>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                  style={{ padding: '8px 12px', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', color: '#111827', cursor: 'pointer', outline: 'none' }}>
                  <option value="all">{t.allStatus}</option>
                  <option value="completed">{t.completed}</option>
                  <option value="scheduled">{t.upcoming}</option>
                  <option value="ongoing">{t.ongoing}</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px', color: '#9CA3AF', fontSize: '14px' }}>{t.noOrders}</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#F9FAFB' }}>
                    {[t.date, t.property, t.service, t.status, ''].map((h, i) => (
                      <th key={i} style={{ padding: '10px 20px', textAlign: 'left', color: '#6B7280', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #F3F4F6' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((b, idx) => {
                    const s = STATUS_CONFIG[b.status] ?? STATUS_CONFIG['scheduled']
                    return (
                      <tr key={b.id}
                        onClick={() => router.push(`/preview/order/${b.id.slice(-4)}`)}
                        style={{ borderBottom: idx < filtered.length - 1 ? '1px solid #F9FAFB' : 'none', cursor: 'pointer', transition: 'background 0.1s' }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#F0FDF4')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                        <td style={{ padding: '14px 20px', color: '#111827', fontWeight: 500 }}>
                          {new Date(b.scheduled_date).toLocaleDateString(lang === 'jp' ? 'ja-JP' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td style={{ padding: '14px 20px', fontWeight: 600, color: '#111827' }}>{b.properties?.[0]?.name ?? '—'}</td>
                        <td style={{ padding: '14px 20px', color: '#6B7280' }}>{b.service_type}</td>
                        <td style={{ padding: '14px 20px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '999px', textTransform: 'uppercase', letterSpacing: '0.06em', background: s.badgeBg, color: s.badgeColor }}>
                            {s.icon} {lang === 'jp' ? s.labelJp : s.label}
                          </span>
                        </td>
                        <td style={{ padding: '14px 20px', textAlign: 'right' }}><ChevronRight size={16} style={{ color: '#0EA5A0' }} /></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
