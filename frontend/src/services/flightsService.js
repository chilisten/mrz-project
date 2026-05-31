/**
 * amadeusService.js — теперь проксирует все вызовы через бэкенд.
 * Интерфейс функций не изменился — HomeScreen и другие компоненты
 * продолжают работать без изменений.
 */

import { flightsApi } from './api'

// ── generateSeatMap остаётся для совместимости с SeatMap.jsx ─────────────────
export function generateSeatMap(flight) {
  const aircraft = flight?.aircraft || 'Boeing 737-800'
  const configs = {
    'Boeing 737-800':   { firstRows: 0, businessRows: 3, economyRows: 27, cols: ['A','B','C','D','E','F'] },
    'Boeing 777-300ER': { firstRows: 2, businessRows: 6, economyRows: 40, cols: ['A','B','C','D','E','F','G','H','J'] },
    'Airbus A320':      { firstRows: 0, businessRows: 3, economyRows: 24, cols: ['A','B','C','D','E','F'] },
    'Airbus A320neo':   { firstRows: 0, businessRows: 0, economyRows: 30, cols: ['A','B','C','D','E','F'] },
    'Embraer E190':     { firstRows: 0, businessRows: 2, economyRows: 20, cols: ['A','B','C','D'] },
    'Airbus A319':      { firstRows: 0, businessRows: 2, economyRows: 22, cols: ['A','B','C','D','E','F'] },
    'Boeing 737 MAX 8': { firstRows: 0, businessRows: 0, economyRows: 29, cols: ['A','B','C','D','E','F'] },
  }
  const config = configs[aircraft] || configs['Boeing 737-800']
  const { firstRows, businessRows, economyRows, cols } = config
  const seats = []
  let rowNum = 1

  for (let r = 0; r < firstRows; r++, rowNum++) {
    const row = { row: rowNum, class: 'first', cols: [] }
    ;['A','B','D','E'].forEach(col => row.cols.push({
      id: `${rowNum}${col}`, col, taken: Math.random() < 0.3, class: 'first', price: flight?.prices?.first,
    }))
    seats.push(row)
  }
  for (let r = 0; r < businessRows; r++, rowNum++) {
    const row = { row: rowNum, class: 'business', cols: [] }
    cols.forEach(col => row.cols.push({
      id: `${rowNum}${col}`, col, taken: Math.random() < 0.35, class: 'business', price: flight?.prices?.business,
    }))
    seats.push(row)
  }
  for (let r = 0; r < economyRows; r++, rowNum++) {
    const row = { row: rowNum, class: 'economy', cols: [] }
    cols.forEach(col => row.cols.push({
      id: `${rowNum}${col}`, col, taken: Math.random() < 0.55, class: 'economy', price: flight?.prices?.economy,
    }))
    seats.push(row)
  }
  return { rows: seats, cols, config }
}

// ── getAllFlights: лента рейсов (HomeScreen) ───────────────────────────────────
export async function getAllFlights() {
  try {
    const res = await flightsApi.all()  // ✅
    return { data: res.data || [], source: 'backend' }
  } catch (e) {
    console.warn('getAllFlights error, using mock:', e.message)
    return { data: MOCK_FLIGHTS, source: 'mock' }
  }
}

// ── searchFlights: поиск с фильтрами ─────────────────────────────────────────
export async function searchFlights(params = {}) {
  try {
    const res = await flightsApi.search({
      origin:       params.origin       || 'FRU',
      destination:  params.destination  || 'SVO',
      date:         params.date         || new Date().toISOString().slice(0,10),
      travel_class: params.class        || 'ECONOMY',
    })
    return { data: res.data || [], source: 'backend' }
  } catch (e) {
    console.warn('searchFlights error, using mock:', e.message)
    return { data: MOCK_FLIGHTS, source: 'mock' }
  }
}

// ── getSeatMap: схема мест ────────────────────────────────────────────────────
export async function getSeatMap(flightId, flight) {
  try {
    const params = new URLSearchParams({ aircraft: flight?.aircraft || 'Boeing 737-800' })

    // Добавляем только если значение существует
    if (flight?.prices?.economy  != null) params.append('economy_price',  flight.prices.economy)
    if (flight?.prices?.business != null) params.append('business_price', flight.prices.business)
    if (flight?.prices?.first    != null) params.append('first_price',    flight.prices.first)

    const res = await flightsApi.seatmap(flightId, params.toString())
    return { data: res.data, source: res.source }
  } catch (e) {
    console.warn('getSeatMap error, using generated:', e.message)
    return { data: generateSeatMap(flight), source: 'generated' }
  }
}

// ── Fallback mock data ────────────────────────────────────────────────────────
const MOCK_FLIGHTS = [
  { id:'FLT001', airline:'Air Kyrgyzstan', airlineCode:'KR', code:'KR 204',
    from:{city:'Бишкек',code:'FRU',country:'KG'}, to:{city:'Москва',code:'SVO',country:'RU'},
    departure:'08:45', arrival:'12:20', duration:'5ч 35м', date:'2025-07-10',
    prices:{economy:11200,business:28000,first:null},
    totalSeats:{economy:120,business:20,first:0}, availableSeats:{economy:32,business:8,first:0},
    stops:0, aircraft:'Boeing 737-800' },
  { id:'FLT002', airline:'Aeroflot', airlineCode:'SU', code:'SU 1762',
    from:{city:'Бишкек',code:'FRU',country:'KG'}, to:{city:'Москва',code:'SVO',country:'RU'},
    departure:'14:10', arrival:'18:05', duration:'5ч 55м', date:'2025-07-10',
    prices:{economy:8900,business:22000,first:null},
    totalSeats:{economy:150,business:24,first:0}, availableSeats:{economy:18,business:5,first:0},
    stops:0, aircraft:'Airbus A320' },
  { id:'FLT003', airline:'Turkish Airlines', airlineCode:'TK', code:'TK 883',
    from:{city:'Бишкек',code:'FRU',country:'KG'}, to:{city:'Стамбул',code:'IST',country:'TR'},
    departure:'22:55', arrival:'03:45+1', duration:'6ч 50м', date:'2025-07-10',
    prices:{economy:17500,business:42000,first:89000},
    totalSeats:{economy:200,business:40,first:8}, availableSeats:{economy:7,business:12,first:3},
    stops:0, aircraft:'Boeing 777-300ER' },
  { id:'FLT004', airline:'FlyArystan', airlineCode:'KC', code:'KC 421',
    from:{city:'Бишкек',code:'FRU',country:'KG'}, to:{city:'Алматы',code:'ALA',country:'KZ'},
    departure:'10:30', arrival:'11:45', duration:'1ч 15м', date:'2025-07-10',
    prices:{economy:3800,business:null,first:null},
    totalSeats:{economy:180,business:0,first:0}, availableSeats:{economy:44,business:0,first:0},
    stops:0, aircraft:'Airbus A320neo' },
]
