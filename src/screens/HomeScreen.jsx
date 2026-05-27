import { useState, useEffect, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { getAllFlights } from '../services/amadeusService'

export default function HomeScreen({ onSelectFlight }) {
  const { tr, theme } = useApp()
  const isLight = theme === 'light'
  const [flights, setFlights] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterClass, setFilterClass] = useState('all')
  const [filterDirect, setFilterDirect] = useState(false)
  const [sortBy, setSortBy] = useState('price')

  useEffect(() => {
    getAllFlights().then(res => { setFlights(res.data); setLoading(false) })
  }, [])

  const filtered = useMemo(() => {
    let list = [...flights]
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(f =>
        f.airline.toLowerCase().includes(q) ||
        f.from.city.toLowerCase().includes(q) ||
        f.to.city.toLowerCase().includes(q) ||
        f.from.code.toLowerCase().includes(q) ||
        f.to.code.toLowerCase().includes(q) ||
        f.code.toLowerCase().includes(q)
      )
    }
    if (filterClass === 'economy') list = list.filter(f => f.prices.economy)
    if (filterClass === 'business') list = list.filter(f => f.prices.business)
    if (filterClass === 'first') list = list.filter(f => f.prices.first)
    if (filterDirect) list = list.filter(f => f.stops === 0)
    if (sortBy === 'price') list.sort((a, b) => (a.prices.economy || 99999) - (b.prices.economy || 99999))
    if (sortBy === 'time') list.sort((a, b) => a.departure.localeCompare(b.departure))
    if (sortBy === 'duration') list.sort((a, b) => a.duration.localeCompare(b.duration))
    return list
  }, [flights, search, filterClass, filterDirect, sortBy])

  const CLASS_FILTERS = [
    { val: 'all', label: tr.filterAll },
    { val: 'economy', label: tr.filterEconomy },
    { val: 'business', label: tr.filterBusiness },
    { val: 'first', label: tr.filterFirst },
  ]

  const seatsColor = n => n <= 5 ? '#f87171' : n <= 15 ? '#fbbf24' : '#4ade80'

  const classBadgeStyle = (cls) => {
    if (cls === 'first')    return { color: '#f59e0b', background: 'rgba(245,158,11,0.10)',  border: '1px solid rgba(245,158,11,0.30)' }
    if (cls === 'business') return { color: '#a855f7', background: 'rgba(168,85,247,0.10)', border: '1px solid rgba(168,85,247,0.30)' }
    return { color: '#0ea5e9', background: 'rgba(14,165,233,0.10)', border: '1px solid rgba(14,165,233,0.30)' }
  }

  const filterBtnStyle = (active) => active
    ? { background: '#0ea5e9', color: '#fff', border: '1px solid #0ea5e9' }
    : isLight
      ? { background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' }
      : { background: 'rgba(15,23,42,0.60)', color: '#94a3b8', border: '1px solid rgba(51,65,85,0.80)' }

  const directBtnStyle = filterDirect
    ? { background: 'rgba(34,197,94,0.15)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.40)' }
    : isLight
      ? { background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' }
      : { background: 'rgba(15,23,42,0.60)', color: '#94a3b8', border: '1px solid rgba(51,65,85,0.80)' }

  const cardStyle = {
    background: isLight ? 'rgba(255,255,255,0.96)' : 'rgba(20,30,53,0.80)',
    border: `1px solid ${isLight ? 'rgba(14,165,233,0.18)' : 'rgba(56,189,248,0.10)'}`,
    boxShadow: isLight ? '0 2px 12px rgba(14,165,233,0.07)' : 'none',
    borderRadius: '1rem',
    padding: '1.25rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
  }

  const textPrimary = isLight ? '#0f172a' : '#f1f5f9'
  const textSecondary = isLight ? '#475569' : '#94a3b8'
  const textMuted = isLight ? '#64748b' : '#64748b'
  const divider = isLight ? '#e2e8f0' : 'rgba(51,65,85,0.60)'

  return (
    <div className="animate-slide-up">
      {/* Title */}
      <div className="mb-6">
        <h2 className="font-display font-bold text-2xl mb-1" style={{ color: textPrimary }}>{tr.homeTitle}</h2>
        <p className="text-sm flex items-center gap-2" style={{ color: textMuted }}>
          {tr.homeSub}
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{ background: isLight ? '#f1f5f9' : 'rgba(15,23,42,0.70)', border: `1px solid ${divider}`, color: textMuted }}
          >
            {tr.apiNotice}
          </span>
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm" style={{ color: textMuted }}>🔍</span>
        <input
          className="w-full rounded-xl pl-10 pr-10 py-3 text-sm outline-none transition-all duration-200"
          style={{
            background: isLight ? '#fff' : 'rgba(15,23,42,0.70)',
            border: `1px solid ${isLight ? '#cbd5e1' : 'rgba(51,65,85,0.80)'}`,
            color: textPrimary,
          }}
          placeholder={tr.searchPlaceholder}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm transition-colors" style={{ color: textMuted }}>✕</button>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        {CLASS_FILTERS.map(f => (
          <button
            key={f.val}
            onClick={() => setFilterClass(f.val)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
            style={filterBtnStyle(filterClass === f.val)}
          >
            {f.label}
          </button>
        ))}
        <button
          onClick={() => setFilterDirect(d => !d)}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
          style={directBtnStyle}
        >
          ✈ {tr.filterDirect}
        </button>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs" style={{ color: textMuted }}>{tr.sortBy}:</span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="rounded-lg px-2 py-1.5 text-xs outline-none transition-all"
            style={{
              background: isLight ? '#f8faff' : 'rgba(15,23,42,0.70)',
              border: `1px solid ${isLight ? '#cbd5e1' : 'rgba(51,65,85,0.80)'}`,
              color: textPrimary,
            }}
          >
            <option value="price">{tr.sortPrice}</option>
            <option value="time">{tr.sortTime}</option>
            <option value="duration">{tr.sortDuration}</option>
          </select>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="text-3xl animate-bounce">✈️</div>
          <p className="text-sm" style={{ color: textMuted }}>{tr.loadingFlights}</p>
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="text-4xl">🔍</div>
          <p className="font-semibold" style={{ color: textPrimary }}>{tr.noFlights}</p>
          <p className="text-sm" style={{ color: textMuted }}>{tr.noFlightsSub}</p>
        </div>
      )}

      {/* Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((flight, i) => {
            const availableTotal = Object.values(flight.availableSeats).reduce((a, b) => a + b, 0)
            const lowestPrice = flight.prices.economy || flight.prices.business || flight.prices.first
            return (
              <div
                key={flight.id}
                style={{ ...cardStyle, animationDelay: `${i * 60}ms` }}
                className="animate-slide-up"
                onClick={() => onSelectFlight(flight)}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(14,165,233,0.40)'
                  e.currentTarget.style.boxShadow = isLight
                    ? '0 4px 20px rgba(14,165,233,0.13)'
                    : '0 0 20px rgba(14,165,233,0.10)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = isLight ? 'rgba(14,165,233,0.18)' : 'rgba(56,189,248,0.10)'
                  e.currentTarget.style.boxShadow = isLight ? '0 2px 12px rgba(14,165,233,0.07)' : 'none'
                }}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold font-mono text-sm"
                      style={{ background: 'rgba(14,165,233,0.15)', color: '#0ea5e9', border: '1px solid rgba(14,165,233,0.30)' }}>
                      {flight.airlineCode}
                    </div>
                    <div>
                      <p className="font-bold text-sm" style={{ color: textPrimary }}>{flight.airline}</p>
                      <p className="text-xs font-mono" style={{ color: textMuted }}>{flight.code}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg" style={{ color: '#0ea5e9' }}>{lowestPrice?.toLocaleString('ru')} {tr.som}</p>
                    <p className="text-xs" style={{ color: textMuted }}>{tr.filterEconomy}</p>
                  </div>
                </div>

                {/* Route */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-center min-w-[56px]">
                    <p className="font-bold text-xl font-mono" style={{ color: textPrimary }}>{flight.departure}</p>
                    <p className="text-sm font-semibold" style={{ color: textSecondary }}>{flight.from.code}</p>
                    <p className="text-xs" style={{ color: textMuted }}>{flight.from.city}</p>
                  </div>
                  <div className="flex-1 flex flex-col items-center gap-1">
                    <p className="text-xs" style={{ color: textMuted }}>{flight.duration}</p>
                    <div className="relative w-full flex items-center">
                      <div className="flex-1 h-px" style={{ background: divider }} />
                      <div className="w-2 h-2 rounded-full bg-brand-500 mx-1" />
                      <div className="flex-1 h-px" style={{ background: divider }} />
                    </div>
                    <p className="text-xs" style={{ color: textMuted }}>
                      {flight.stops === 0 ? tr.direct : `${flight.stops} ${tr.stops}`}
                    </p>
                  </div>
                  <div className="text-center min-w-[56px]">
                    <p className="font-bold text-xl font-mono" style={{ color: textPrimary }}>{flight.arrival}</p>
                    <p className="text-sm font-semibold" style={{ color: textSecondary }}>{flight.to.code}</p>
                    <p className="text-xs" style={{ color: textMuted }}>{flight.to.city}</p>
                  </div>
                </div>

                {/* Class badges */}
                <div className="flex items-center gap-1.5 flex-wrap mb-3">
                  {flight.prices.economy && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={classBadgeStyle('economy')}>
                      {tr.filterEconomy} · {flight.prices.economy.toLocaleString('ru')}
                    </span>
                  )}
                  {flight.prices.business && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={classBadgeStyle('business')}>
                      {tr.filterBusiness} · {flight.prices.business.toLocaleString('ru')}
                    </span>
                  )}
                  {flight.prices.first && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={classBadgeStyle('first')}>
                      {tr.filterFirst} · {flight.prices.first.toLocaleString('ru')}
                    </span>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3" style={{ borderTop: `1px solid ${divider}` }}>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold" style={{ color: seatsColor(availableTotal) }}>
                      {availableTotal} {tr.seats}
                    </span>
                    <span className="text-xs" style={{ color: textMuted }}>{flight.aircraft}</span>
                  </div>
                  <div
                    className="text-xs font-bold py-1.5 px-4 rounded-full transition-all duration-200"
                    style={isLight
                      ? { background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' }
                      : { background: 'rgba(15,23,42,0.60)', color: '#94a3b8', border: '1px solid rgba(51,65,85,0.80)' }
                    }
                  >
                    {tr.book} →
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
