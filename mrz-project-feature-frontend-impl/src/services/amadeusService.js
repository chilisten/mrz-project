/**
 * Amadeus API Service & Django Backend Bridge
 */

const USE_MOCK = false; // Бэкенд включен
const BASE_URL = 'http://127.0.0.1:8000/api'; 

const MOCK_FLIGHTS = [
  { id: 'FLT001', airline: 'Air Kyrgyzstan', airlineCode: 'KR', code: 'KR 204', from: { city: 'Бишкек', code: 'FRU', country: 'KG' }, to: { city: 'Москва', code: 'SVO', country: 'RU' }, departure: '08:45', arrival: '12:20', duration: '5ч 35м', date: '2025-07-10', prices: { economy: 11200, business: 28000, first: null }, totalSeats: { economy: 120, business: 20, first: 0 }, availableSeats: { economy: 32, business: 8, first: 0 }, stops: 0, aircraft: 'Boeing 737-800' },
  { id: 'FLT002', airline: 'Aeroflot', airlineCode: 'SU', code: 'SU 1762', from: { city: 'Бишкек', code: 'FRU', country: 'KG' }, to: { city: 'Москва', code: 'SVO', country: 'RU' }, departure: '14:10', arrival: '18:05', duration: '5ч 55м', date: '2025-07-10', prices: { economy: 8900, business: 22000, first: null }, totalSeats: { economy: 150, business: 24, first: 0 }, availableSeats: { economy: 18, business: 5, first: 0 }, stops: 0, aircraft: 'Airbus A320' },
];

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

  for (let r = 0; r < firstRows; r++, rowNum++) {
    const row = { row: rowNum, class: 'first', cols: [] }
    const firstCols = ['A','B','D','E']
    firstCols.forEach(col => row.cols.push({ id: `${rowNum}${col}`, col, taken: Math.random() < 0.3, class: 'first', price: flight?.prices?.first }))
    seats.push(row)
  }
  for (let r = 0; r < businessRows; r++, rowNum++) {
    const row = { row: rowNum, class: 'business', cols: [] }
    cols.forEach(col => row.cols.push({ id: `${rowNum}${col}`, col, taken: Math.random() < 0.35, class: 'business', price: flight?.prices?.business }))
    seats.push(row)
  }
  for (let r = 0; r < economyRows; r++, rowNum++) {
    const row = { row: rowNum, class: 'economy', cols: [] }
    cols.forEach(col => row.cols.push({ id: `${rowNum}${col}`, col, taken: Math.random() < 0.55, class: 'economy', price: flight?.prices?.economy }))
    seats.push(row)
  }
  return { rows: seats, cols, config }
}

export const amadeusService = {
  login: async (email, password) => {
    if (USE_MOCK) return { user_id: 1, username: 'MockUser', email };
    const res = await fetch(`${BASE_URL}/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Ошибка авторизации');
    return data;
  },

  register: async (username, email, password) => {
    if (USE_MOCK) return { success: true };
    const res = await fetch(`${BASE_URL}/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Ошибка при регистрации');
    return data;
  },

  createBooking: async (userId, flightId, passengers) => {
    if (USE_MOCK) return { success: true, booking_id: Math.floor(Math.random() * 1000) };
    const res = await fetch(`${BASE_URL}/bookings/create/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, flight_id: flightId, passengers }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Не удалось сохранить бронирование');
    return data;
  },

  searchFlights: async (params = {}) => {
    if (USE_MOCK) return { data: MOCK_FLIGHTS, source: 'mock' };
    const res = await fetch(`${BASE_URL}/flights/search/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Ошибка при поиске авиабилетов');
    return res.json();
  },

  getAllFlights: async () => {
    if (USE_MOCK) return { data: MOCK_FLIGHTS, source: 'mock' };
    const res = await fetch(`${BASE_URL}/flights/`);
    if (!res.ok) throw new Error('Не удалось загрузить список рейсов');
    const result = await res.json();
    return Array.isArray(result) ? { data: result, source: 'api' } : result;
  },

  getSeatMap: async (flightId, flight) => {
    if (USE_MOCK) return { data: generateSeatMap(flight), source: 'mock' };
    const res = await fetch(`${BASE_URL}/flights/seatmap/${flightId}/`);
    if (!res.ok) throw new Error('Не удалось загрузить схему мест');
    return res.json();
  }
}

export async function searchFlights(params) { return amadeusService.searchFlights(params) }
export async function getAllFlights() { return amadeusService.getAllFlights() }
export async function getSeatMap(flightId, flight) { return amadeusService.getSeatMap(flightId, flight) }