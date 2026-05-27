export default function FlightCard({ flight, selected, onSelect }) {
  const seatsColor = flight.seats <= 10
    ? 'text-red-500'
    : flight.seats <= 20 ? 'text-amber-500' : 'text-green-500'

  return (
    <div
      className={`flight-card animate-slide-up ${selected ? 'selected' : ''}`}
      onClick={() => onSelect(flight)}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-sm">
            ✈
          </div>
          <div>
            <p className="font-bold text-sm">{flight.airline}</p>
            <p className="text-slate-500 text-xs font-mono">{flight.code}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-brand-500 font-bold text-lg">
            {flight.price.toLocaleString('ru')} сом
          </p>
          <p className="text-xs text-slate-500">{flight.class}</p>
        </div>
      </div>

      {/* Route */}
      <div className="flex items-center gap-3">
        <div className="text-center min-w-[60px]">
          <p className="font-bold text-xl font-mono">{flight.departure}</p>
          <p className="text-slate-400 text-sm font-semibold">{flight.from.code}</p>
          <p className="text-slate-500 text-xs">{flight.from.city}</p>
        </div>

        <div className="flex-1 flex flex-col items-center gap-1">
          <p className="text-slate-500 text-xs">{flight.duration}</p>
          <div className="relative w-full flex items-center">
            <div className="flex-1 h-px bg-slate-300 dark:bg-dark-500" />
            <div className="w-2 h-2 rounded-full bg-brand-500 mx-1" />
            <div className="flex-1 h-px bg-slate-300 dark:bg-dark-500" />
          </div>
          <p className="text-slate-500 text-xs">
            {flight.stops === 0 ? 'Прямой' : `${flight.stops} пересадка`}
          </p>
        </div>

        <div className="text-center min-w-[60px]">
          <p className="font-bold text-xl font-mono">{flight.arrival}</p>
          <p className="text-slate-400 text-sm font-semibold">{flight.to.code}</p>
          <p className="text-slate-500 text-xs">{flight.to.city}</p>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-dark-600 flex items-center justify-between">
        <span className={`text-xs font-semibold ${seatsColor}`}>
          {flight.seats} мест{flight.seats === 1 ? 'о' : flight.seats < 5 ? 'а' : ''}
        </span>
        <div className={`
          text-xs font-bold py-1 px-3 rounded-full transition-all duration-200
          ${selected
            ? 'bg-brand-500 text-white'
            : 'bg-slate-100 dark:bg-dark-600 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-dark-500 hover:border-brand-500/50 hover:text-brand-500'
          }
        `}>
          {selected ? '✓ Выбран' : 'Выбрать'}
        </div>
      </div>
    </div>
  )
}
