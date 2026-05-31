import { Routes, Route, useNavigate, useLocation, Outlet } from 'react-router-dom'
import { useState } from 'react'
import { AppProvider, useApp } from './context/AppContext'
import Header from './components/Header'
import HomeScreen from './screens/HomeScreen'
import ProfileScreen from './screens/ProfileScreen'
import BookingFlow from './screens/BookingFlow'
import ConfirmationScreen from './screens/ConfirmationScreen'
import AuthScreen from './screens/AuthScreen'

// Layout — обёртка с Header для всех страниц кроме /auth
function Layout({ onGoProfile, selectedFlight }) {
  const { theme } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const isLight = theme === 'light'

  return (
    <div className="min-h-screen font-body relative overflow-x-hidden"
      style={{ background: isLight ? '#f0f6ff' : '#060b14', color: isLight ? '#0f172a' : '#fff' }}>

      {!isLight && (
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl"
            style={{ background: 'rgba(14,165,233,0.05)' }} />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full blur-3xl"
            style={{ background: 'rgba(99,179,237,0.05)' }} />
        </div>
      )}

      <Header
        screen={location.pathname}
        onGoHome={() => navigate('/')}
        onGoProfile={onGoProfile}
      />
      <main className="relative z-10 max-w-5xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}

function AppInner() {
  const { user } = useApp()
  const navigate = useNavigate()
  const location = useLocation()

  const [selectedFlight, setSelectedFlight] = useState(null)
  const [lastBooking, setLastBooking]       = useState(null)
  const [lastTickets, setLastTickets]       = useState(null)
  const [profileTab, setProfileTab]         = useState('passports')

  const handleSelectFlight = (flight) => {
    if (!user) { setSelectedFlight(flight); navigate('/auth?intent=booking'); return }
    setSelectedFlight(flight)
    navigate('/booking')
  }

  const handleGoProfile = () => {
    if (!user) { navigate('/auth?intent=profile'); return }
    if (location.pathname === '/profile') { navigate('/'); return }
    setProfileTab('passports')
    navigate('/profile')
  }

  const handleBookingComplete = (booking, tickets) => {
    setLastBooking(booking)
    setLastTickets(tickets)
    navigate('/confirmation')
  }

  return (
    <Routes>
      {/* Страница авторизации — без Header */}
      <Route path="/auth" element={
        <AuthScreen
          onSuccess={() => {
            const params = new URLSearchParams(location.search)
            const intent = params.get('intent')
            if (intent === 'booking' && selectedFlight) navigate('/booking')
            else if (intent === 'profile') navigate('/profile')
            else navigate('/')
          }}
          onBack={() => navigate('/')}
        />
      } />

      {/* Все остальные страницы — с Header через Layout */}
      <Route element={<Layout onGoProfile={handleGoProfile} />}>
        <Route path="/" element={
          <HomeScreen onSelectFlight={handleSelectFlight} />
        } />
        <Route path="/profile" element={
          user
            ? <ProfileScreen initialTab={profileTab} onLogoutSuccess={() => navigate('/')} />
            : <HomeScreen onSelectFlight={handleSelectFlight} />
        } />
        <Route path="/booking" element={
          selectedFlight && user
            ? <BookingFlow flight={selectedFlight} onBack={() => navigate('/')} onComplete={handleBookingComplete} />
            : <HomeScreen onSelectFlight={handleSelectFlight} />
        } />
        <Route path="/confirmation" element={
          lastBooking
            ? <ConfirmationScreen
                booking={lastBooking} tickets={lastTickets} flight={selectedFlight}
                onNewBooking={() => { setSelectedFlight(null); setLastBooking(null); navigate('/') }}
                onGoHistory={() => { setProfileTab('history'); navigate('/profile') }}
              />
            : <HomeScreen onSelectFlight={handleSelectFlight} />
        } />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  )
}