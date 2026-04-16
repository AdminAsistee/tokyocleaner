'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, RefreshCw, AlertCircle, X, Send, CheckCircle2, Clock, XCircle, ImageOff } from 'lucide-react'
import { useLang } from '@/hooks/useLang'

const MOCK_ORDERS: Record<string, {
  id: string; shortId: string; date: string; status: string;
  serviceType: string; hours: number; price: number;
  property: string; address: string; staffName: string;
}> = {
  '0001': { id: '0001', shortId: 'TC-A1B2C3', date: 'April 9, 2026', status: 'completed', serviceType: 'Regular Cleaning', hours: 2.5, price: 8500, property: 'Shibuya Apt 3F', address: 'Shibuya-ku, Jinnan 1-2-3', staffName: 'Tanaka S.' },
  '0002': { id: '0002', shortId: 'TC-D4E5F6', date: 'April 15, 2026', status: 'scheduled', serviceType: 'Deep Cleaning', hours: 0, price: 14000, property: 'Shinjuku Studio', address: 'Shinjuku-ku, Kabukicho 2-5', staffName: 'Yamamoto K.' },
  '0003': { id: '0003', shortId: 'TC-G7H8I9', date: 'March 28, 2026', status: 'completed', serviceType: 'Regular Cleaning', hours: 2, price: 7500, property: 'Shibuya Apt 3F', address: 'Shibuya-ku, Jinnan 1-2-3', staffName: 'Suzuki M.' },
  '0004': { id: '0004', shortId: 'TC-J1K2L3', date: 'March 14, 2026', status: 'completed', serviceType: 'Move-out Cleaning', hours: 4, price: 22000, property: 'Minato Mansion', address: 'Minato-ku, Roppongi 4-1', staffName: 'Tanaka S.' },
  '0005': { id: '0005', shortId: 'TC-M4N5O6', date: 'February 20, 2026', status: 'cancelled', serviceType: 'Regular Cleaning', hours: 0, price: 8500, property: 'Shibuya Apt 3F', address: 'Shibuya-ku, Jinnan 1-2-3', staffName: '' },
}

const STATUS_CONFIG: Record<string, { label: string; labelJp: string; bg: string; color: string; icon: React.ReactNode }> = {
  completed:   { label: 'Completed',   labelJp: '完了済み',   bg: '#ECFDF5', color: '#059669', icon: <CheckCircle2 size={13} /> },
  confirmed:   { label: 'Confirmed',   labelJp: '確定済み',   bg: '#EFF6FF', color: '#1D4ED8', icon: <CheckCircle2 size={13} /> },
  pending:     { label: 'Pending',     labelJp: '承認待ち',   bg: '#FEF9C3', color: '#A16207', icon: <Clock size={13} /> },
  scheduled:   { label: 'Scheduled',   labelJp: '予定',       bg: '#FFF7ED', color: '#C2410C', icon: <Clock size={13} /> },
  cancelled:   { label: 'Cancelled',   labelJp: 'キャンセル', bg: '#FEF2F2', color: '#DC2626', icon: <XCircle size={13} /> },
  in_progress: { label: 'In Progress', labelJp: '進行中',     bg: '#F5F3FF', color: '#6D28D9', icon: <Loader2 size={13} /> },
}

function Avatar({ name }: { name: string }) {
  const colors = ['#0EA5A0','#6366F1','#F59E0B','#10B981','#8B5CF6']
  const color = colors[name.charCodeAt(0) % colors.length]
  return (
    <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1rem', flexShrink: 0, textTransform: 'uppercase' }}>
      {name.charAt(0)}
    </div>
  )
}

