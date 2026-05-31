import { useApp } from '../context/AppContext'

const CLASS_COLORS = { first: '#f59e0b', business: '#a855f7', economy: '#0ea5e9' }
const PCOLORS = ['#3b82f6','#a855f7','#f59e0b','#22c55e','#ec4899']

export default function ConfirmationScreen({ booking, tickets, flight, onNewBooking, onGoHistory }) {
  const { tr, theme } = useApp()
  const isLight = theme === 'light'
  const CN = { first: tr.classFirst, business: tr.classBusiness, economy: tr.classEconomy }

  const text   = isLight ? '#0f172a' : '#f1f5f9'
  const muted  = isLight ? '#64748b' : '#94a3b8'
  const div    = isLight ? '#e2e8f0' : 'rgba(51,65,85,0.60)'
  const cardBg = isLight ? 'rgba(255,255,255,0.96)' : 'rgba(20,30,53,0.80)'
  const cardBd = isLight ? 'rgba(14,165,233,0.18)' : 'rgba(56,189,248,0.10)'
  const rowBg  = isLight ? '#f8faff' : 'rgba(15,23,42,0.60)'
  const rowBd  = isLight ? '#e2e8f0' : 'rgba(51,65,85,0.70)'

  return (
    <div className="animate-slide-up max-w-lg mx-auto">
      <div className="rounded-2xl p-8"
        style={{ background: cardBg, border: `1px solid ${cardBd}`, boxShadow: isLight ? '0 4px 24px rgba(14,165,233,0.10)' : 'none' }}>
        <div className="text-center mb-6">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto mb-4"
            style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.35)' }}>🎫</div>
          <h2 className="font-display font-bold text-2xl mb-1" style={{ color: text }}>{tr.confirmTitle}</h2>
          <p className="text-sm" style={{ color: muted }}>{tr.confirmSub}</p>
        </div>

        <div className="rounded-xl p-4 mb-4" style={{ background: rowBg, border: `1px solid ${rowBd}` }}>
          {[
            { label: tr.flight_label, val: `${flight?.from?.code} → ${flight?.to?.code} · ${flight?.code}` },
            { label: tr.departs,      val: `${flight?.departure} · ${flight?.airline}` },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between pb-3 mb-3"
              style={{ borderBottom: `1px solid ${div}` }}>
              <span className="text-sm" style={{ color: muted }}>{item.label}</span>
              <span className="font-semibold text-sm" style={{ color: text }}>{item.val}</span>
            </div>
          ))}
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: muted }}>{tr.total}</span>
            <span className="font-bold text-lg" style={{ color: '#0ea5e9' }}>{booking?.totalPrice?.toLocaleString('ru')} {tr.som}</span>
          </div>
        </div>

        <div className="space-y-2 mb-6">
          {tickets?.map((ticket, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl p-3"
              style={{ background: rowBg, border: `1px solid ${rowBd}` }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                style={{ background: PCOLORS[i % PCOLORS.length] }}>{i + 1}</div>
              <div className="flex-1">
                <p className="font-semibold text-sm" style={{ color: text }}>
                  {ticket.passenger ? `${ticket.passenger.surname} ${ticket.passenger.names}` : `${tr.passenger} ${i + 1}`}
                </p>
                {ticket.passenger?.docNum && (
                  <p className="text-xs font-mono" style={{ color: muted }}>{ticket.passenger.docNum}</p>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold font-mono" style={{ color: '#0ea5e9' }}>{ticket.seat}</p>
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded"
                  style={{ background: `${CLASS_COLORS[ticket.seatClass] || '#0ea5e9'}20`, color: CLASS_COLORS[ticket.seatClass] || '#0ea5e9' }}>
                  {CN[ticket.seatClass] || tr.classEconomy}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button onClick={onNewBooking} className="btn-ghost flex-1">✈ {tr.newBooking}</button>
          <button onClick={onGoHistory} className="btn-primary flex-1">{tr.historyBtn}</button>
        </div>
      </div>
    </div>
  )
}
