'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Globe, LogOut, LayoutDashboard, CalendarDays, Building2, Settings, HelpCircle, X } from 'lucide-react'

interface SidebarProps {
  lang: 'en' | 'jp'
  onLangToggle: () => void
  activeNav?: string
  isOpen: boolean
  onClose: () => void
}

const i18n = {
  en: { portal: 'PORTAL', account: 'ACCOUNT', dashboard: 'Dashboard', myOrders: 'My Orders', myProperty: 'My Property', settings: 'Settings', help: 'Help', signOut: 'Sign Out', langSwitch: '日本語に切替' },
  jp: { portal: 'ポータル', account: 'アカウント', dashboard: 'ダッシュボード', myOrders: '注文履歴', myProperty: '物件情報', settings: '設定', help: 'ヘルプ', signOut: 'サインアウト', langSwitch: 'Switch to English' },
}

export default function Sidebar({ lang, onLangToggle, activeNav = 'dashboard', isOpen, onClose }: SidebarProps) {
  const router = useRouter()
  const [hovered, setHovered] = useState(false)
  const t = i18n[lang]

  const expanded = hovered // desktop: expand on hover

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const navItems = [
    { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: t.dashboard, href: '/dashboard' },
    { id: 'orders',    icon: <CalendarDays size={20} />,    label: t.myOrders,   href: '/dashboard/orders' },
    { id: 'property',  icon: <Building2 size={20} />,       label: t.myProperty, href: '/dashboard/property' },
  ]

  const accountItems = [
    { id: 'settings', icon: <Settings size={20} />, label: t.settings, href: '/dashboard/settings' },
    { id: 'help',     icon: <HelpCircle size={20} />, label: t.help, href: '#' },
  ]

  // Shared nav item style
  const navItemStyle = (isActive: boolean): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: expanded ? '10px 16px' : '10px 0',
    justifyContent: expanded ? 'flex-start' : 'center',
    borderRadius: '10px', marginBottom: '2px',
    textDecoration: 'none', fontSize: '13px',
    fontWeight: isActive ? 600 : 500,
    color: isActive ? '#0B8A86' : '#4B5563',
    background: isActive ? '#E6F8F7' : 'transparent',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap', overflow: 'hidden',
    cursor: 'pointer',
    minHeight: '40px',
  })

  return (
    <>
      {/* ===== MOBILE OVERLAY ===== */}
      {isOpen && (
        <div
          className="tc-sidebar-overlay-mobile"
          onClick={onClose}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.45)', zIndex: 90,
          }}
        />
      )}

      {/* ===== SIDEBAR ===== */}
      <aside
        className={`tc-sidebar ${isOpen ? 'open' : ''}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: expanded ? '260px' : undefined,  // CSS sets default 72px/260px via class
          boxShadow: expanded ? '4px 0 24px rgba(0,0,0,0.08)' : 'none',
        }}
      >
        {/* ===== LOGO ===== */}
        <div style={{
          padding: expanded ? '20px 20px 16px' : '20px 0 16px',
          borderBottom: '1px solid #F3F4F6',
          display: 'flex', alignItems: 'center', justifyContent: expanded ? 'space-between' : 'center',
          minHeight: '64px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #0EA5A0, #0B8A86)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '18px', flexShrink: 0,
            }}>🧹</div>
            {expanded && (
              <div style={{ opacity: 1, transition: 'opacity 0.2s ease 0.1s' }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#111827', lineHeight: 1.2 }}>TokyoCleaner</div>
                <div style={{ fontSize: '0.68rem', color: '#9CA3AF' }}>Customer Portal</div>
              </div>
            )}
          </div>
          {/* Close X — mobile only */}
          <button
            onClick={onClose}
            className="tc-sidebar-close"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#9CA3AF', padding: '4px', borderRadius: '6px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* ===== NAV ITEMS ===== */}
        <div style={{ flex: 1, padding: expanded ? '8px 12px' : '8px 16px', overflowY: 'auto', overflowX: 'hidden' }}>
          {expanded && (
            <div style={{
              fontSize: '10px', fontWeight: 700, color: '#9CA3AF',
              letterSpacing: '1.2px', textTransform: 'uppercase',
              padding: '12px 16px 6px',
              transition: 'opacity 0.2s',
            }}>{t.portal}</div>
          )}

          {navItems.map(item => (
            <a key={item.id} href={item.href} onClick={onClose}
              title={!expanded ? item.label : undefined}
              style={navItemStyle(activeNav === item.id)}
              onMouseEnter={e => { if (activeNav !== item.id) e.currentTarget.style.background = '#F3F4F6' }}
              onMouseLeave={e => { if (activeNav !== item.id) e.currentTarget.style.background = 'transparent' }}
            >
              <span style={{ flexShrink: 0, display: 'flex' }}>{item.icon}</span>
              {expanded && <span>{item.label}</span>}
            </a>
          ))}

          {/* Separator */}
          <div style={{ height: '1px', background: '#F3F4F6', margin: expanded ? '12px 0' : '12px 0' }} />

          {expanded && (
            <div style={{
              fontSize: '10px', fontWeight: 700, color: '#9CA3AF',
              letterSpacing: '1.2px', textTransform: 'uppercase',
              padding: '8px 16px 6px',
            }}>{t.account}</div>
          )}

          {accountItems.map(item => (
            <a key={item.id} href={item.href} onClick={onClose}
              title={!expanded ? item.label : undefined}
              style={navItemStyle(activeNav === item.id)}
              onMouseEnter={e => { if (activeNav !== item.id) e.currentTarget.style.background = '#F3F4F6' }}
              onMouseLeave={e => { if (activeNav !== item.id) e.currentTarget.style.background = 'transparent' }}
            >
              <span style={{ flexShrink: 0, display: 'flex' }}>{item.icon}</span>
              {expanded && <span>{item.label}</span>}
            </a>
          ))}
        </div>

        {/* ===== BOTTOM ===== */}
        <div style={{
          padding: expanded ? '12px 16px' : '12px 16px',
          borderTop: '1px solid #F3F4F6',
        }}>
          {/* Language toggle */}
          <button onClick={onLangToggle}
            title={!expanded ? t.langSwitch : undefined}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              justifyContent: expanded ? 'flex-start' : 'center',
              width: '100%', padding: '9px 0', borderRadius: '8px',
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: '#6B7280', fontSize: '12px', marginBottom: '2px',
              transition: 'all 0.2s',
            }}>
            <Globe size={18} style={{ flexShrink: 0 }} />
            {expanded && <span>{t.langSwitch}</span>}
          </button>

          {/* Sign out */}
          <button onClick={handleSignOut}
            title={!expanded ? t.signOut : undefined}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              justifyContent: expanded ? 'flex-start' : 'center',
              width: '100%', padding: '9px 0', borderRadius: '8px',
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: '#DC2626', fontSize: '12px',
              transition: 'all 0.2s',
            }}>
            <LogOut size={18} style={{ flexShrink: 0 }} />
            {expanded && <span style={{ fontWeight: 600 }}>{t.signOut}</span>}
          </button>
        </div>
      </aside>
    </>
  )
}
