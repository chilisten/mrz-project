import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { LANGUAGES } from '../i18n/translations'
import { amadeusService } from '../services/amadeusService' // <-- ДОБАВЛЕН БЭКЕНД

export default function AuthScreen({ onSuccess, onBack }) {
  const { login, register, lang, setLang, theme, setTheme, tr } = useApp()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ nickname: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const isLight = theme === 'light'

  const handle = (k, v) => setForm(f => ({ ...f, [k]: v }))

  // <-- ЛОГИКА БЭКЕНДА ВСТАВЛЕНА СЮДА
  const submit = async () => {
    setError('')
    if (mode === 'login') {
      if (!form.email || !form.password) { setError('Заполните все поля'); return }
      setLoading(true)
      try {
        const data = await amadeusService.login(form.email, form.password)
        login({ email: form.email, nickname: data.username, id: data.user_id.toString() })
        onSuccess?.()
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    } else {
      if (!form.nickname || !form.email || !form.password) { setError('Заполните все поля'); return }
      setLoading(true)
      try {
        await amadeusService.register(form.nickname, form.email, form.password)
        alert('Регистрация успешна! Теперь вы можете войти.')
        setMode('login')
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
  }

  const googleLogin = async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    login({ email: 'google@user.com', nickname: 'GoogleUser', id: Date.now().toString() })
    setLoading(false)
    onSuccess?.()
  }

  const bg    = isLight ? '#f0f6ff' : '#060b14'
  const cardB = isLight ? 'rgba(255,255,255,0.96)' : 'rgba(20,30,53,0.80)'
  const cardD = isLight ? 'rgba(14,165,233,0.18)' : 'rgba(56,189,248,0.10)'
  const text  = isLight ? '#0f172a' : '#f1f5f9'
  const muted = isLight ? '#64748b' : '#94a3b8'
  const inp   = isLight ? '#f8faff' : 'rgba(15,23,42,0.70)'
  const inpB  = isLight ? '#cbd5e1' : 'rgba(51,65,85,0.80)'
  const div   = isLight ? '#e2e8f0' : 'rgba(51,65,85,0.60)'
  const tabBg = isLight ? '#e9f0fb' : 'rgba(6,11,20,0.70)'
  const inputStyle = {
    background: inp, border: `1px solid ${inpB}`, color: text,
    borderRadius: '0.75rem', padding: '0.75rem 1rem',
    fontSize: '0.875rem', outline: 'none', width: '100%', transition: 'all 0.2s',
  }

  return (
    <div className="min-h-screen font-body relative overflow-hidden flex flex-col items-center justify-center px-4"
      style={{ background: bg }}>

      {!isLight && (
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl" style={{ background: 'rgba(14,165,233,0.06)' }} />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full blur-3xl" style={{ background: 'rgba(99,179,237,0.05)' }} />
        </div>
      )}

      {onBack && (
        <button
          onClick={onBack}
          className="absolute top-4 left-4 z-10 flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-xl transition-all"
          style={{ background: isLight ? 'rgba(255,255,255,0.90)' : 'rgba(20,30,53,0.80)',
                  border: `1px solid ${isLight ? '#cbd5e1' : 'rgba(56,189,248,0.15)'}`,
                  color: muted, backdropFilter: 'blur(8px)' }}>
          ← {tr.backToFeed || 'Лента рейсов'}
        </button>
      )}

      <div className="relative z-10 w-full max-w-sm animate-slide-up">
        <div className="flex flex-col items-center mb-7">
          <div className="w-16 h-16 rounded-2xl bg-brand-500 flex items-center justify-center text-3xl text-white mb-4"
            style={{ boxShadow: '0 0 36px rgba(14,165,233,0.40)' }}>✈</div>
          <h1 className="font-display font-bold text-2xl" style={{ color: text }}>{tr.appName}</h1>
          <p className="text-sm mt-1" style={{ color: muted }}>{tr.welcomeSub}</p>
        </div>

        <div className="rounded-2xl p-4 mb-4 flex items-center justify-between gap-4"
          style={{ background: cardB, border: `1px solid ${cardD}`, boxShadow: isLight ? '0 2px 16px rgba(14,165,233,0.07)' : 'none' }}>
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: muted }}>{tr.chooseLanguage}</p>
            <div className="flex gap-1.5">
              {LANGUAGES.map(l => (
                <button key={l.code} onClick={() => setLang(l.code)}
                  className="flex-1 py-1.5 rounded-lg text-xs font-bold transition-all"
                  style={lang === l.code
                    ? { background: '#0ea5e9', color: '#fff' }
                    : { background: isLight ? '#f1f5f9' : 'rgba(15,23,42,0.70)', color: muted, border: `1px solid ${inpB}` }}>
                  {l.code.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div className="w-px h-10" style={{ background: div }} />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: muted }}>{tr.chooseTheme}</p>
            <div className="flex gap-1.5">
              {[{ val:'dark',icon:'🌙' }, { val:'light',icon:'☀️' }].map(opt => (
                <button key={opt.val} onClick={() => setTheme(opt.val)}
                  className="px-3 py-1.5 rounded-lg text-sm transition-all"
                  style={theme === opt.val
                    ? { background: '#0ea5e9', color: '#fff' }
                    : { background: isLight ? '#f1f5f9' : 'rgba(15,23,42,0.70)', color: muted, border: `1px solid ${inpB}` }}>
                  {opt.icon}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-6"
          style={{ background: cardB, border: `1px solid ${cardD}`, boxShadow: isLight ? '0 2px 16px rgba(14,165,233,0.07)' : 'none' }}>
          <div className="flex gap-1.5 mb-5 rounded-xl p-1" style={{ background: tabBg }}>
            {['login','register'].map(m => (
              <button key={m} onClick={() => { setMode(m); setError('') }}
                className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
                style={mode === m
                  ? { background: '#0ea5e9', color: '#fff', boxShadow: '0 2px 8px rgba(14,165,233,0.30)' }
                  : { background: 'transparent', color: muted }}>
                {m === 'login' ? tr.login : tr.register}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: isLight ? '#475569' : '#94a3b8' }}>{tr.nickname}</label>
                <input style={inputStyle} placeholder={tr.nicknamePlaceholder}
                  value={form.nickname} onChange={e => handle('nickname', e.target.value)} />
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: isLight ? '#475569' : '#94a3b8' }}>{tr.email}</label>
              <input style={inputStyle} type="email" placeholder={tr.emailPlaceholder}
                value={form.email} onChange={e => handle('email', e.target.value)}
                onKeyDown={e => e.key === 'Enter' && submit()} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: isLight ? '#475569' : '#94a3b8' }}>{tr.password}</label>
              <input style={inputStyle} type="password" placeholder={tr.passwordPlaceholder}
                value={form.password} onChange={e => handle('password', e.target.value)}
                onKeyDown={e => e.key === 'Enter' && submit()} />
            </div>
          </div>

          {error && <p className="mt-3 text-sm" style={{ color: '#f87171' }}>⚠️ {error}</p>}

          <button onClick={submit} disabled={loading} className="btn-primary w-full mt-4">
            {loading ? '...' : mode === 'login' ? tr.signIn : tr.signUp}
          </button>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px" style={{ background: div }} />
            <span className="text-xs" style={{ color: muted }}>{tr.orDivider}</span>
            <div className="flex-1 h-px" style={{ background: div }} />
          </div>

          <button onClick={googleLogin} disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center"
            style={{ background: inp, border: `1px solid ${inpB}`, color: isLight ? '#334155' : '#cbd5e1' }}>
            {tr.continueGoogle}
          </button>

          <p className="text-center text-sm mt-4" style={{ color: muted }}>
            {mode === 'login' ? tr.noAccount : tr.alreadyHave}{' '}
            <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
              className="font-semibold transition-colors" style={{ color: '#38bdf8' }}>
              {mode === 'login' ? tr.register : tr.login}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}