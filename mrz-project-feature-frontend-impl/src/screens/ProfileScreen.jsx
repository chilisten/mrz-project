import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { LANGUAGES } from '../i18n/translations'
import PassportScanner from '../components/PassportScanner'
import PassportForm from '../components/PassportForm'
import { formatDate } from '../utils/mrzParser'

function PassportCard({ passport, onDelete, onEdit, tr, isLight }) {
  const [confirming, setConfirming] = useState(false)
  const text  = isLight ? '#0f172a' : '#f1f5f9'
  const muted = isLight ? '#64748b' : '#94a3b8'
  const btnBg = isLight ? '#f1f5f9' : 'rgba(15,23,42,0.60)'
  const btnBd = isLight ? '#cbd5e1' : 'rgba(51,65,85,0.80)'
  return (
    <div className="rounded-xl p-4"
      style={{ background: isLight ? 'rgba(255,255,255,0.98)' : 'rgba(20,30,53,0.80)',
               border: `1px solid ${isLight ? 'rgba(14,165,233,0.18)' : 'rgba(56,189,248,0.10)'}`,
               boxShadow: isLight ? '0 1px 8px rgba(14,165,233,0.06)' : 'none' }}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
            style={{ background: 'rgba(14,165,233,0.15)', border: '1px solid rgba(14,165,233,0.30)' }}>🪪</div>
          <div>
            <p className="font-bold text-sm" style={{ color: text }}>{passport.surname} {passport.names}</p>
            <p className="text-xs font-mono" style={{ color: muted }}>{passport.docNum}</p>
          </div>
        </div>
        <div className="flex gap-1.5">
          <button onClick={() => onEdit(passport)} className="text-xs px-2.5 py-1 rounded-lg transition-all"
            style={{ background: btnBg, border: `1px solid ${btnBd}`, color: muted }}>✏️</button>
          {confirming
            ? <button onClick={() => onDelete(passport.id)} className="text-xs px-2.5 py-1 rounded-lg transition-all"
                style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.40)', color: '#f87171' }}>
                ✓ {tr.deletePassport}
              </button>
            : <button onClick={() => setConfirming(true)} className="text-xs px-2.5 py-1 rounded-lg transition-all"
                style={{ background: btnBg, border: `1px solid ${btnBd}`, color: muted }}>🗑</button>
          }
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs">
        {[{ l: tr.country, v: passport.country || '—' },
          { l: tr.dob,     v: formatDate(passport.dob) || '—' },
          { l: tr.expiry,  v: formatDate(passport.expiry, true) || '—' }].map(item => (
          <div key={item.l}>
            <p style={{ color: muted }}>{item.l}</p>
            <p className="font-mono font-semibold" style={{ color: text }}>{item.v}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function AddPassportModal({ onClose, onSave, tr, isLight, initialData }) {
  const [mode, setMode] = useState(initialData ? 'manual' : 'choose')
  const [scanned, setScanned] = useState(initialData || null)
  const [formData, setFormData] = useState(initialData || null)
  const text  = isLight ? '#0f172a' : '#f1f5f9'
  const muted = isLight ? '#64748b' : '#94a3b8'
  const btnBg = isLight ? '#f8faff' : 'rgba(15,23,42,0.60)'
  const btnBd = isLight ? '#cbd5e1' : 'rgba(51,65,85,0.80)'
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}>
      <div className="rounded-2xl p-5 w-full max-w-sm animate-slide-up" style={{ maxHeight: '90vh', overflowY: 'auto',
        background: isLight ? 'rgba(255,255,255,0.98)' : 'rgba(20,30,53,0.95)',
        border: `1px solid ${isLight ? 'rgba(14,165,233,0.20)' : 'rgba(56,189,248,0.15)'}`,
        boxShadow: '0 24px 64px rgba(0,0,0,0.40)' }}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-lg" style={{ color: text }}>{tr.addPassportTitle}</h3>
          <button onClick={onClose} className="text-xl" style={{ color: muted }}>✕</button>
        </div>
        {mode === 'choose' && (
          <div className="grid grid-cols-2 gap-3">
            {[{ m:'scan',   icon:'📷', label: tr.scanPassport,  sub: tr.mrzRecognition },
              { m:'manual', icon:'✏️', label: tr.fillManually,  sub: tr.manualInput }].map(opt => (
              <button key={opt.m} onClick={() => setMode(opt.m)} className="rounded-xl p-4 flex flex-col items-center gap-2 transition-all"
                style={{ background: btnBg, border: `1px solid ${btnBd}` }}>
                <span className="text-3xl">{opt.icon}</span>
                <p className="text-sm font-semibold" style={{ color: text }}>{opt.label}</p>
                <p className="text-xs text-center" style={{ color: muted }}>{opt.sub}</p>
              </button>
            ))}
          </div>
        )}
        {mode === 'scan' && (
          <div>
            <PassportScanner onScan={data => { setScanned(data); setMode('manual') }} />
            <button onClick={() => setMode('choose')} className="btn-ghost w-full mt-3 text-sm">← {tr.back}</button>
          </div>
        )}
        {mode === 'manual' && (
          <div>
            <PassportForm data={scanned} onChange={setFormData} />
            <div className="flex gap-2 mt-4">
              <button onClick={() => initialData ? onClose() : setMode('choose')} className="btn-ghost flex-1">← {tr.back}</button>
              <button onClick={() => { const d = formData||scanned; if(d?.surname){onSave(d);onClose()} }} className="btn-primary flex-1">
                💾 {tr.save}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function BookingDetailModal({ booking, onClose, isLight, tr }) {
  const CL = { first:'#f59e0b', business:'#a855f7', economy:'#0ea5e9' }
  const CN = { first: tr.classFirst, business: tr.classBusiness, economy: tr.classEconomy }
  const PC = ['#3b82f6','#a855f7','#f59e0b','#22c55e','#ec4899']
  const text  = isLight ? '#0f172a' : '#f1f5f9'
  const muted = isLight ? '#64748b' : '#94a3b8'
  const div   = isLight ? '#e2e8f0' : 'rgba(51,65,85,0.60)'
  const rowBg = isLight ? '#f8faff' : 'rgba(15,23,42,0.60)'
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}>
      <div className="rounded-2xl p-5 w-full max-w-sm animate-slide-up" style={{ maxHeight: '90vh', overflowY: 'auto',
        background: isLight ? 'rgba(255,255,255,0.98)' : 'rgba(20,30,53,0.95)',
        border: `1px solid ${isLight ? 'rgba(14,165,233,0.20)' : 'rgba(56,189,248,0.15)'}`,
        boxShadow: '0 24px 64px rgba(0,0,0,0.40)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg" style={{ color: text }}>{tr.bookingDetails}</h3>
          <button onClick={onClose} className="text-xl" style={{ color: muted }}>✕</button>
        </div>
        <div className="rounded-xl p-4 mb-4" style={{ background: rowBg, border: `1px solid ${div}` }}>
          <div className="flex justify-between mb-3">
            <div>
              <p className="font-bold" style={{ color: text }}>{booking.flight?.from?.code} → {booking.flight?.to?.code}</p>
              <p className="text-xs font-mono" style={{ color: muted }}>{booking.flight?.airline} · {booking.flight?.code}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg" style={{ color: '#0ea5e9' }}>{booking.totalPrice?.toLocaleString('ru')} {tr.som}</p>
              <p className="text-xs" style={{ color: muted }}>{new Date(booking.createdAt).toLocaleDateString('ru')}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { l: tr.departure, v: booking.flight?.departure || '—' },
              { l: tr.arrival,   v: booking.flight?.arrival   || '—' },
              { l: tr.from,      v: `${booking.flight?.from?.city} (${booking.flight?.from?.code})` },
              { l: tr.to,        v: `${booking.flight?.to?.city} (${booking.flight?.to?.code})` },
              { l: tr.duration,  v: booking.flight?.duration  || '—' },
              { l: tr.aircraft,  v: booking.flight?.aircraft  || '—' },
            ].map(item => (
              <div key={item.l} className="rounded-lg p-2"
                style={{ background: isLight ? '#fff' : 'rgba(6,11,20,0.40)', border: `1px solid ${div}` }}>
                <p style={{ color: muted }}>{item.l}</p>
                <p className="font-semibold mt-0.5" style={{ color: text }}>{item.v}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: muted }}>
          {tr.tickets} ({booking.tickets?.length})
        </p>
        <div className="space-y-2 mb-4">
          {booking.tickets?.map((ticket, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl p-3"
              style={{ background: rowBg, border: `1px solid ${div}` }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                style={{ background: PC[i % PC.length] }}>{i + 1}</div>
              <div className="flex-1">
                <p className="font-semibold text-sm" style={{ color: text }}>
                  {ticket.passenger ? `${ticket.passenger.surname} ${ticket.passenger.names}` : `${tr.passenger} ${i + 1}`}
                </p>
                {ticket.passenger?.docNum && <p className="text-xs font-mono" style={{ color: muted }}>{ticket.passenger.docNum}</p>}
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold font-mono" style={{ color: '#0ea5e9' }}>{ticket.seat}</p>
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded"
                  style={{ background: `${CL[ticket.seatClass]||'#0ea5e9'}20`, color: CL[ticket.seatClass]||'#0ea5e9' }}>
                  {CN[ticket.seatClass] || tr.classEconomy}
                </span>
              </div>
            </div>
          ))}
        </div>
        <button onClick={onClose} className="btn-primary w-full">{tr.close}</button>
      </div>
    </div>
  )
}

function isUpcoming(booking) {
  try {
    const f = booking.flight
    const dateStr = f?.date || new Date().toISOString().split('T')[0]
    const [h, m] = (f?.departure || '00:00').split(':').map(Number)
    const flightDate = new Date(dateStr)
    flightDate.setHours(h, m, 0, 0)
    return flightDate > new Date()
  } catch { return false }
}

export default function ProfileScreen({ initialTab, onLogoutSuccess }) {
  const { user, logout, lang, setLang, theme, setTheme, passports, addPassport, updatePassport, deletePassport, bookings, tr } = useApp()
  const isLight = theme === 'light'
  const [tab, setTab] = useState(initialTab || 'passports')
  const [historyFilter, setHistoryFilter] = useState('all')
  const [showAddPassport, setShowAddPassport] = useState(false)
  const [editingPassport, setEditingPassport] = useState(null)
  const [viewingBooking, setViewingBooking] = useState(null)

  const handleSavePassport = (data) => {
    if (editingPassport) { updatePassport(editingPassport.id, data); setEditingPassport(null) }
    else addPassport(data)
    setShowAddPassport(false)
  }

  const filteredBookings = bookings.filter(b => {
    if (historyFilter === 'upcoming') return isUpcoming(b)
    if (historyFilter === 'past') return !isUpcoming(b)
    return true
  })

  const text   = isLight ? '#0f172a' : '#f1f5f9'
  const muted  = isLight ? '#64748b' : '#94a3b8'
  const div    = isLight ? '#e2e8f0' : 'rgba(51,65,85,0.60)'
  const cardBg = isLight ? 'rgba(255,255,255,0.96)' : 'rgba(20,30,53,0.80)'
  const cardBd = isLight ? 'rgba(14,165,233,0.18)' : 'rgba(56,189,248,0.10)'
  const inpBg  = isLight ? '#f8faff' : 'rgba(15,23,42,0.60)'
  const inpBd  = isLight ? '#cbd5e1' : 'rgba(51,65,85,0.80)'
  const tabsBg = isLight ? '#e9f0fb' : 'rgba(6,11,20,0.70)'
  const CL = { first:'#f59e0b', business:'#a855f7', economy:'#0ea5e9' }
  const CN = { first: tr.classFirst, business: tr.classBusiness, economy: tr.classEconomy }

  return (
    <div className="animate-slide-up">
      {showAddPassport && (
        <AddPassportModal tr={tr} isLight={isLight} initialData={editingPassport}
          onClose={() => { setShowAddPassport(false); setEditingPassport(null) }}
          onSave={handleSavePassport} />
      )}
      {viewingBooking && (
        <BookingDetailModal booking={viewingBooking} isLight={isLight} tr={tr}
          onClose={() => setViewingBooking(null)} />
      )}

      {/* Profile header */}
      <div className="rounded-2xl p-5 mb-5 flex items-center gap-4"
        style={{ background: cardBg, border: `1px solid ${cardBd}`, boxShadow: isLight ? '0 2px 12px rgba(14,165,233,0.07)' : 'none' }}>
        <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold"
          style={{ background: 'rgba(14,165,233,0.15)', border: '2px solid rgba(14,165,233,0.35)', color: '#0ea5e9' }}>
          {user?.nickname?.[0]?.toUpperCase() || '?'}
        </div>
        <div className="flex-1">
          <p className="font-bold text-lg" style={{ color: text }}>{user?.nickname || 'User'}</p>
          <p className="text-sm" style={{ color: muted }}>{user?.email}</p>
        </div>
        <button onClick={() => { logout(); if (onLogoutSuccess) onLogoutSuccess();
  }} 
  className="text-sm font-semibold px-4 py-2 rounded-xl transition-all"
  style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}
>
  {tr.logout}
</button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 rounded-xl p-1 mb-5" style={{ background: tabsBg }}>
        {[{ val:'passports', icon:'🪪', label: tr.myPassports },
          { val:'history',   icon:'📋', label: tr.bookingHistory },
          { val:'settings',  icon:'⚙️', label: tr.settings }].map(t => (
          <button key={t.val} onClick={() => setTab(t.val)}
            className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
            style={tab === t.val
              ? { background: '#0ea5e9', color: '#fff', boxShadow: '0 2px 8px rgba(14,165,233,0.30)' }
              : { background: 'transparent', color: muted }}>
            <span>{t.icon}</span><span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* ── PASSPORTS ── */}
      {tab === 'passports' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold" style={{ color: text }}>{tr.myPassports}</h3>
            <button onClick={() => setShowAddPassport(true)} className="btn-primary py-2 px-4 text-sm">{tr.addPassport}</button>
          </div>
          {passports.length === 0
            ? <div className="rounded-2xl p-10 flex flex-col items-center gap-3 text-center"
                style={{ background: cardBg, border: `1px solid ${cardBd}` }}>
                <span className="text-4xl">🪪</span>
                <p className="font-semibold" style={{ color: text }}>{tr.noPassports}</p>
                <p className="text-sm" style={{ color: muted }}>{tr.noPassportLinkedAdd}</p>
                <button onClick={() => setShowAddPassport(true)} className="btn-primary mt-2 text-sm px-6">{tr.addPassport}</button>
              </div>
            : passports.map(p => (
                <PassportCard key={p.id} passport={p} isLight={isLight} tr={tr}
                  onDelete={deletePassport}
                  onEdit={p => { setEditingPassport(p); setShowAddPassport(true) }} />
              ))
          }
        </div>
      )}

      {/* ── HISTORY ── */}
      {tab === 'history' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
            <h3 className="font-semibold" style={{ color: text }}>{tr.bookingHistory}</h3>
            <div className="flex gap-1.5">
              {[{ val:'all',      label: tr.filterAll },
                { val:'upcoming', label: tr.filterUpcoming },
                { val:'past',     label: tr.filterPast }].map(f => (
                <button key={f.val} onClick={() => setHistoryFilter(f.val)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                  style={historyFilter === f.val
                    ? { background: '#0ea5e9', color: '#fff', border: '1px solid #0ea5e9' }
                    : { background: inpBg, color: muted, border: `1px solid ${inpBd}` }}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {filteredBookings.length === 0
            ? <div className="rounded-2xl p-10 flex flex-col items-center gap-3 text-center"
                style={{ background: cardBg, border: `1px solid ${cardBd}` }}>
                <span className="text-4xl">📋</span>
                <p className="font-semibold" style={{ color: text }}>
                  {historyFilter === 'upcoming' ? tr.noUpcoming
                   : historyFilter === 'past'   ? tr.noPast
                   : tr.noBookings}
                </p>
                {historyFilter === 'all' && <p className="text-sm" style={{ color: muted }}>{tr.noBookingsHint}</p>}
              </div>
            : filteredBookings.map(b => {
                const upcoming = isUpcoming(b)
                return (
                  <button key={b.id} onClick={() => setViewingBooking(b)}
                    className="w-full text-left rounded-xl p-4 transition-all"
                    style={{ background: cardBg, border: `1px solid ${cardBd}`, boxShadow: isLight ? '0 1px 8px rgba(14,165,233,0.06)' : 'none' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(14,165,233,0.40)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = cardBd}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🎫</span>
                        <div>
                          <p className="font-bold text-sm" style={{ color: text }}>{b.flight?.from?.code} → {b.flight?.to?.code}</p>
                          <p className="text-xs font-mono" style={{ color: muted }}>{b.flight?.code} · {b.flight?.airline}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold" style={{ color: '#0ea5e9' }}>{b.totalPrice?.toLocaleString('ru')} {tr.som}</p>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={upcoming
                            ? { background: 'rgba(34,197,94,0.15)', color: '#4ade80' }
                            : { background: isLight ? '#f1f5f9' : 'rgba(51,65,85,0.30)', color: muted }}>
                          {upcoming ? tr.upcoming : tr.past}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {b.tickets?.map((ticket, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-xs rounded-lg px-2 py-1"
                          style={{ background: inpBg, border: `1px solid ${inpBd}` }}>
                          <span className="font-mono font-bold" style={{ color: '#0ea5e9' }}>{ticket.seat}</span>
                          <span style={{ color: muted }}>·</span>
                          <span style={{ color: text }}>{ticket.passenger?.surname || '—'}</span>
                          <span className="px-1.5 py-0.5 rounded text-xs font-semibold"
                            style={{ background: `${CL[ticket.seatClass]||'#0ea5e9'}18`, color: CL[ticket.seatClass]||'#0ea5e9' }}>
                            {CN[ticket.seatClass] || tr.classEconomy}
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs mt-2 text-right" style={{ color: '#38bdf8' }}>{tr.clickForDetails}</p>
                  </button>
                )
              })
          }
        </div>
      )}

      {/* ── SETTINGS ── */}
      {tab === 'settings' && (
        <div className="rounded-2xl p-5 space-y-5"
          style={{ background: cardBg, border: `1px solid ${cardBd}`, boxShadow: isLight ? '0 2px 12px rgba(14,165,233,0.07)' : 'none' }}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: muted }}>{tr.language}</p>
            <div className="flex gap-2">
              {LANGUAGES.map(l => (
                <button key={l.code} onClick={() => setLang(l.code)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
                  style={lang === l.code
                    ? { background: '#0ea5e9', color: '#fff', border: '1px solid #0ea5e9', boxShadow: '0 2px 8px rgba(14,165,233,0.30)' }
                    : { background: inpBg, color: muted, border: `1px solid ${inpBd}` }}>
                  {l.flag} {l.label}
                </button>
              ))}
            </div>
          </div>
          <div style={{ height: 1, background: div }} />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: muted }}>{tr.theme}</p>
            <div className="flex gap-2">
              {[{ val:'dark',icon:'🌙',label:tr.themeDark }, { val:'light',icon:'☀️',label:tr.themeLight }].map(opt => (
                <button key={opt.val} onClick={() => setTheme(opt.val)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
                  style={theme === opt.val
                    ? { background: '#0ea5e9', color: '#fff', border: '1px solid #0ea5e9', boxShadow: '0 2px 8px rgba(14,165,233,0.30)' }
                    : { background: inpBg, color: muted, border: `1px solid ${inpBd}` }}>
                  {opt.icon} {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
