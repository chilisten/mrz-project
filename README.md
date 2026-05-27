# AirBook v2 — MRZ Smart Booking

Система бронирования авиабилетов с MRZ-сканированием паспорта.

## Стек
- Electron + React 18 + Vite
- Tailwind CSS (dark/light mode)
- Tesseract.js (OCR для MRZ)

## Установка и запуск

```bash
npm install
npm run dev           # веб-превью localhost:5173
npm run electron:dev  # Electron + Vite вместе
```

## Структура

```
src/
├── App.jsx                   # Главный роутер
├── context/AppContext.jsx    # Глобальный стейт (юзер, паспорта, бронирования)
├── i18n/translations.js      # KG / RU / EN переводы
├── services/amadeusService.js # Amadeus API заглушка (TODO: бэкенд)
├── screens/
│   ├── AuthScreen.jsx        # Вход / регистрация
│   ├── HomeScreen.jsx        # Лента рейсов + поиск
│   ├── ProfileScreen.jsx     # Профиль, паспорта, история
│   ├── BookingFlow.jsx       # Мультибилетное бронирование
│   └── ConfirmationScreen.jsx
├── components/
│   ├── SeatMap.jsx           # Схема мест (1кл/бизнес/эконом)
│   ├── PassportScanner.jsx   # OCR сканер
│   └── PassportForm.jsx      # Форма паспорта
├── data/flights.js           # Моковые рейсы
└── utils/mrzParser.js        # Парсер MRZ строк
```

## Подключение Amadeus API (бэкенд)

В `src/services/amadeusService.js` установить `USE_MOCK = false`
и поменять `BASE_URL` на адрес прокси-сервера бэкенда.
