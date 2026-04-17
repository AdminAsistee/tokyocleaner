'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { useLang } from '@/hooks/useLang'
import { ArrowLeft, MapPin, KeyRound, Sparkles, Camera, FileText, Upload } from 'lucide-react'

/* ================================================================
   i18n
   ================================================================ */
const i18n = {
  en: {
    pageTitle: 'Register Property',
    step: 'Step 2 of 2',
    back: 'Back',
    // Section 1 — Location
    s1Title: 'Property Location',
    fullAddress: 'Full Address',
    addressPlaceholder: '東京都渋谷区神南1-2-3',
    addressHelper: 'Format: Prefecture, City, Street Address',
    buildingName: 'Building Name',
    buildingPlaceholder: 'シブヤビル',
    roomFloor: 'Room / Floor',
    roomPlaceholder: '802',
    mapsUrl: 'Google Maps URL (Optional)',
    mapsPlaceholder: 'https://goo.gl/maps/...',
    // Section 2 — Access
    s2Title: 'Access Instructions',
    accessCodes: 'Gate / Intercom / Keybox Codes',
    accessCodesPlaceholder: 'Gate: 1234, Keybox inside mailbox',
    accessCodesHelper: 'Enter any codes or secrets our cleaners need to enter your property.',
    entranceInstructions: 'Detailed Entrance Instructions',
    entrancePlaceholder: 'Go to 2F entrance, use the code above on the keypad.',
    // Section 3 — Equipment
    s3Title: 'Equipment',
    vacuumQuestion: 'Does the property have a vacuum cleaner?',
    vacuumYes: 'Yes, available',
    vacuumNo: 'No vacuum',
    vacuumHelper: 'If no vacuum is available, we will bring a handheld unit.',
    // Section 4 — Photos
    s4Title: 'Property Photos',
    s4Desc: 'Uploading photos of the entrance or keybox helps our cleaners find your property faster.',
    photoEntrance: 'Entrance',
    photoKeybox: 'Keybox',
    photoOther: 'Other',
    // Section 5 — Notes
    s5Title: 'Additional Notes',
    notesPlaceholder: 'Any other specific instructions for our team?',
    // Submit
    saveButton: 'Save Property Details',
    saving: 'Saving...',
  },
  jp: {
    pageTitle: '物件情報の登録',
    step: 'ステップ 2/2',
    back: '戻る',
    s1Title: '物件の所在地',
    fullAddress: '住所',
    addressPlaceholder: '東京都渋谷区神南1-2-3',
    addressHelper: '都道府県、市区町村、番地を入力してください',
    buildingName: '建物名',
    buildingPlaceholder: 'シブヤビル',
    roomFloor: '部屋番号 / 階数',
    roomPlaceholder: '802',
    mapsUrl: 'Google マップのURL (任意)',
    mapsPlaceholder: 'https://goo.gl/maps/...',
    s2Title: '入室方法',
    accessCodes: 'オートロック / インターホン / キーボックスの番号',
    accessCodesPlaceholder: 'Gate: 1234, Keybox inside mailbox',
    accessCodesHelper: 'スタッフが入室するために必要な暗証番号などを入力してください。',
    entranceInstructions: '入室に関する詳細な説明',
    entrancePlaceholder: '2階の入り口に行き、上記のコードをキーパッドに入力してください。',
    s3Title: '掃除用具',
    vacuumQuestion: '物件に掃除機はありますか？',
    vacuumYes: 'はい、あります',
    vacuumNo: 'いいえ、ありません',
    vacuumHelper: '掃除機がない場合は、ハンディタイプを持参します。',
    s4Title: '物件の写真',
    s4Desc: '入り口やキーボックスの写真をアップロードすると、入室がスムーズになります。',
    photoEntrance: '入り口',
    photoKeybox: 'キーボックス',
    photoOther: 'その他',
    s5Title: 'その他備考',
    notesPlaceholder: 'チームへのその他の指示がありますか？',
    saveButton: '物件情報を保存する',
    saving: '保存中...',
  },
}

/* ================================================================
   COMPONENT
   ================================================================ */
