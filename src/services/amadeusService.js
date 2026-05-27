/**
 * Amadeus API Service — FRONTEND STUB
 *
 * Все функции имитируют реальный Amadeus API.
 * Когда бэкендер сделает прокси-сервер:
 *   1. Поменяй BASE_URL на адрес прокси
 *   2. Убери USE_MOCK = true
 *   3. Функции уже принимают и возвращают правильные форматы
 *
 * Реальные эндпоинты (через прокси бэкенда):
 *   POST /api/flights/search       → /shopping/flight-offers/search
 *   GET  /api/flights/seatmap/:id  → /shopping/seatmaps
 */

const USE_MOCK = true
const BASE_URL = '/api' // Бэкенд прокси — поменять когда будет готово

// ─── Моковые данные (расширенные) ─────────────────────────────────────────

const MOCK_FLIGHTS = [
  {
    id: 'FLT001',
    airline: 'Air Kyrgyzstan',
    airlineCode: 'KR',
    code: 'KR 204',
    from: { city: 'Бишкек', code: 'FRU', country: 'KG' },
    to: { city: 'Москва', code: 'SVO', country: 'RU' },
    departure: '08:45',
    arrival: '12:20',
    duration: '5ч 35м',
    date: '2025-07-10',
    prices: { economy: 11200, business: 28000, first: null },
    totalSeats: { economy: 120, business: 20, first: 0 },
    availableSeats: { economy: 32, business: 8, first: 0 },
    stops: 0,
    aircraft: 'Boeing 737-800',
  },
  {
    id: 'FLT002',
    airline: 'Aeroflot',
    airlineCode: 'SU',
    code: 'SU 1762',
    from: { city: 'Бишкек', code: 'FRU', country: 'KG' },
    to: { city: 'Москва', code: 'SVO', country: 'RU' },
    departure: '14:10',
    arrival: '18:05',
    duration: '5ч 55м',
    date: '2025-07-10',
    prices: { economy: 8900, business: 22000, first: null },
    totalSeats: { economy: 150, business: 24, first: 0 },
    availableSeats: { economy: 18, business: 5, first: 0 },
    stops: 0,
    aircraft: 'Airbus A320',
  },
  {
    id: 'FLT003',
    airline: 'Turkish Airlines',
    airlineCode: 'TK',
    code: 'TK 883',
    from: { city: 'Бишкек', code: 'FRU', country: 'KG' },
    to: { city: 'Стамбул', code: 'IST', country: 'TR' },
    departure: '22:55',
    arrival: '03:45+1',
    duration: '6ч 50м',
    date: '2025-07-10',
    prices: { economy: 17500, business: 42000, first: 89000 },
    totalSeats: { economy: 200, business: 40, first: 8 },
    availableSeats: { economy: 7, business: 12, first: 3 },
    stops: 0,
    aircraft: 'Boeing 777-300ER',
  },
  {
    id: 'FLT004',
    airline: 'FlyArystan',
    airlineCode: 'KC',
    code: 'KC 421',
    from: { city: 'Бишкек', code: 'FRU', country: 'KG' },
    to: { city: 'Алматы', code: 'ALA', country: 'KZ' },
    departure: '10:30',
    arrival: '11:45',
    duration: '1ч 15м',
    date: '2025-07-10',
    prices: { economy: 3800, business: null, first: null },
    totalSeats: { economy: 180, business: 0, first: 0 },
    availableSeats: { economy: 44, business: 0, first: 0 },
    stops: 0,
    aircraft: 'Airbus A320neo',
  },
  {
    id: 'FLT005',
    airline: 'Emirates',
    airlineCode: 'EK',
    code: 'EK 772',
    from: { city: 'Бишкек', code: 'FRU', country: 'KG' },
    to: { city: 'Дубай', code: 'DXB', country: 'AE' },
    departure: '01:30',
    arrival: '04:15',
    duration: '4ч 45м',
    date: '2025-07-11',
    prices: { economy: 21000, business: 58000, first: 120000 },
    totalSeats: { economy: 280, business: 42, first: 14 },
    availableSeats: { economy: 65, business: 18, first: 6 },
    stops: 0,
    aircraft: 'Boeing 777-300ER',
  },
  {
    id: 'FLT006',
    airline: 'Pegasus Airlines',
    airlineCode: 'PC',
    code: 'PC 510',
    from: { city: 'Бишкек', code: 'FRU', country: 'KG' },
    to: { city: 'Стамбул', code: 'SAW', country: 'TR' },
    departure: '16:20',
    arrival: '22:40',
    duration: '7ч 20м',
    date: '2025-07-10',
    prices: { economy: 13500, business: null, first: null },
    totalSeats: { economy: 174, business: 0, first: 0 },
    availableSeats: { economy: 29, business: 0, first: 0 },
    stops: 1,
    aircraft: 'Boeing 737 MAX 8',
  },
  {
    id: 'FLT007',
    airline: 'Air Astana',
    airlineCode: 'KC',
    code: 'KC 106',
    from: { city: 'Бишкек', code: 'FRU', country: 'KG' },
    to: { city: 'Нур-Султан', code: 'NQZ', country: 'KZ' },
    departure: '07:00',
    arrival: '08:30',
    duration: '1ч 30м',
    date: '2025-07-10',
    prices: { economy: 5200, business: 14000, first: null },
    totalSeats: { economy: 132, business: 12, first: 0 },
    availableSeats: { economy: 51, business: 4, first: 0 },
    stops: 0,
    aircraft: 'Embraer E190',
  },
  {
    id: 'FLT008',
    airline: 'S7 Airlines',
    airlineCode: 'S7',
    code: 'S7 2481',
    from: { city: 'Бишкек', code: 'FRU', country: 'KG' },
    to: { city: 'Новосибирск', code: 'OVB', country: 'RU' },
    departure: '19:50',
    arrival: '23:15',
    duration: '3ч 25м',
    date: '2025-07-10',
    prices: { economy: 6800, business: 18500, first: null },
    totalSeats: { economy: 156, business: 20, first: 0 },
    availableSeats: { economy: 22, business: 9, first: 0 },
    stops: 0,
    aircraft: 'Airbus A319',
  },
]

