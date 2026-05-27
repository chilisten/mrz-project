export const FLIGHTS = [
  {
    id: 'FLT001',
    airline: 'Air Kyrgyzstan',
    code: 'KR 204',
    from: { city: 'Бишкек', code: 'FRU' },
    to: { city: 'Москва', code: 'SVO' },
    departure: '08:45',
    arrival: '12:20',
    duration: '5ч 35м',
    price: 11200,
    seats: 32,
    class: 'Эконом',
    stops: 0,
  },
  {
    id: 'FLT002',
    airline: 'Aeroflot',
    code: 'SU 1762',
    from: { city: 'Бишкек', code: 'FRU' },
    to: { city: 'Москва', code: 'SVO' },
    departure: '14:10',
    arrival: '18:05',
    duration: '5ч 55м',
    price: 8900,
    seats: 18,
    class: 'Эконом',
    stops: 0,
  },
  {
    id: 'FLT003',
    airline: 'Turkish Airlines',
    code: 'TK 883',
    from: { city: 'Бишкек', code: 'FRU' },
    to: { city: 'Стамбул', code: 'IST' },
    departure: '22:55',
    arrival: '03:45+1',
    duration: '6ч 50м',
    price: 17500,
    seats: 7,
    class: 'Бизнес',
    stops: 0,
  },
  {
    id: 'FLT004',
    airline: 'FlyArystan',
    code: 'KC 421',
    from: { city: 'Бишкек', code: 'FRU' },
    to: { city: 'Алматы', code: 'ALA' },
    departure: '10:30',
    arrival: '11:45',
    duration: '1ч 15м',
    price: 3800,
    seats: 44,
    class: 'Эконом',
    stops: 0,
  },
];

export function generateSeats(rows = 6, cols = ['A','B','C','D','E','F']) {
  const taken = new Set();
  const totalSeats = rows * cols.length;
  const takenCount = Math.floor(totalSeats * 0.45);
  while (taken.size < takenCount) {
    const r = Math.floor(Math.random() * rows) + 1;
    const c = cols[Math.floor(Math.random() * cols.length)];
    taken.add(`${r}${c}`);
  }
  return { rows, cols, taken: [...taken] };
}