export default function PropertyRegisterPage() {
  const [lang, setLang] = useLang()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [hasVacuum, setHasVacuum] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const t = i18n[lang]

  // Form fields (client-side only for now — will wire to Supabase later)
  const [form, setForm] = useState({
    address: '', building: '', room: '', mapsUrl: '',
    accessCodes: '', entranceInstructions: '',
    notes: '',
  })

  const updateField = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    // TODO: POST to Supabase properties table
    await new Promise(r => setTimeout(r, 1200))
    setSaving(false)
    router.push('/client')
  }

  /* Shared styles */
  const sectionStyle: React.CSSProperties = {
    background: 'white', padding: '24px', borderRadius: '12px',
    border: '1px solid #E5E7EB', marginBottom: '24px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  }
  const sectionHeaderStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: '12px',
    marginBottom: '20px', paddingBottom: '12px',
    borderBottom: '1px solid #F3F4F6',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '13px', fontWeight: 600,
    color: '#374151', marginBottom: '6px',
  }
  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px',
    border: '1.5px solid #E5E7EB', borderRadius: '8px',
    fontFamily: 'inherit', fontSize: '14px', color: '#111827',
    outline: 'none', transition: 'border-color 0.15s',
  }
  const helperStyle: React.CSSProperties = {
    fontSize: '11px', color: '#6B7280', marginTop: '6px',
  }

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button className="tc-hamburger" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Menu" style={{ position: 'relative' }}>
              <span className="bar" /><span className="bar" /><span className="bar" />
            </button>
            <button onClick={() => router.back()} style={{
              width: '36px', height: '36px', borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#6B7280', transition: 'background 0.15s',
            }}
              onMouseEnter={e => (e.currentTarget.style.background = '#F3F4F6')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <ArrowLeft size={18} />
            </button>
            <span style={{ fontSize: '16px', fontWeight: 700, color: '#111827' }}>{t.pageTitle}</span>
            <span style={{
              fontSize: '11px', fontWeight: 700, color: '#0EA5A0',
              background: '#E6F8F7', padding: '4px 10px', borderRadius: '100px',
            }}>{t.step}</span>
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

        {/* Form content */}
        <main className="tc-page-content" style={{
          flex: 1, padding: '24px 20px 120px',
          maxWidth: '640px', margin: '0 auto', width: '100%',
        }}>

          {/* ===== SECTION 1: LOCATION ===== */}
          <section style={sectionStyle}>
            <div style={sectionHeaderStyle}>
              <MapPin size={18} style={{ color: '#0EA5A0' }} />
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>{t.s1Title}</span>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>{t.fullAddress}</label>
              <input style={inputStyle} placeholder={t.addressPlaceholder}
                value={form.address} onChange={e => updateField('address', e.target.value)}
                onFocus={e => (e.target.style.borderColor = '#0EA5A0')}
                onBlur={e => (e.target.style.borderColor = '#E5E7EB')} />
              <div style={helperStyle}>{t.addressHelper}</div>
            </div>

            <div className="property-input-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={labelStyle}>{t.buildingName}</label>
                <input style={inputStyle} placeholder={t.buildingPlaceholder}
                  value={form.building} onChange={e => updateField('building', e.target.value)}
                  onFocus={e => (e.target.style.borderColor = '#0EA5A0')}
                  onBlur={e => (e.target.style.borderColor = '#E5E7EB')} />
              </div>
              <div>
                <label style={labelStyle}>{t.roomFloor}</label>
                <input style={inputStyle} placeholder={t.roomPlaceholder}
                  value={form.room} onChange={e => updateField('room', e.target.value)}
                  onFocus={e => (e.target.style.borderColor = '#0EA5A0')}
                  onBlur={e => (e.target.style.borderColor = '#E5E7EB')} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>{t.mapsUrl}</label>
              <input style={inputStyle} placeholder={t.mapsPlaceholder} type="url"
                value={form.mapsUrl} onChange={e => updateField('mapsUrl', e.target.value)}
                onFocus={e => (e.target.style.borderColor = '#0EA5A0')}
                onBlur={e => (e.target.style.borderColor = '#E5E7EB')} />
            </div>
          </section>

          {/* ===== SECTION 2: ACCESS ===== */}
          <section style={sectionStyle}>
            <div style={sectionHeaderStyle}>
              <KeyRound size={18} style={{ color: '#0EA5A0' }} />
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>{t.s2Title}</span>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>{t.accessCodes}</label>
              <input style={inputStyle} placeholder={t.accessCodesPlaceholder}
                value={form.accessCodes} onChange={e => updateField('accessCodes', e.target.value)}
                onFocus={e => (e.target.style.borderColor = '#0EA5A0')}
                onBlur={e => (e.target.style.borderColor = '#E5E7EB')} />
              <div style={helperStyle}>{t.accessCodesHelper}</div>
            </div>

            <div>
              <label style={labelStyle}>{t.entranceInstructions}</label>
              <textarea style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' as const }}
                placeholder={t.entrancePlaceholder}
                value={form.entranceInstructions} onChange={e => updateField('entranceInstructions', e.target.value)}
                onFocus={e => (e.target.style.borderColor = '#0EA5A0')}
                onBlur={e => (e.target.style.borderColor = '#E5E7EB')} />
            </div>
          </section>

          {/* ===== SECTION 3: EQUIPMENT ===== */}
          <section style={sectionStyle}>
            <div style={sectionHeaderStyle}>
              <Sparkles size={18} style={{ color: '#0EA5A0' }} />
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>{t.s3Title}</span>
            </div>

            <div>
              <label style={labelStyle}>{t.vacuumQuestion}</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '8px' }}>
                {[
                  { val: true, label: t.vacuumYes },
                  { val: false, label: t.vacuumNo },
                ].map(opt => (
                  <div key={String(opt.val)} onClick={() => setHasVacuum(opt.val)}
                    style={{
                      cursor: 'pointer',
                      border: `1.5px solid ${hasVacuum === opt.val ? '#0EA5A0' : '#E5E7EB'}`,
                      borderRadius: '8px', padding: '12px', textAlign: 'center',
                      background: hasVacuum === opt.val ? '#E6F8F7' : 'white',
                      color: hasVacuum === opt.val ? '#0B8A86' : '#374151',
                      fontWeight: hasVacuum === opt.val ? 600 : 400,
                      fontSize: '13px', transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { if (hasVacuum !== opt.val) e.currentTarget.style.background = '#FCFCFD' }}
                    onMouseLeave={e => { if (hasVacuum !== opt.val) e.currentTarget.style.background = 'white' }}
                  >
                    {opt.label}
                  </div>
                ))}
              </div>
              <div style={helperStyle}>{t.vacuumHelper}</div>
            </div>
          </section>

          {/* ===== SECTION 4: PHOTOS ===== */}
          <section style={sectionStyle}>
            <div style={sectionHeaderStyle}>
              <Camera size={18} style={{ color: '#0EA5A0' }} />
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>{t.s4Title}</span>
            </div>

            <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '16px' }}>{t.s4Desc}</p>

            <div className="property-photo-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {[
                { icon: '🚪', label: t.photoEntrance },
                { icon: '📦', label: t.photoKeybox },
                { icon: <Upload size={20} />, label: t.photoOther },
              ].map((item, idx) => (
                <div key={idx} style={{
                  aspectRatio: '1', border: '2px dashed #E5E7EB', borderRadius: '8px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: '8px', cursor: 'pointer', color: '#9CA3AF',
                  transition: 'all 0.15s',
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#0EA5A0'
                    e.currentTarget.style.color = '#0EA5A0'
                    e.currentTarget.style.background = '#E6F8F7'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#E5E7EB'
                    e.currentTarget.style.color = '#9CA3AF'
                    e.currentTarget.style.background = 'transparent'
                  }}
                >
                  <span style={{ fontSize: '20px' }}>{item.icon}</span>
                  <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>{item.label}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ===== SECTION 5: NOTES ===== */}
          <section style={sectionStyle}>
            <div style={sectionHeaderStyle}>
              <FileText size={18} style={{ color: '#0EA5A0' }} />
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>{t.s5Title}</span>
            </div>
            <textarea style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' as const }}
              placeholder={t.notesPlaceholder}
              value={form.notes} onChange={e => updateField('notes', e.target.value)}
              onFocus={e => (e.target.style.borderColor = '#0EA5A0')}
              onBlur={e => (e.target.style.borderColor = '#E5E7EB')} />
          </section>
        </main>

        {/* Sticky footer */}
        <div className="tc-sticky-cta" style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: 'white', borderTop: '1px solid #E5E7EB',
          padding: '16px 24px', zIndex: 80,
          display: 'flex', justifyContent: 'center',
        }}>
          <button onClick={handleSave} disabled={saving}
            style={{
              width: '100%', maxWidth: '560px', padding: '14px',
              background: '#0EA5A0', color: 'white',
              border: 'none', borderRadius: '8px',
              fontSize: '15px', fontWeight: 700, cursor: 'pointer',
              transition: 'background 0.15s',
              opacity: saving ? 0.7 : 1,
            }}
            onMouseEnter={e => { if (!saving) e.currentTarget.style.background = '#0B8A86' }}
            onMouseLeave={e => { if (!saving) e.currentTarget.style.background = '#0EA5A0' }}
          >
            {saving ? t.saving : t.saveButton}
          </button>
        </div>
      </div>
    </div>
  )
}
