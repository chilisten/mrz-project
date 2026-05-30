import { createContext, useContext, useState, useEffect } from 'react'
import { t } from '../i18n/translations'

const AppContext = createContext(null)

const STORAGE_KEY = 'airbook_v2'

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {}
}

export function AppProvider({ children }) {
  const saved = loadState()

  const [user, setUser] = useState(saved?.user || null)
  const [lang, setLang] = useState(saved?.lang || 'ru')
  const [theme, setTheme] = useState(saved?.theme || 'dark')
  const [passports, setPassports] = useState(saved?.passports || [])
  const [bookings, setBookings] = useState(saved?.bookings || [])

  // Apply theme to DOM
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.classList.toggle('light', theme === 'light')
  }, [theme])

  // Persist state
  useEffect(() => {
    saveState({ user, lang, theme, passports, bookings })
  }, [user, lang, theme, passports, bookings])

  const tr = t[lang] || t.ru

  // Auth
  const login = (userData) => setUser(userData)
  const logout = () => setUser(null)
  const register = (userData) => setUser({ ...userData, id: Date.now().toString() })

  // Theme
  const toggleTheme = () => setTheme(th => th === 'dark' ? 'light' : 'dark')

  // Passports
  const addPassport = (data) => {
    const passport = { ...data, id: Date.now().toString(), createdAt: new Date().toISOString() }
    setPassports(prev => [...prev, passport])
    return passport
  }
  const updatePassport = (id, data) => {
    setPassports(prev => prev.map(p => p.id === id ? { ...p, ...data } : p))
  }
  const deletePassport = (id) => {
    setPassports(prev => prev.filter(p => p.id !== id))
  }

  // Bookings
  const addBooking = (booking) => {
    const b = { ...booking, id: Date.now().toString(), createdAt: new Date().toISOString() }
    setBookings(prev => [b, ...prev])
    return b
  }

  return (
    <AppContext.Provider value={{
      user, login, logout, register,
      lang, setLang,
      theme, setTheme, toggleTheme,
      passports, addPassport, updatePassport, deletePassport,
      bookings, addBooking,
      tr,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
