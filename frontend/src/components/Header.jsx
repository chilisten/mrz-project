import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { LANGUAGES } from '../i18n/translations'

export default function Header({ screen, onGoHome, onGoProfile }) {
  const { user, tr, theme, toggleTheme, lang, setLang } = useApp()
  const [showLangMenu, setShowLangMenu] = useState(false)
  const isLight = theme === 'light'
  const headerBg = isLight ? 'rgba(255,255,255,0.97)' : 'rgba(20,30,53,0.85)'
  const headerBd = isLight ? 'rgba(14,165,233,0.15)' : 'rgba(56,189,248,0.10)'
  const text  = isLight ? '#0f172a' : '#f1f5f9'
  const muted = isLight ? '#64748b' : '#94a3b8'
  const btnBg = isLight ? '#f1f5f9' : 'rgba(15,23,42,0.60)'
  const btnBd = isLight ? '#cbd5e1' : 'rgba(51,65,85,0.80)'

  return (
    <header className="relative z-20 px-4 py-3 sticky top-0"
      style={{ background: headerBg, borderBottom: `1px solid ${headerBd}`,
               boxShadow: isLight ? '0 1px 8px rgba(0,0,0,0.06)' : 'none',
               backdropFilter: 'blur(16px)' }}>
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <button onClick={onGoHome} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-xl bg-brand-500 flex items-center justify-center text-base text-white"
            style={{ boxShadow: '0 0 14px rgba(14,165,233,0.35)' }}>✈</div>
          <div>
            <h1 className="font-display font-bold text-base leading-none" style={{ color: text }}>{tr.appName}</h1>
            <p className="text-xs" style={{ color: muted }}>{tr.appSub}</p>
          </div>
        </button>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button onClick={() => setShowLangMenu(v => !v)}
              className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all"
              style={{ background: btnBg, border: `1px solid ${btnBd}`, color: muted }}>
              {LANGUAGES.find(l => l.code === lang)?.flag} {lang.toUpperCase()} <span>▾</span>
            </button>
            {showLangMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowLangMenu(false)} />
                <div className="absolute right-0 top-full mt-1 rounded-xl p-1 z-50 min-w-[130px]"
                  style={{ background: isLight ? 'rgba(255,255,255,0.98)' : 'rgba(20,30,53,0.95)',
                           border: `1px solid ${btnBd}`, boxShadow: '0 8px 32px rgba(0,0,0,0.20)' }}>
                  {LANGUAGES.map(l => (
                    <button key={l.code} onClick={() => { setLang(l.code); setShowLangMenu(false) }}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-all"
                      style={lang === l.code
                        ? { background: 'rgba(14,165,233,0.15)', color: '#0ea5e9' }
                        : { color: muted }}>
                      {l.flag} {l.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <button onClick={toggleTheme}
            className="relative w-10 h-5 rounded-full transition-colors duration-300 focus:outline-none"
            style={{ background: theme === 'dark' ? '#0ea5e9' : '#cbd5e1' }}>
            <span className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-300 flex items-center justify-center text-xs"
              style={{ transform: theme === 'dark' ? 'translateX(20px)' : 'translateX(0)' }}>
              {theme === 'dark' ? '🌙' : '☀️'}
            </span>
          </button>

          <button onClick={onGoProfile}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-sm font-semibold transition-all duration-200"
            style={screen === 'profile'
              ? { background: 'rgba(14,165,233,0.15)', border: '1px solid rgba(14,165,233,0.40)', color: '#0ea5e9' }
              : { background: btnBg, border: `1px solid ${btnBd}`, color: muted }}>
            {user ? (
              <>
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: 'rgba(14,165,233,0.20)', color: '#0ea5e9' }}>
                  {user.nickname?.[0]?.toUpperCase()}
                </div>
                <span className="hidden sm:inline">{user.nickname}</span>
              </>
            ) : (
              <span>{tr.login}</span>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}