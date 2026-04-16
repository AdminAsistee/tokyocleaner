'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, RefreshCw, AlertCircle, X, Send, CheckCircle2, Clock, XCircle, Loader2, ImageOff } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import { useLang } from '@/hooks/useLang'

// Placeholder — swap with real Calendly URL before launch
const CALENDLY_URL = 'https://calendly.com/tokyocleaner/cleaning'

const i18n = {
  en: {
    backToHistory: 'Back to History',
    completedOn: 'Cleaning completed on',
    scheduledFor: 'Scheduled for',
    serviceDetails: 'Service Details',
    type: 'Type',
    duration: 'Duration',
    amountPaid: 'Amount Paid',
    vatIncl: 'Vat incl.',
    yourStaff: 'Your Staff',
    certifiedPro: 'Certified Pro',
    location: 'Location',
    proofOfService: 'Proof of Service (After Photos)',
    noPhotos: 'Photos will appear here after the cleaning is completed.',
    bookAgain: 'Book This Again',
    reportIssue: 'Report Issue',
    hours: 'Hours',
    // Contact form
    reportTitle: 'Report an Issue',
    reportSubject: 'Subject',
    reportMessage: 'Message',
    reportSubmit: 'Send Report',
    reportSending: 'Sending...',
    reportSuccess: 'Report sent! We\'ll get back to you shortly.',
    reportClose: 'Close',
  },
  jp: {
    backToHistory: '履歴へ戻る',
    completedOn: '清掃完了日：',
    scheduledFor: '予定日：',
    serviceDetails: 'サービス詳細',
    type: 'タイプ',
    duration: '所要時間',
    amountPaid: 'お支払い金額',
    vatIncl: '税込',
    yourStaff: '清掃スタッフ',
    certifiedPro: '公認プロ',
    location: '物件住所',
    proofOfService: 'クオリティ保証（清掃後の写真）',
    noPhotos: '清掃完了後に写真が表示されます。',
    bookAgain: '同じ内容で再度予約する',
    reportIssue: '問題を報告する',
    hours: '時間',
    reportTitle: '問題を報告する',
    reportSubject: '件名',
    reportMessage: 'メッセージ',
    reportSubmit: '送信する',
    reportSending: '送信中...',
    reportSuccess: 'ご報告ありがとうございます。担当者よりご連絡いたします。',
    reportClose: '閉じる',
  },
}

const STATUS_CONFIG: Record<string, { label: string; labelJp: string; bg: string; color: string; icon: React.ReactNode }> = {
  completed:   { label: 'Completed',   labelJp: '完了済み',   bg: '#ECFDF5', color: '#059669', icon: <CheckCircle2 size={13} /> },
  confirmed:   { label: 'Confirmed',   labelJp: '確定済み',   bg: '#EFF6FF', color: '#1D4ED8', icon: <CheckCircle2 size={13} /> },
  pending:     { label: 'Pending',     labelJp: '承認待ち',   bg: '#FEF9C3', color: '#A16207', icon: <Clock size={13} /> },
  scheduled:   { label: 'Scheduled',   labelJp: '予定',       bg: '#FFF7ED', color: '#C2410C', icon: <Clock size={13} /> },
  cancelled:   { label: 'Cancelled',   labelJp: 'キャンセル', bg: '#FEF2F2', color: '#DC2626', icon: <XCircle size={13} /> },
  in_progress: { label: 'In Progress', labelJp: '進行中',     bg: '#F5F3FF', color: '#6D28D9', icon: <Loader2 size={13} /> },
}

