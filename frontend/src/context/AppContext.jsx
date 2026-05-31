import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { t } from '../i18n/translations'
import { authApi, flightsApi, bookingsApi, passportsApi, token } from '../services/api'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [user,      setUser]      = useState(null)
  const [lang,      setLang]      = useState(() => localStorage.getItem('airbook_lang') || 'ru')
  const [theme,     setTheme]     = useState(() => localStorage.getItem('airbook_theme') || 'dark')
  const [passports, setPassports] = useState([])
  const [bookings,  setBookings]  = useState([])
  const [authReady, setAuthReady] = useState(false)  // false пока не проверили токен

  // ── Apply theme ────────────────────────────────────────────────────────────
  useEffect(() => {
    document.documentElement.classList.toggle('dark',  theme === 'dark')
    document.documentElement.classList.toggle('light', theme === 'light')
    localStorage.setItem('airbook_theme', theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem('airbook_lang', lang)
  }, [lang])

  useEffect(() => {
    const handleForceLogout = () => {
      token.clear()
      token.clearRefresh()
      setUser(null)
      setPassports([])
      setBookings([])
    }
    window.addEventListener('auth:logout', handleForceLogout)
    return () => window.removeEventListener('auth:logout', handleForceLogout)
  }, [])

  // ── Restore session on mount ───────────────────────────────────────────────
  useEffect(() => {
    const restore = async () => {
      if (!token.get()) { setAuthReady(true); return }
      try {
        const me = await authApi.me()
        setUser(me)
        await loadUserData()
      } catch {
        token.clear()
      } finally {
        setAuthReady(true)
      }
    }
    restore()
  }, []) // eslint-disable-line

  // ── Load passports + bookings from backend ─────────────────────────────────
  const loadUserData = useCallback(async () => {
    try {
      const [pp, bb] = await Promise.all([passportsApi.list(), bookingsApi.list()])
      setPassports(pp.map(normalizePassport))
      setBookings(bb.map(normalizeBooking))
    } catch (e) {
      console.warn('loadUserData error', e)
    }
  }, [])

  // ── Auth ───────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    const data = await authApi.login(email, password)
    token.set(data.access_token)
    token.setRefresh(data.refresh_token)   // ← добавить
    setUser(data.user)
    await loadUserData()
    return data.user
  }

  const register = async (email, password, nickname) => {
    const data = await authApi.register(email, password, nickname)
    token.set(data.access_token)
    token.setRefresh(data.refresh_token)   // ← добавить
    setUser(data.user)
    return data.user
  }

  const logout = () => {
    token.clear()
    token.clearRefresh()                   // ← добавить
    setUser(null)
    setPassports([])
    setBookings([])
  }

  // ── Theme ──────────────────────────────────────────────────────────────────
  const toggleTheme = () => setTheme(th => th === 'dark' ? 'light' : 'dark')

  // ── Passports ──────────────────────────────────────────────────────────────
  const addPassport = async (data) => {
    try {
      const saved = await passportsApi.save({
        surname:  data.surname  || data.Surname  || '',
        names:    data.names    || data.Names    || data.givenNames || '',
        doc_num:  data.doc_num  || data.docNum   || data.documentNumber || '',
        country:  data.country  || data.Country  || '',
        dob:      data.dob      || data.dateOfBirth || '',
        sex:      data.sex      || data.Sex      || '',
        expiry:   data.expiry   || data.expiryDate || '',
        label:    data.label    || null,
      })
      const norm = normalizePassport(saved)
      setPassports(prev => [...prev, norm])
      return norm
    } catch (e) {
      // Fallback: save locally if not authenticated
      const local = { ...data, id: Date.now().toString(), createdAt: new Date().toISOString() }
      setPassports(prev => [...prev, local])
      return local
    }
  }

  const updatePassport = async (id, data) => {
  try {
    const saved = await passportsApi.update(id, {
      surname: data.surname || '',
      names:   data.names   || '',
      doc_num: data.doc_num || data.docNum || '',
      country: data.country || '',
      dob:     data.dob     || '',
      sex:     data.sex     || '',
      expiry:  data.expiry  || '',
      label:   data.label   || null,
    })
    const norm = normalizePassport(saved)
    setPassports(prev => prev.map(p => p.id === id ? norm : p))
    return norm
  } catch (e) {
    // Fallback на локальное обновление
    setPassports(prev => prev.map(p => p.id === id ? { ...p, ...data } : p))
  }
}

  const deletePassport = async (id) => {
    try {
      await passportsApi.delete(id)
    } catch {}
    setPassports(prev => prev.filter(p => p.id !== id))
  }

  // ── Bookings ───────────────────────────────────────────────────────────────
  const addBooking = async (bookingData) => {
    const { flight, tickets, totalPrice } = bookingData
    try {
      const saved = await bookingsApi.create({
        flight_id:   String(flight.id),
        flight_data: flight,
        passengers:  tickets.map(t => ({
          surname:  t.passenger?.surname  || t.passenger?.Surname  || '',
          names:    t.passenger?.names    || t.passenger?.Names    || '',
          doc_num:  t.passenger?.doc_num  || t.passenger?.docNum   || '',
          country:  t.passenger?.country  || t.passenger?.Country  || '',
          dob:      t.passenger?.dob      || t.passenger?.dateOfBirth || '',
          sex:      t.passenger?.sex      || t.passenger?.Sex      || '',
          expiry:   t.passenger?.expiry   || t.passenger?.expiryDate || '',
        })),
        seats: tickets.map((t, i) => ({
          seat_id:       t.seat,
          seat_class:    t.seatClass || 'economy',
          passenger_index: i,
        })),
        total_price: totalPrice,
        currency:    'KGS',
      })
      const norm = normalizeBooking(saved)
      setBookings(prev => [norm, ...prev])
      return norm
    } catch (e) {
      // Fallback: save locally
      const local = { ...bookingData, id: Date.now().toString(), createdAt: new Date().toISOString() }
      setBookings(prev => [local, ...prev])
      return local
    }
  }

  const tr = t[lang] || t.ru

  return (
    <AppContext.Provider value={{
      user, login, logout, register,
      lang, setLang,
      theme, setTheme, toggleTheme,
      passports, addPassport, updatePassport, deletePassport,
      bookings, addBooking,
      loadUserData,
      authReady,
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

// ── Normalizers: backend → frontend shape ────────────────────────────────────

function normalizePassport(p) {
  return {
    id:        String(p.id),
    surname:   p.surname,
    names:     p.names,
    docNum:    p.doc_num,
    country:   p.country,
    dob:       p.dob,
    sex:       p.sex,
    expiry:    p.expiry,
    label:     p.label,
    createdAt: p.created_at,
  }
}

function normalizeBooking(b) {
  // Backend stores flight snapshot in flight_data
  const flight = b.flight_data || b.flight || {}

  // Reconstruct tickets array from passengers + seats
  const tickets = (b.passengers || []).map((pass, i) => {
    const seat = (b.seats || [])[i] || {}
    return {
      seat:       seat.seat_id || '—',
      seatClass:  seat.seat_class || 'economy',
      passenger: {
        surname:  pass.surname,
        names:    pass.names,
        docNum:   pass.doc_num,
        country:  pass.country,
        dob:      pass.dob,
        sex:      pass.sex,
        expiry:   pass.expiry,
      },
    }
  })

  return {
    id:         String(b.id),
    flight,
    tickets,
    totalPrice: Number(b.total_price),
    currency:   b.currency,
    status:     b.status,
    createdAt:  b.created_at,
  }
}
