import { useState, useEffect, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { getSeatMap } from '../services/flightsService'

// ── Цвета классов ─────────────────────────────────────────────────────────
function classStyles(cls, isLight, tr) {
  const base = {
    first: {
      available: isLight
        ? { background: '#fff', border: '1.5px solid #fbbf24', color: '#92400e' }
        : { background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.40)', color: '#fbbf24' },
      taken: isLight
        ? { background: '#d1d5db', border: '1.5px solid #9ca3af', color: 'transparent', cursor: 'not-allowed', opacity: 1 }
        : { background: 'rgba(15,23,42,0.50)', border: '1px solid rgba(51,65,85,0.40)', color: 'transparent', cursor: 'not-allowed', opacity: 0.5 },
      selected: { background: '#f59e0b', border: '1px solid #d97706', color: '#fff', boxShadow: '0 0 10px rgba(245,158,11,0.50)' },
      labelColor: '#f59e0b',
      name: tr.classFirst,
    },
    business: {
      available: isLight
        ? { background: '#fff', border: '1.5px solid #a855f7', color: '#581c87' }
        : { background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.40)', color: '#c084fc' },
      taken: isLight
        ? { background: '#d1d5db', border: '1.5px solid #9ca3af', color: 'transparent', cursor: 'not-allowed', opacity: 1 }
        : { background: 'rgba(15,23,42,0.50)', border: '1px solid rgba(51,65,85,0.40)', color: 'transparent', cursor: 'not-allowed', opacity: 0.5 },
      selected: { background: '#a855f7', border: '1px solid #9333ea', color: '#fff', boxShadow: '0 0 10px rgba(168,85,247,0.50)' },
      labelColor: '#a855f7',
      name: tr.classBusiness,
    },
    economy: {
      available: isLight
        ? { background: '#fff', border: '1.5px solid #cbd5e1', color: '#475569' }
        : { background: 'rgba(15,23,42,0.60)', border: '1px solid rgba(51,65,85,0.80)', color: '#64748b' },
      taken: isLight
        ? { background: '#d1d5db', border: '1.5px solid #9ca3af', color: 'transparent', cursor: 'not-allowed', opacity: 1 }
        : { background: 'rgba(15,23,42,0.50)', border: '1px solid rgba(51,65,85,0.40)', color: 'transparent', cursor: 'not-allowed', opacity: 0.5 },
      selected: { background: '#0ea5e9', border: '1px solid #0284c7', color: '#fff', boxShadow: '0 0 10px rgba(14,165,233,0.50)' },
      labelColor: '#0ea5e9',
      name: tr.classEconomy,
    },
  }
  return base[cls] || base.economy
}

const PCOLORS = ['#3b82f6','#a855f7','#f59e0b','#22c55e','#ec4899']

export default function SeatMap({ flight, passengers, onSeatAssign }) {
  const { tr, theme } = useApp()
  const isLight = theme === 'light'
  const [seatMap, setSeatMap] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activePassengerIdx, setActivePassengerIdx] = useState(0)
  const [assignments, setAssignments] = useState({})

  useEffect(() => {
    setLoading(true)
    getSeatMap(flight?.id, flight).then(res => {
      setSeatMap(res.data)
      setLoading(false)
    })
  }, [flight?.id])

  const seatToPassenger = useMemo(() => {
    const m = {}
    Object.entries(assignments).forEach(([pi, seatId]) => { if (seatId) m[seatId] = Number(pi) })
    return m
  }, [assignments])

  const handleSeatClick = (seat) => {
    if (seat.taken) return
    const currentOwner = seatToPassenger[seat.id]
    if (currentOwner !== undefined && currentOwner !== activePassengerIdx) return
    const newA = { ...assignments }
    if (currentOwner === activePassengerIdx) delete newA[activePassengerIdx]
    else newA[activePassengerIdx] = seat.id
    setAssignments(newA)
    onSeatAssign(newA, seat)
  }

  const text  = isLight ? '#0f172a' : '#f1f5f9'
  const muted = isLight ? '#64748b' : '#94a3b8'
  const div   = isLight ? '#e2e8f0' : 'rgba(51,65,85,0.60)'

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <div className="text-3xl animate-bounce">✈️</div>
        <p className="text-sm" style={{ color: muted }}>{tr.loadingFlights}</p>
      </div>
    )
  }
  if (!seatMap) return null

  const { rows } = seatMap
  let lastClass = null

  // Легенда
  const legendItems = [
    { label: tr.seatFreeLabel, style: isLight
        ? { background: '#fff', border: '1.5px solid #cbd5e1', width: 16, height: 16, borderRadius: 4, display: 'inline-block' }
        : { background: 'rgba(15,23,42,0.60)', border: '1px solid rgba(51,65,85,0.80)', width: 16, height: 16, borderRadius: 4, display: 'inline-block' }
    },
    { label: tr.seatTakenLabel, style: isLight
        ? { background: '#d1d5db', border: '1.5px solid #9ca3af', width: 16, height: 16, borderRadius: 4, display: 'inline-block' }
        : { background: 'rgba(15,23,42,0.50)', border: '1px solid rgba(51,65,85,0.40)', width: 16, height: 16, borderRadius: 4, display: 'inline-block', opacity: 0.5 }
    },
    { label: tr.seatSelectedLabel, style: { background: '#0ea5e9', border: '1px solid #0284c7', width: 16, height: 16, borderRadius: 4, display: 'inline-block' } },
  ]

  return (
    <div className="animate-fade-in">

      {/* Passenger selector */}
      {passengers.length > 1 && (
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: muted }}>
            {tr.passengers} · {tr.selectPassengerHint}
          </p>
          <div className="flex gap-2 flex-wrap">
            {passengers.map((p, i) => {
              const assignedSeat = assignments[i]
              return (
                <button key={i} onClick={() => setActivePassengerIdx(i)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                  style={activePassengerIdx === i
                    ? { background: 'rgba(14,165,233,0.15)', border: '1px solid rgba(14,165,233,0.50)', color: text }
                    : { background: isLight ? '#f1f5f9' : 'rgba(15,23,42,0.60)', border: `1px solid ${div}`, color: muted }}>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: PCOLORS[i % PCOLORS.length] }}>{i + 1}</div>
                  <span>{p.passport?.surname || `${tr.passenger} ${i + 1}`}</span>
                  {assignedSeat && (
                    <span className="font-mono font-bold" style={{ color: '#0ea5e9' }}>{assignedSeat}</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap mb-3">
        {legendItems.map(item => (
          <div key={item.label} className="flex items-center gap-1.5">
            <span style={item.style} />
            <span className="text-xs" style={{ color: muted }}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Class price badges */}
      <div className="flex gap-2 flex-wrap mb-4">
        {['first','business','economy'].map(cls => {
          const price = flight?.prices?.[cls]
          if (!price) return null
          const s = classStyles(cls, isLight, tr)
          return (
            <div key={cls} className="text-xs font-semibold px-2 py-1 rounded-lg"
              style={{ background: `${s.labelColor}15`, color: s.labelColor, border: `1px solid ${s.labelColor}40` }}>
              {s.name} · {price.toLocaleString('ru')} {tr.som}
            </div>
          )
        })}
      </div>

      {/* Nose */}
      <div className="flex justify-center mb-3">
        <span className="text-3xl">✈️</span>
      </div>

      {/* Seat grid */}
      <div className="overflow-x-auto pb-2">
        {rows.map((row) => {
          const isNewClass = row.class !== lastClass
          lastClass = row.class
          const S = classStyles(row.class, isLight, tr)
          const cols = row.cols
          // Split into groups by aisle
          let groups
          if (cols.length === 4)      groups = [cols.slice(0,2), cols.slice(2)]
          else if (cols.length === 9) groups = [cols.slice(0,3), cols.slice(3,6), cols.slice(6)]
          else                        groups = [cols.slice(0,3), cols.slice(3)]

          return (
            <div key={row.row}>
              {isNewClass && (
                <div className="flex items-center gap-2 my-3">
                  <div className="text-xs font-bold px-3 py-1 rounded-full"
                    style={{ background: `${S.labelColor}15`, color: S.labelColor, border: `1px solid ${S.labelColor}40` }}>
                    {S.name}
                  </div>
                  <div className="flex-1 h-px" style={{ background: div }} />
                </div>
              )}
              <div className="flex items-center gap-1 mb-1 justify-center">
                <div className="w-7 text-right text-xs font-mono mr-1 shrink-0" style={{ color: isLight ? '#9ca3af' : '#475569' }}>
                  {row.row}
                </div>
                {groups.map((group, gi) => (
                  <div key={gi} className="flex gap-0.5">
                    {gi > 0 && <div className="w-3" />}
                    {group.map(seat => {
                      const ownerIdx = seatToPassenger[seat.id]
                      const isOwnedByActive = ownerIdx === activePassengerIdx
                      const isOwnedByOther  = ownerIdx !== undefined && !isOwnedByActive
                      const isSelected = isOwnedByActive
                      const sStyle = seat.taken
                        ? S.taken
                        : isSelected
                          ? S.selected
                          : isOwnedByOther
                            ? { background: `${PCOLORS[ownerIdx % PCOLORS.length]}30`,
                                border: `1.5px solid ${PCOLORS[ownerIdx % PCOLORS.length]}80`,
                                color: PCOLORS[ownerIdx % PCOLORS.length], cursor: 'not-allowed' }
                            : { ...S.available, cursor: 'pointer' }
                      return (
                        <button
                          key={seat.id}
                          onClick={() => handleSeatClick(seat)}
                          disabled={seat.taken || isOwnedByOther}
                          title={seat.taken ? tr.seatTakenLabel : seat.id}
                          className="w-7 h-7 rounded text-xs font-mono flex items-center justify-center transition-all duration-150 select-none"
                          style={{ ...sStyle }}
                          onMouseEnter={e => {
                            if (!seat.taken && !isOwnedByOther && !isSelected) {
                              e.currentTarget.style.transform = 'scale(1.1)'
                            }
                          }}
                          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
                        >
                          {isSelected ? '✓' : isOwnedByOther ? `${ownerIdx + 1}` : ''}
                        </button>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Assignment summary */}
      {Object.keys(assignments).length > 0 && (
        <div className="mt-5 p-4 rounded-xl animate-fade-in"
          style={{ background: isLight ? '#f8faff' : 'rgba(15,23,42,0.60)', border: `1px solid ${div}` }}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: muted }}>Назначенные места</p>
          <div className="flex flex-wrap gap-2">
            {passengers.map((p, i) => {
              const seatId = assignments[i]
              if (!seatId) return null
              const seatObj = rows.flatMap(r => r.cols).find(s => s.id === seatId)
              const S = classStyles(seatObj?.class || 'economy', isLight, tr)
              return (
                <div key={i} className="flex items-center gap-2 text-xs rounded-lg px-3 py-1.5"
                  style={{ background: isLight ? '#fff' : 'rgba(6,11,20,0.50)', border: `1px solid ${div}` }}>
                  <div className="w-4 h-4 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: PCOLORS[i % PCOLORS.length] }}>{i + 1}</div>
                  <span style={{ color: muted }}>{p.passport?.surname || `П${i+1}`}</span>
                  <span className="font-mono font-bold" style={{ color: '#0ea5e9' }}>{seatId}</span>
                  <span className="px-1.5 py-0.5 rounded font-semibold"
                    style={{ background: `${S.labelColor}15`, color: S.labelColor }}>
                    {S.name}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
