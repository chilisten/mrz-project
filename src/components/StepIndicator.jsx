const STEPS = [
  { label: 'Паспорт', icon: '🛂' },
  { label: 'Рейс',    icon: '✈️' },
  { label: 'Место',   icon: '💺' },
  { label: 'Готово',  icon: '🎫' },
]

export default function StepIndicator({ current }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {STEPS.map((step, i) => {
        const state = i < current ? 'done' : i === current ? 'active' : 'idle'
        return (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div className={
                state === 'done'   ? 'step-done' :
                state === 'active' ? 'step-active' : 'step-idle'
              }>
                {state === 'done' ? '✓' : step.icon || (i + 1)}
              </div>
              <span className={`text-xs whitespace-nowrap ${
                state === 'active' ? 'text-brand-500 font-semibold' :
                state === 'done'   ? 'text-green-500' : 'text-slate-400'
              }`}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-12 h-px mb-5 mx-1 transition-colors duration-500 ${
                i < current ? 'bg-green-400' : 'bg-slate-200 dark:bg-dark-500'
              }`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
