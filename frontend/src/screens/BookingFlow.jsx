import { useState, useEffect } from 'react'
import { flightsApi } from '../services/api'
import { useApp } from '../context/AppContext'
import SeatMap from '../components/SeatMap'
import PassportScanner from '../components/PassportScanner'
import PassportForm from '../components/PassportForm'

function PassportPickerModal({ onClose, onSelect, onAddNew, passports, tr, isLight }) {
  const [mode, setMode] = useState('list')
  const [scanned, setScanned] = useState(null)
  const [formData, setFormData] = useState(null)
  const text  = isLight ? '#0f172a' : '#f1f5f9'
  const muted = isLight ? '#64748b' : '#94a3b8'
  const btnBg = isLight ? '#f8faff' : 'rgba(15,23,42,0.60)'
  const btnBd = isLight ? '#cbd5e1' : 'rgba(51,65,85,0.80)'
  const div   = isLight ? '#e2e8f0' : 'rgba(51,65,85,0.60)'
  const handleSaveNew = () => {
    const data = formData || scanned
    if (!data?.surname) return
    onAddNew(data); onClose()
  }
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}>
      <div className="rounded-2xl p-5 w-full max-w-sm animate-slide-up" style={{ maxHeight: '85vh', overflowY: 'auto',
        background: isLight ? 'rgba(255,255,255,0.98)' : 'rgba(20,30,53,0.95)',
        border: `1px solid ${isLight ? 'rgba(14,165,233,0.20)' : 'rgba(56,189,248,0.15)'}`,
        boxShadow: '0 24px 64px rgba(0,0,0,0.35)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold" style={{ color: text }}>{tr.selectPassport}</h3>
          <button onClick={onClose} className="text-xl" style={{ color: muted }}>✕</button>
        </div>
        {mode === 'list' && (
          <>
            {passports.length > 0 && (
              <div className="space-y-2 mb-3">
                {passports.map(p => (
                  <button key={p.id} onClick={() => { onSelect(p); onClose() }}
                    className="w-full rounded-xl p-3 flex items-center gap-3 text-left transition-all"
                    style={{ background: btnBg, border: `1px solid ${btnBd}` }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(14,165,233,0.50)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = btnBd}>
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0"
                      style={{ background: 'rgba(14,165,233,0.15)', border: '1px solid rgba(14,165,233,0.30)' }}>🪪</div>
                    <div>
                      <p className="font-semibold text-sm" style={{ color: text }}>{p.surname} {p.names}</p>
                      <p className="text-xs font-mono" style={{ color: muted }}>{p.docNum} · {p.country}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            <div className="h-px my-3" style={{ background: div }} />
            <div className="grid grid-cols-2 gap-2">
              {[{ m:'scan', icon:'📷', label: tr.scanPassport },
                { m:'manual', icon:'✏️', label: tr.fillManually }].map(opt => (
                <button key={opt.m} onClick={() => setMode(opt.m)} className="rounded-xl p-3 flex flex-col items-center gap-2 transition-all"
                  style={{ background: btnBg, border: `1px solid ${btnBd}` }}>
                  <span className="text-2xl">{opt.icon}</span>
                  <span className="text-xs font-semibold" style={{ color: text }}>{opt.label}</span>
                </button>
              ))}
            </div>
          </>
        )}
        {mode === 'scan' && (
          <div>
            <PassportScanner onScan={data => { setScanned(data); setMode('manual') }} />
            <button onClick={() => setMode('list')} className="btn-ghost w-full mt-3 text-sm">← {tr.back}</button>
          </div>
        )}
        {mode === 'manual' && (
          <div>
            <PassportForm data={scanned} onChange={setFormData} />
            <div className="flex gap-2 mt-4">
              <button onClick={() => setMode('list')} className="btn-ghost flex-1">← {tr.back}</button>
              <button onClick={handleSaveNew} className="btn-primary flex-1">💾 {tr.save}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function PassengerRow({ index, passenger, onAssignPassport, onRemove, canRemove, tr, isLight, color }) {
  const text  = isLight ? '#0f172a' : '#f1f5f9'
  const muted = isLight ? '#64748b' : '#94a3b8'
  const btnBg = isLight ? '#f1f5f9' : 'rgba(15,23,42,0.60)'
  const btnBd = isLight ? '#cbd5e1' : 'rgba(51,65,85,0.80)'
  return (
    <div className="rounded-xl p-4 flex items-center gap-3"
      style={{ background: isLight ? 'rgba(255,255,255,0.96)' : 'rgba(20,30,53,0.80)',
               border: `1px solid ${isLight ? 'rgba(14,165,233,0.18)' : 'rgba(56,189,248,0.10)'}` }}>
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
        style={{ background: color }}>{index + 1}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs mb-0.5" style={{ color: muted }}>{tr.passenger} {index + 1}</p>
        {passenger.passport
          ? <p className="text-sm font-semibold truncate" style={{ color: text }}>
              {passenger.passport.surname} {passenger.passport.names}
              <span className="font-normal font-mono ml-1 text-xs" style={{ color: muted }}>{passenger.passport.docNum}</span>
            </p>
          : <p className="text-sm italic" style={{ color: muted }}>{tr.noPassportLinked}</p>
        }
      </div>
      <div className="flex gap-1.5 shrink-0">
        <button onClick={() => onAssignPassport(index)}
          className="text-xs px-2.5 py-1.5 rounded-lg transition-all"
          style={{ background: btnBg, border: `1px solid ${btnBd}`, color: muted }}>
          {passenger.passport ? '✏️' : `+ ${tr.assignPassport}`}
        </button>
        {canRemove && (
          <button onClick={() => onRemove(index)}
            className="text-xs px-2 py-1.5 rounded-lg transition-all"
            style={{ background: btnBg, border: `1px solid ${btnBd}`, color: muted }}>🗑</button>
        )}
      </div>
    </div>
  )
}

const PCOLORS = ['#3b82f6','#a855f7','#f59e0b','#22c55e','#ec4899']

export default function BookingFlow({ flight, onBack, onComplete }) {
  const { tr, passports, addPassport, addBooking, theme } = useApp()
  const isLight = theme === 'light'
  const [step, setStep] = useState(0)
  const [passengers, setPassengers] = useState([{ passport: null }])
  const [seatAssignments, setSeatAssignments] = useState({})
  const [seatObjects, setSeatObjects] = useState({})
  const [pickerFor, setPickerFor] = useState(null)
  const [availableSeats, setAvailableSeats] = useState(flight.availableSeats)

  const text   = isLight ? '#0f172a' : '#f1f5f9'
  const muted  = isLight ? '#64748b' : '#94a3b8'
  const cardBg = isLight ? 'rgba(255,255,255,0.96)' : 'rgba(20,30,53,0.80)'
  const cardBd = isLight ? 'rgba(14,165,233,0.18)' : 'rgba(56,189,248,0.10)'
  const div    = isLight ? '#e2e8f0' : 'rgba(51,65,85,0.60)'
  const rowBg  = isLight ? '#f8faff' : 'rgba(15,23,42,0.60)'
  const rowBd  = isLight ? '#e2e8f0' : 'rgba(51,65,85,0.70)'

  useEffect(() => {
    const qs = new URLSearchParams()
    if (flight.aircraft) qs.set('aircraft', flight.aircraft)
    if (flight.prices?.economy) qs.set('economy_price', flight.prices.economy)
    if (flight.prices?.business) qs.set('business_price', flight.prices.business)
    if (flight.prices?.first) qs.set('first_price', flight.prices.first)

    flightsApi.seatmap(flight.id, qs.toString()).then(res => {
      if (!res?.data?.rows) return
      const rows = res.data.rows
      let eco = 0, bus = 0, fst = 0
      rows.forEach(row => {
        row.cols.forEach(col => {
          if (!col.taken) {
            if (col.class === 'economy') eco++
            else if (col.class === 'business') bus++
            else if (col.class === 'first') fst++
          }
        })
      })
      setAvailableSeats({ economy: eco, business: bus, first: fst })
    }).catch(() => {})
  }, [flight.id])
  
  const addPassenger = () => { if (passengers.length < 5) setPassengers(p => [...p, { passport: null }]) }
  const removePassenger = (idx) => {
    setPassengers(p => p.filter((_, i) => i !== idx))
    setSeatAssignments(prev => {
      const next = {}
      Object.entries(prev).forEach(([k, v]) => {
        const ki = Number(k)
        if (ki < idx) next[ki] = v
        else if (ki > idx) next[ki - 1] = v
      })
      return next
    })
  }
  const assignPassport = (idx, passport) =>
    setPassengers(p => p.map((pass, i) => i === idx ? { ...pass, passport } : pass))
  const handleAddNewPassport = (data) => {
    const newP = addPassport(data)
    if (pickerFor !== null) assignPassport(pickerFor, newP)
  }

  const totalPrice = Object.entries(seatAssignments).reduce((sum, [_, seatId]) => {
    const seatObj = seatObjects[seatId]
    if (!seatObj) return sum
    return sum + (flight.prices[seatObj.class] || flight.prices.economy || 0)
  }, 0)

  const allPassportsAssigned = passengers.every(p => p.passport !== null)
  const allSeatsAssigned = passengers.every((_, i) => seatAssignments[i])

  const handleConfirm = () => {
    const tickets = passengers.map((p, i) => {
      const seatId = seatAssignments[i]
      const seatObj = seatObjects[seatId]
      return { seat: seatId, seatClass: seatObj?.class || 'economy', passenger: p.passport }
    })
    const booking = addBooking({ flight, tickets, totalPrice })
    onComplete(booking, tickets)
  }

  const STEPS = [
    { label: tr.passengers, icon: '👥' },
    { label: tr.seatTitle,  icon: '💺' },
    { label: tr.stepConfirm, icon: '🎫' },
  ]

  const CL = { first:'#f59e0b', business:'#a855f7', economy:'#0ea5e9' }
  const CN = { first: tr.classFirst, business: tr.classBusiness, economy: tr.classEconomy }

  return (
    <div className="animate-slide-up">
      {pickerFor !== null && (
        <PassportPickerModal tr={tr} isLight={isLight} passports={passports}
          onClose={() => setPickerFor(null)}
          onSelect={p => assignPassport(pickerFor, p)}
          onAddNew={handleAddNewPassport} />
      )}

      {/* Flight header */}
      <div className="rounded-2xl p-4 mb-5 flex items-center gap-4"
        style={{ background: cardBg, border: `1px solid ${cardBd}`, boxShadow: isLight ? '0 2px 12px rgba(14,165,233,0.07)' : 'none' }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold font-mono text-sm shrink-0"
          style={{ background: 'rgba(14,165,233,0.15)', border: '1px solid rgba(14,165,233,0.30)', color: '#0ea5e9' }}>
          {flight.airlineCode}
        </div>
        <div className="flex-1">
          <p className="font-bold text-sm" style={{ color: text }}>{flight.from.code} → {flight.to.code}</p>
          <p className="text-xs" style={{ color: muted }}>{flight.airline} · {flight.code} · {flight.departure}</p>
          <p className="text-xs mt-0.5" style={{ color: '#4ade80' }}>
            💺 {tr.filterEconomy}: {availableSeats.economy} · {tr.filterBusiness}: {availableSeats.business}
          </p>
        </div>
        <button onClick={onBack} className="btn-ghost text-sm py-1.5 px-3">← {tr.back}</button>
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-0 mb-6">
        {STEPS.map((s, i) => {
          const state = i < step ? 'done' : i === step ? 'active' : 'idle'
          const circleStyle = state === 'done'
            ? { background: '#22c55e', color: '#fff', border: '2px solid #22c55e' }
            : state === 'active'
              ? { background: '#fff', color: '#0ea5e9', border: '2px solid #0ea5e9', boxShadow: '0 0 0 3px rgba(14,165,233,0.15)' }
              : { background: isLight ? '#e2e8f0' : 'rgba(15,23,42,0.60)', color: muted, border: `2px solid ${isLight ? '#cbd5e1' : 'rgba(51,65,85,0.60)'}` }
          return (
            <div key={i} className="flex items-center">
              <div className="flex flex-col items-center gap-1">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-base font-bold transition-all duration-300"
                  style={circleStyle}>
                  {state === 'done' ? '✓' : s.icon}
                </div>
                <span className="text-xs whitespace-nowrap"
                  style={{ color: state === 'active' ? '#0ea5e9' : state === 'done' ? '#22c55e' : muted,
                           fontWeight: state === 'active' ? 600 : 400 }}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="w-10 h-px mb-6 mx-1 transition-colors duration-500"
                  style={{ background: i < step ? '#22c55e' : div }} />
              )}
            </div>
          )
        })}
      </div>

      {/* ── STEP 0: Passengers ── */}
      {step === 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-bold text-lg" style={{ color: text }}>{tr.passengers}</h2>
            <span className="text-sm" style={{ color: muted }}>{passengers.length} / 5</span>
          </div>
          {passengers.map((p, i) => (
            <PassengerRow key={i} index={i} passenger={p} isLight={isLight} tr={tr}
              color={PCOLORS[i % PCOLORS.length]}
              onAssignPassport={idx => setPickerFor(idx)}
              onRemove={removePassenger}
              canRemove={passengers.length > 1} />
          ))}
          {passengers.length < 5 && (
            <button onClick={addPassenger} className="btn-ghost w-full text-sm">{tr.addPassenger}</button>
          )}
          <div className="pt-2">
            {!allPassportsAssigned && (
              <p className="text-xs text-center mt-1 mb-1" style={{ color: '#f59e0b' }}>
                ⚠ {tr.assignPassport}
              </p>
            )}
            <button onClick={() => setStep(1)} disabled={!allPassportsAssigned} className="btn-primary w-full disabled:opacity-40">{tr.next}</button>
          </div>
        </div>
      )}

      {/* ── STEP 1: Seats ── */}
      {step === 1 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg" style={{ color: text }}>{tr.seatTitle}</h2>
            <span className="text-sm" style={{ color: muted }}>{Object.keys(seatAssignments).length} / {passengers.length}</span>
          </div>
          <div className="rounded-2xl p-4 mb-4 overflow-x-auto"
            style={{ background: cardBg, border: `1px solid ${cardBd}`, boxShadow: isLight ? '0 2px 12px rgba(14,165,233,0.07)' : 'none' }}>
            <SeatMap flight={flight} passengers={passengers}
              onSeatAssign={(assignments, lastSeat) => {
                setSeatAssignments(assignments)
                if (lastSeat) setSeatObjects(prev => ({ ...prev, [lastSeat.id]: lastSeat }))
              }} />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(0)} className="btn-ghost flex-1">← {tr.back}</button>
            <button onClick={() => setStep(2)} disabled={!allSeatsAssigned} className="btn-primary flex-1 disabled:opacity-40">{tr.next}</button>
          </div>
        </div>
      )}

      {/* ── STEP 2: Confirm ── */}
      {step === 2 && (
        <div className="max-w-lg mx-auto">
          <div className="rounded-2xl p-6"
            style={{ background: cardBg, border: `1px solid ${cardBd}`, boxShadow: isLight ? '0 2px 12px rgba(14,165,233,0.07)' : 'none' }}>
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-3"
                style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.35)' }}>🎫</div>
              <h2 className="font-bold text-xl" style={{ color: text }}>{tr.confirmBooking}</h2>
              <p className="text-sm mt-1" style={{ color: muted }}>{flight.airline} · {flight.code}</p>
            </div>
            <div className="space-y-2 mb-5">
              {passengers.map((p, i) => {
                const seatId = seatAssignments[i]
                const seatObj = seatObjects[seatId]
                const cls = seatObj?.class || 'economy'
                const price = flight.prices[cls] || flight.prices.economy || 0
                return (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl"
                    style={{ background: rowBg, border: `1px solid ${rowBd}` }}>
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ background: PCOLORS[i % PCOLORS.length] }}>{i + 1}</div>
                      <div>
                        <p className="font-semibold text-sm" style={{ color: text }}>
                          {p.passport ? `${p.passport.surname} ${p.passport.names}` : `${tr.passenger} ${i + 1}`}
                        </p>
                        <p className="text-xs" style={{ color: muted }}>
                          {tr.seat_label} <span className="font-mono font-bold" style={{ color: '#0ea5e9' }}>{seatId}</span>
                          {' · '}<span style={{ color: CL[cls] }}>{CN[cls]}</span>
                        </p>
                      </div>
                    </div>
                    <p className="font-bold text-sm" style={{ color: text }}>{price.toLocaleString('ru')} {tr.som}</p>
                  </div>
                )
              })}
            </div>
            <div className="flex items-center justify-between py-3 mb-5" style={{ borderTop: `1px solid ${div}` }}>
              <span className="font-semibold" style={{ color: muted }}>{tr.total}</span>
              <span className="font-bold text-xl" style={{ color: '#0ea5e9' }}>{totalPrice.toLocaleString('ru')} {tr.som}</span>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="btn-ghost flex-1">← {tr.back}</button>
              <button onClick={handleConfirm} className="btn-primary flex-1">{tr.bookNow}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