// ─── Генератор схемы мест ─────────────────────────────────────────────────

/**
 * Генерирует реалистичную схему мест для самолёта.
 * Возвращает массив рядов с информацией о классе и занятости.
 *
 * Когда будет реальный API: заменить на /shopping/seatmaps
 */
export function generateSeatMap(flight) {
  const aircraft = flight?.aircraft || 'Boeing 737-800'
  const configs = {
    'Boeing 737-800':    { firstRows: 0, businessRows: 3, economyRows: 27, cols: ['A','B','C','D','E','F'] },
    'Boeing 777-300ER':  { firstRows: 2, businessRows: 6, economyRows: 40, cols: ['A','B','C','D','E','F','G','H','J'] },
    'Airbus A320':       { firstRows: 0, businessRows: 3, economyRows: 24, cols: ['A','B','C','D','E','F'] },
    'Airbus A320neo':    { firstRows: 0, businessRows: 0, economyRows: 30, cols: ['A','B','C','D','E','F'] },
    'Embraer E190':      { firstRows: 0, businessRows: 2, economyRows: 20, cols: ['A','B','C','D'] },
    'Airbus A319':       { firstRows: 0, businessRows: 2, economyRows: 22, cols: ['A','B','C','D','E','F'] },
    'Boeing 737 MAX 8':  { firstRows: 0, businessRows: 0, economyRows: 29, cols: ['A','B','C','D','E','F'] },
  }

  const config = configs[aircraft] || configs['Boeing 737-800']
  const { firstRows, businessRows, economyRows, cols } = config

  const seats = []
  let rowNum = 1

  // First class
  for (let r = 0; r < firstRows; r++, rowNum++) {
    const row = { row: rowNum, class: 'first', cols: [] }
    // First class: обычно 2-2 компоновка
    const firstCols = ['A','B','D','E']
    firstCols.forEach(col => {
      row.cols.push({
        id: `${rowNum}${col}`,
        col,
        taken: Math.random() < 0.3,
        class: 'first',
        price: flight?.prices?.first,
      })
    })
    seats.push(row)
  }

  // Business class
  for (let r = 0; r < businessRows; r++, rowNum++) {
    const row = { row: rowNum, class: 'business', cols: [] }
    cols.forEach(col => {
      row.cols.push({
        id: `${rowNum}${col}`,
        col,
        taken: Math.random() < 0.35,
        class: 'business',
        price: flight?.prices?.business,
      })
    })
    seats.push(row)
  }

  // Economy class
  for (let r = 0; r < economyRows; r++, rowNum++) {
    const row = { row: rowNum, class: 'economy', cols: [] }
    cols.forEach(col => {
      row.cols.push({
        id: `${rowNum}${col}`,
        col,
        taken: Math.random() < 0.55,
        class: 'economy',
        price: flight?.prices?.economy,
      })
    })
    seats.push(row)
  }

  return { rows: seats, cols, config }
}

// ─── API функции ──────────────────────────────────────────────────────────

/**
 * Поиск рейсов
 * @param {object} params - { origin, destination, date, passengers, class }
 * @returns {Promise<Flight[]>}
 *
 * TODO (бэкенд): POST /api/flights/search → Amadeus /shopping/flight-offers/search
 */
export async function searchFlights(params = {}) {
  if (USE_MOCK) {
    // Имитация задержки сети
    await new Promise(r => setTimeout(r, 600 + Math.random() * 400))

    let flights = [...MOCK_FLIGHTS]

    if (params.origin) {
      flights = flights.filter(f =>
        f.from.code.toLowerCase().includes(params.origin.toLowerCase()) ||
        f.from.city.toLowerCase().includes(params.origin.toLowerCase())
      )
    }
    if (params.destination) {
      flights = flights.filter(f =>
        f.to.code.toLowerCase().includes(params.destination.toLowerCase()) ||
        f.to.city.toLowerCase().includes(params.destination.toLowerCase())
      )
    }
    if (params.class === 'business') {
      flights = flights.filter(f => f.prices.business !== null)
    }
    if (params.class === 'first') {
      flights = flights.filter(f => f.prices.first !== null)
    }
    if (params.direct) {
      flights = flights.filter(f => f.stops === 0)
    }

    return { data: flights, source: 'mock' }
  }

  // Real API call (бэкенд прокси)
  const res = await fetch(`${BASE_URL}/flights/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  if (!res.ok) throw new Error('Flight search failed')
  return res.json()
}

/**
 * Получить все рейсы (лента)
 * @returns {Promise<Flight[]>}
 */
export async function getAllFlights() {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 400))
    return { data: MOCK_FLIGHTS, source: 'mock' }
  }
  const res = await fetch(`${BASE_URL}/flights`)
  if (!res.ok) throw new Error('Failed to fetch flights')
  return res.json()
}

/**
 * Получить схему мест для рейса
 * @param {string} flightId
 * @param {object} flight
 * @returns {Promise<SeatMap>}
 *
 * TODO (бэкенд): GET /api/flights/seatmap/:id → Amadeus /shopping/seatmaps
 */
export async function getSeatMap(flightId, flight) {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 300))
    return { data: generateSeatMap(flight), source: 'mock' }
  }
  const res = await fetch(`${BASE_URL}/flights/seatmap/${flightId}`)
  if (!res.ok) throw new Error('Failed to fetch seat map')
  return res.json()
}
