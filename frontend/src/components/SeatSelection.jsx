import { useState, useMemo } from 'react'
import { generateSeats } from '../data/flights'

export default function SeatSelection({ flight, onSelect }) {
  const { rows, cols, taken } = useMemo(() => generateSeats(), [])
  const takenSet = useMemo(() => new Set(taken), [taken])
  const [selected, setSelected] = useState(null)

  const handleSeat = (seatId) => {
    if (takenSet.has(seatId)) return
    const next = seatId === selected ? null : seatId
    setSelected(next); onSelect(next)
  }

  return (
    <div className="animate-fade-in">
      <div className="flex justify-center mb-4">
        <div className="text-3xl">✈️</div>
      </div>
      <div className="flex justify-center mb-2">
        <div className="w-8 mr-2" />
        {cols.map(c => (
          <div key={c} className="w-8 mx-0.5 text-center text-xs font-mono text-slate-400 dark:text-slate-500 font-bold">{c}</div>
        ))}
      </div>
      <div className="flex flex-col gap-1.5 items-center">
        {Array.from({ length: rows }, (_, i) => i + 1).map(row => (
          <div key={row} className="flex items-center gap-0.5">
            <div className="w-8 text-right text-xs font-mono text-slate-400 dark:text-slate-600 mr-2">{row}</div>
            {cols.map((col, ci) => {
              const seatId = `${row}${col}`
              const isTaken = takenSet.has(seatId)
              const isSelected = selected === seatId
              return (
                <div key={seatId} className="flex items-center">
                  <button
                    onClick={() => handleSeat(seatId)}
                    disabled={isTaken}
                    className={`${isTaken ? 'seat-taken' : isSelected ? 'seat-selected' : 'seat-available'} ${isSelected ? 'animate-pulse-glow' : ''}`}
                    title={isTaken ? 'Занято' : seatId}
                  >
                    {isSelected ? '✓' : isTaken ? '×' : ''}
                  </button>
                  {ci === 2 && <div className="w-4" />}
                </div>
              )
            })}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center gap-4 mt-4 text-xs text-slate-500">
        <div className="flex items-center gap-1.5"><div className="seat-available w-4 h-4" />Свободно</div>
        <div className="flex items-center gap-1.5"><div className="seat-taken w-4 h-4" />Занято</div>
        <div className="flex items-center gap-1.5"><div className="seat-selected w-4 h-4" />Выбрано</div>
      </div>
      {selected && (
        <div className="mt-4 text-center animate-fade-in">
          <span className="text-brand-500 font-bold font-mono text-sm bg-brand-500/10 border border-brand-500/30 px-4 py-1.5 rounded-full">
            Место: {selected}
          </span>
        </div>
      )}
    </div>
  )
}