// CSS initials avatar — colored based on name
function Avatar({ name }: { name: string }) {
  const colors = ['#0EA5A0', '#6366F1', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#EC4899']
  const color = colors[name.charCodeAt(0) % colors.length]
  return (
    <div style={{
      width: '44px', height: '44px', borderRadius: '50%',
      background: color, display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'white', fontWeight: 700, fontSize: '1rem', flexShrink: 0,
      textTransform: 'uppercase',
    }}>
      {name.charAt(0)}
    </div>
  )
}

interface Booking {
  id: string
  scheduled_date: string
  scheduled_time: string
  service_type: string
  status: string
  cleaning_price: number
  notes: string
  // Supabase returns joins as arrays even for single related rows
  properties: Array<{ name: string; address: string }> | null
  cleanings: Array<{
    id: string
    actual_hours: number
    notes: string
    cleaning_staff_assignments: Array<{
      // staff is also a nested join — Supabase returns it as an array
      staff: Array<{ display_name: string; full_name: string }> | null
    }>
  }> | null
  order_photos: Array<{ storage_path: string; photo_type: string }> | null
}

export default function OrderDetailClient({ booking }: { booking: Booking }) {
  const [lang, setLang] = useLang()
  const [showContact, setShowContact] = useState(false)
  const [contactSubject, setContactSubject] = useState('')
  const [contactMessage, setContactMessage] = useState('')
  const [contactSending, setContactSending] = useState(false)
  const [contactSent, setContactSent] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const t = i18n[lang]

  const status = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG['scheduled']
  const propObj = booking.properties as any
  const property = propObj ? (Array.isArray(propObj) ? propObj[0] : propObj) : null
  const cleaning = booking.cleanings?.[0] ?? null
  // staff is also a nested join array
  const staff = cleaning?.cleaning_staff_assignments?.[0]?.staff?.[0] ?? null
  const photos = booking.order_photos ?? []

  const shortId = `TC-${booking.id.slice(0, 6).toUpperCase()}`

  const formattedDate = booking.scheduled_date
    ? new Date(booking.scheduled_date).toLocaleDateString(lang === 'jp' ? 'ja-JP' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—'

  const handleBookAgain = () => {
    const params = new URLSearchParams({
      email: '',
      a1: property?.address ?? '',
      a2: booking.service_type ?? '',
    })
    window.open(`${CALENDLY_URL}?${params.toString()}`, '_blank')
  }

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setContactSending(true)
    // TODO: Insert into support_requests table in Supabase
    await new Promise(r => setTimeout(r, 1000)) // Simulated delay
    setContactSending(false)
    setContactSent(true)
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F9FAFB' }}>
      <Sidebar lang={lang} onLangToggle={() => setLang(lang === 'en' ? 'jp' : 'en')} activeNav="orders" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="tc-main">
        {/* Top Bar */}
        <header className="tc-topbar" style={{
          height: '60px', background: 'white', borderBottom: '1px solid #E5E7EB',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 32px', position: 'sticky', top: 0, zIndex: 90,
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button className="tc-hamburger" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Menu" style={{ position: 'relative' }}>
              <span className="bar" /><span className="bar" /><span className="bar" />
            </button>
            <button onClick={() => router.back()} style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#6B7280', fontWeight: 600, fontSize: '13px',
              padding: '6px 0', transition: 'color 0.15s',
            }}
              onMouseEnter={e => (e.currentTarget.style.color = '#0EA5A0')}
              onMouseLeave={e => (e.currentTarget.style.color = '#6B7280')}>
              <ArrowLeft size={16} /> {t.backToHistory}
            </button>
          </div>

          {/* EN/JP Toggle */}
          <div style={{ background: '#F3F4F6', borderRadius: '100px', padding: '3px', display: 'flex' }}>
            {(['en', 'jp'] as const).map(l => (
              <button key={l} onClick={() => setLang(l)} style={{
                padding: '4px 12px', border: 'none', borderRadius: '100px', cursor: 'pointer',
                fontSize: '10px', fontWeight: 700, transition: 'all 0.15s',
                background: lang === l ? '#111827' : 'transparent',
                color: lang === l ? 'white' : '#9CA3AF',
              }}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </header>

        {/* Content */}
        <main className="tc-page-content" style={{ padding: '32px', maxWidth: '800px', width: '100%', margin: '0 auto' }}>
          {/* Order Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F1F3D', marginBottom: '4px' }}>
                Order #{shortId}
              </h1>
              <div style={{ fontSize: '14px', color: '#6B7280' }}>
                {booking.status === 'completed' ? t.completedOn : t.scheduledFor} {formattedDate}
              </div>
            </div>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.5px', padding: '6px 14px', borderRadius: '100px',
              background: status.bg, color: status.color,
            }}>
              {status.icon}
              {lang === 'jp' ? status.labelJp : status.label}
            </span>
          </div>

          {/* 2-Column Card Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
            {/* Service Details Card */}
            <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '16px' }}>
                {t.serviceDetails}
              </span>
              {[
                { key: t.type, val: booking.service_type || '—' },
                { key: t.duration, val: cleaning?.actual_hours ? `${cleaning.actual_hours} ${t.hours}` : '—' },
                { key: t.amountPaid, val: booking.cleaning_price ? `¥${booking.cleaning_price.toLocaleString()} (${t.vatIncl})` : '—' },
              ].map(({ key, val }) => (
                <div key={key} style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '2px' }}>{key}</div>
                  <div style={{ fontWeight: 700, color: '#0F1F3D', fontSize: '15px' }}>{val}</div>
                </div>
              ))}
            </div>

            {/* Staff Card */}
            <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '16px' }}>
                {t.yourStaff}
              </span>
              {staff ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <Avatar name={staff.display_name} />
                    <div>
                      <div style={{ fontWeight: 700, color: '#111827' }}>{staff.display_name}</div>
                      <div style={{ fontSize: '12px', color: '#6B7280' }}>{t.certifiedPro}</div>
                    </div>
                  </div>
                  <div style={{ paddingTop: '16px', borderTop: '1px solid #F3F4F6' }}>
                    <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>{t.location}</div>
                    <div style={{ fontWeight: 600, color: '#0F1F3D', fontSize: '13px' }}>
                      {property?.address || property?.name || '—'}
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ color: '#9CA3AF', fontSize: '13px' }}>
                  <div style={{ paddingTop: '4px', color: '#6B7280', marginBottom: '4px', fontSize: '12px' }}>{t.location}</div>
                  <div style={{ fontWeight: 600, color: '#0F1F3D', fontSize: '13px' }}>
                    {property?.address || property?.name || '—'}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Photo Gallery */}
          <section style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '24px', marginBottom: '32px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '16px' }}>
              {t.proofOfService}
            </span>
            {photos.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {photos.map((photo, i) => (
                  <div key={i} style={{ aspectRatio: '4/3', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', position: 'relative' }}>
                    <img src={photo.storage_path} alt={photo.photo_type || `Photo ${i + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                      onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
                      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')} />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.6))', color: 'white', padding: '12px', fontSize: '12px', fontWeight: 500 }}>
                      {photo.photo_type}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', color: '#9CA3AF', gap: '12px' }}>
                <ImageOff size={32} />
                <p style={{ fontSize: '13px', textAlign: 'center', maxWidth: '260px', lineHeight: 1.6 }}>{t.noPhotos}</p>
              </div>
            )}
          </section>

          {/* Action Bar */}
          <div style={{ display: 'flex', gap: '16px', borderTop: '1px solid #E5E7EB', paddingTop: '32px' }}>
            <button onClick={handleBookAgain} style={{
              flex: 2, padding: '15px', background: '#0EA5A0', color: 'white',
              border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 700,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              transition: 'background 0.15s',
            }}
              onMouseEnter={e => (e.currentTarget.style.background = '#0B8A86')}
              onMouseLeave={e => (e.currentTarget.style.background = '#0EA5A0')}>
              <RefreshCw size={16} /> {t.bookAgain}
            </button>
            <button onClick={() => setShowContact(true)} style={{
              flex: 1, padding: '15px', background: 'transparent', color: '#4B5563',
              border: '1.5px solid #E5E7EB', borderRadius: '8px', fontSize: '15px', fontWeight: 700,
              cursor: 'pointer', transition: 'all 0.15s',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F9FAFB'; (e.currentTarget as HTMLElement).style.borderColor = '#9CA3AF' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.borderColor = '#E5E7EB' }}>
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <AlertCircle size={16} /> {t.reportIssue}
              </span>
            </button>
          </div>
        </main>
      </div>

      {/* Contact Issue Modal */}
      {showContact && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
        }} onClick={() => setShowContact(false)}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111827' }}>{t.reportTitle}</h2>
              <button onClick={() => setShowContact(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: '4px' }}>
                <X size={20} />
              </button>
            </div>

            {!contactSent ? (
              <form onSubmit={handleContactSubmit}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>{t.reportSubject}</label>
                  <input value={contactSubject} onChange={e => setContactSubject(e.target.value)} required
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', color: '#111827', outline: 'none' }} />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>{t.reportMessage}</label>
                  <textarea value={contactMessage} onChange={e => setContactMessage(e.target.value)} required rows={4}
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', color: '#111827', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }} />
                </div>
                <button type="submit" disabled={contactSending} style={{
                  width: '100%', padding: '12px', background: '#0EA5A0', color: 'white',
                  border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: contactSending ? 0.7 : 1,
                }}>
                  <Send size={15} /> {contactSending ? t.reportSending : t.reportSubmit}
                </button>
              </form>
            ) : (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div style={{ width: '52px', height: '52px', background: '#ECFDF5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <CheckCircle2 size={26} color="#059669" />
                </div>
                <p style={{ color: '#374151', lineHeight: 1.6, marginBottom: '20px' }}>{t.reportSuccess}</p>
                <button onClick={() => { setShowContact(false); setContactSent(false); setContactSubject(''); setContactMessage('') }}
                  style={{ padding: '10px 24px', background: '#F3F4F6', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: '#374151' }}>
                  {t.reportClose}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
