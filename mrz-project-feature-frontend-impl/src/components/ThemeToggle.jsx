import { useState, useEffect } from 'react'

export default function ThemeToggle() {
  const [dark, setDark] = useState(true)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    document.documentElement.classList.toggle('light', !dark)
  }, [dark])

  return (
    <button
      onClick={() => setDark(d => !d)}
      className="relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none"
      style={{ background: dark ? '#0ea5e9' : '#cbd5e1' }}
      title="Переключить тему"
    >
      <span
        className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 flex items-center justify-center text-xs"
        style={{ transform: dark ? 'translateX(24px)' : 'translateX(0)' }}
      >
        {dark ? '🌙' : '☀️'}
      </span>
    </button>
  )
}