export default function PreviewOrderDetail({ params }: { params: { orderId: string } }) {
  const [lang, setLang] = useLang()
  const [showContact, setShowContact] = useState(false)
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)
  const router = useRouter()

  const order = MOCK_ORDERS[params.orderId] ?? MOCK_ORDERS['0001']
  const status = STATUS_CONFIG[order.status] ?? STATUS_CONFIG['scheduled']

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F9FAFB', fontFamily: "'Inter', sans-serif" }}>
      {/* Sidebar (simplified for preview) */}
      <aside style={{ width: '220px', background: 'white', borderRight: '1px solid #E5E7EB', position: 'fixed', left: 0, top: 0, bottom: 0, display: 'flex', flexDirection: 'column' }}>
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
          <div style={{ fontSize: '10px', fontWeight: 700, color: '#9CA3AF', letterSpacing: '1.2px', textTransform: 'uppercase', padding: '12px 8px 4px' }}>{lang === 'en' ? 'PORTAL' : 'ポータル'}</div>
          {[{ label: lang === 'en' ? 'Dashboard' : 'ダッシュボード', active: false }, { label: lang === 'en' ? 'My Orders' : '注文履歴', active: true }, { label: lang === 'en' ? 'My Property' : '物件情報', active: false }].map(item => (
            <div key={item.label} style={{ padding: '9px 10px', borderRadius: '8px', marginBottom: '2px', cursor: 'pointer', background: item.active ? '#E6F8F7' : 'transparent', color: item.active ? '#0B8A86' : '#4B5563', fontWeight: item.active ? 600 : 500, fontSize: '13px' }}>
              {item.label}
            </div>
          ))}
        </div>
        <div style={{ padding: '12px 10px', borderTop: '1px solid #F3F4F6' }}>
          <button onClick={() => setLang(lang === 'en' ? 'jp' : 'en')} style={{ width: '100%', padding: '8px 10px', background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', fontSize: '12px', textAlign: 'left', borderRadius: '8px' }}>
            🌐 {lang === 'en' ? '日本語に切替' : 'Switch to English'}
          </button>
        </div>
      </aside>

      <div style={{ flex: 1, marginLeft: '220px', display: 'flex', flexDirection: 'column' }}>
        {/* Preview banner */}
        <div style={{ background: '#0EA5A0', color: 'white', padding: '10px 32px', fontSize: '13px', fontWeight: 500 }}>
          👁 Preview Mode — <a href="/preview" style={{ color: 'white', fontWeight: 700 }}>← Back to Dashboard Preview</a>
        </div>

        {/* Top bar */}
        <header style={{ height: '60px', background: 'white', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', position: 'sticky', top: 0, zIndex: 90 }}>
          <button onClick={() => router.push('/preview')} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', fontWeight: 600, fontSize: '13px' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#0EA5A0')} onMouseLeave={e => (e.currentTarget.style.color = '#6B7280')}>
            <ArrowLeft size={16}/> {lang === 'en' ? 'Back to History' : '履歴へ戻る'}
          </button>
          <div style={{ background: '#F3F4F6', borderRadius: '100px', padding: '3px', display: 'flex' }}>
            {(['en', 'jp'] as const).map(l => (
              <button key={l} onClick={() => setLang(l)} style={{ padding: '4px 12px', border: 'none', borderRadius: '100px', cursor: 'pointer', fontSize: '10px', fontWeight: 700, background: lang === l ? '#111827' : 'transparent', color: lang === l ? 'white' : '#9CA3AF' }}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </header>

        {/* Content */}
        <main style={{ padding: '32px', maxWidth: '800px', width: '100%', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F1F3D', marginBottom: '4px' }}>Order #{order.shortId}</h1>
              <div style={{ fontSize: '14px', color: '#6B7280' }}>
                {order.status === 'completed' ? (lang === 'en' ? 'Cleaning completed on ' : '清掃完了日：') : (lang === 'en' ? 'Scheduled for ' : '予定日：')}
                {order.date}
              </div>
            </div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', padding: '6px 14px', borderRadius: '100px', background: status.bg, color: status.color }}>
              {status.icon} {lang === 'jp' ? status.labelJp : status.label}
            </span>
          </div>

          {/* Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
            {/* Service Details */}
            <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '16px' }}>{lang === 'en' ? 'Service Details' : 'サービス詳細'}</span>
              {[
                { key: lang === 'en' ? 'Type' : 'タイプ', val: order.serviceType },
                { key: lang === 'en' ? 'Duration' : '所要時間', val: order.hours ? `${order.hours} ${lang === 'en' ? 'Hours' : '時間'}` : '—' },
                { key: lang === 'en' ? 'Amount Paid' : 'お支払い金額', val: `¥${order.price.toLocaleString()} (${lang === 'en' ? 'Vat incl.' : '税込'})` },
              ].map(({ key, val }) => (
                <div key={key} style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '2px' }}>{key}</div>
                  <div style={{ fontWeight: 700, color: '#0F1F3D', fontSize: '15px' }}>{val}</div>
                </div>
              ))}
            </div>

            {/* Staff Card */}
            <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '16px' }}>{lang === 'en' ? 'Your Staff' : '清掃スタッフ'}</span>
              {order.staffName ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <Avatar name={order.staffName} />
                    <div>
                      <div style={{ fontWeight: 700, color: '#111827' }}>{order.staffName}</div>
                      <div style={{ fontSize: '12px', color: '#6B7280' }}>{lang === 'en' ? 'Certified Pro' : '公認プロ'}</div>
                    </div>
                  </div>
                  <div style={{ paddingTop: '16px', borderTop: '1px solid #F3F4F6' }}>
                    <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>{lang === 'en' ? 'Location' : '物件住所'}</div>
                    <div style={{ fontWeight: 600, color: '#0F1F3D', fontSize: '13px' }}>{order.address}</div>
                  </div>
                </>
              ) : (
                <div style={{ color: '#9CA3AF', fontSize: '13px' }}>
                  <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>{lang === 'en' ? 'Location' : '物件住所'}</div>
                  <div style={{ fontWeight: 600, color: '#0F1F3D', fontSize: '13px' }}>{order.address}</div>
                </div>
              )}
            </div>
          </div>

          {/* Photo Gallery */}
          <section style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '24px', marginBottom: '32px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '16px' }}>{lang === 'en' ? 'Proof of Service (After Photos)' : 'クオリティ保証（清掃後の写真）'}</span>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', color: '#9CA3AF', gap: '12px' }}>
              <ImageOff size={32}/>
              <p style={{ fontSize: '13px', textAlign: 'center', maxWidth: '260px', lineHeight: 1.6 }}>
                {lang === 'en' ? 'Photos will appear here after the cleaning is completed.' : '清掃完了後に写真が表示されます。'}
              </p>
            </div>
          </section>

          {/* Action Bar */}
          <div style={{ display: 'flex', gap: '16px', borderTop: '1px solid #E5E7EB', paddingTop: '32px' }}>
            <button onClick={() => alert('Opens Calendly pre-filled with property details')} style={{ flex: 2, padding: '15px', background: '#0EA5A0', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#0B8A86')} onMouseLeave={e => (e.currentTarget.style.background = '#0EA5A0')}>
              <RefreshCw size={16}/> {lang === 'en' ? 'Book This Again' : '同じ内容で再度予約する'}
            </button>
            <button onClick={() => setShowContact(true)} style={{ flex: 1, padding: '15px', background: 'transparent', color: '#4B5563', border: '1.5px solid #E5E7EB', borderRadius: '8px', fontSize: '15px', fontWeight: 700, cursor: 'pointer' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F9FAFB'; (e.currentTarget as HTMLElement).style.borderColor = '#9CA3AF' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.borderColor = '#E5E7EB' }}>
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <AlertCircle size={16}/> {lang === 'en' ? 'Report Issue' : '問題を報告する'}
              </span>
            </button>
          </div>
        </main>
      </div>

      {/* Contact Modal */}
      {showContact && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }} onClick={() => setShowContact(false)}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>{lang === 'en' ? 'Report an Issue' : '問題を報告する'}</h2>
              <button onClick={() => setShowContact(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}><X size={20}/></button>
            </div>
            {!sent ? (
              <form onSubmit={e => { e.preventDefault(); setTimeout(() => setSent(true), 800) }}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>{lang === 'en' ? 'Subject' : '件名'}</label>
                  <input value={subject} onChange={e => setSubject(e.target.value)} required style={{ width: '100%', padding: '10px 14px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', outline: 'none' }} />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>{lang === 'en' ? 'Message' : 'メッセージ'}</label>
                  <textarea value={message} onChange={e => setMessage(e.target.value)} required rows={4} style={{ width: '100%', padding: '10px 14px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }} />
                </div>
                <button type="submit" style={{ width: '100%', padding: '12px', background: '#0EA5A0', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Send size={15}/> {lang === 'en' ? 'Send Report' : '送信する'}
                </button>
              </form>
            ) : (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div style={{ width: '52px', height: '52px', background: '#ECFDF5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <CheckCircle2 size={26} color="#059669"/>
                </div>
                <p style={{ color: '#374151', lineHeight: 1.6, marginBottom: '20px' }}>{lang === 'en' ? "Report sent! We'll get back to you shortly." : 'ご報告ありがとうございます。担当者よりご連絡いたします。'}</p>
                <button onClick={() => { setShowContact(false); setSent(false); setSubject(''); setMessage('') }} style={{ padding: '10px 24px', background: '#F3F4F6', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: '#374151' }}>
                  {lang === 'en' ? 'Close' : '閉じる'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
