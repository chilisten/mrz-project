# AirBook — Frontend

React-приложение для бронирования авиабилетов с MRZ-сканированием паспорта по фото (Tesseract.js OCR).

Стек: **React 18 · React Router 7 · Vite · Tailwind CSS · Tesseract.js**

---

## Структура проекта

```
frontend/
├── src/
│   ├── main.jsx                  # точка входа React, BrowserRouter
│   ├── App.jsx                   # роутинг, навигационные хэндлеры
│   ├── index.css                 # глобальные стили, Tailwind директивы
│   │
│   ├── components/
│   │   ├── Header.jsx            # навигационный хедер
│   │   ├── FlightCard.jsx        # карточка рейса
│   │   ├── FlightSkeleton.jsx    # скелетон-лоадер для рейсов
│   │   ├── SeatMap.jsx           # интерактивная карта мест
│   │   ├── SeatSelection.jsx     # выбор мест (обёртка)
│   │   ├── PassportScanner.jsx   # загрузка фото + OCR через Tesseract.js
│   │   ├── PassportForm.jsx      # форма ручного ввода паспорта
│   │   ├── StepIndicator.jsx     # индикатор шагов бронирования
│   │   ├── ThemeToggle.jsx       # переключатель тёмной/светлой темы
│   │   └── ErrorBoundary.jsx     # React error boundary
│   │
│   ├── screens/
│   │   ├── HomeScreen.jsx        # главная: лента рейсов, поиск
│   │   ├── AuthScreen.jsx        # вход / регистрация
│   │   ├── BookingFlow.jsx       # пошаговое бронирование (паспорт → места → оплата)
│   │   ├── ConfirmationScreen.jsx# экран подтверждения после бронирования
│   │   └── ProfileScreen.jsx     # профиль: паспорта, история бронирований
│   │
│   ├── context/
│   │   └── AppContext.jsx        # глобальный стейт: user, theme, i18n
│   │
│   ├── services/
│   │   ├── api.js                # fetch-обёртка, auth/flights/bookings/passports API
│   │   └── flightsService.js     # бизнес-логика работы с рейсами
│   │
│   ├── i18n/
│   │   └── translations.js       # переводы RU / KG / EN
│   │
│   └── utils/
│       └── mrzParser.js          # парсер MRZ-строк из OCR-результата
│
├── electron/
│   └── main.cjs                  # Electron-обёртка (десктоп-режим, опционально)
│
├── index.html                    # HTML-шаблон Vite
├── vite.config.js                # конфиг Vite + dev-proxy на бекенд
├── tailwind.config.js            # кастомные цвета brand/dark, шрифты, анимации
├── postcss.config.js             # PostCSS (tailwindcss + autoprefixer)
├── package.json
├── .nvmrc                        # фиксирует версию Node.js
└── .gitignore
```

---

## Быстрый старт

### Требования

- Node.js ≥ 18 (рекомендуется версия из `.nvmrc`)
- npm ≥ 9

```bash
# Установить нужную версию Node (если используете nvm)
nvm use
```

### 1. Установить зависимости

```bash
npm install
```

### 2. Настроить переменные окружения

```bash
cp .env.example .env.local
```

Отредактировать `.env.local`:

```env
# URL бекенда (в dev-режиме proxy в vite.config.js перенаправляет /api → localhost:8000)
VITE_API_URL=http://localhost:8000/api

# После деплоя бекенда на Render:
# VITE_API_URL=https://airbook-backend.onrender.com/api
```

> В dev-режиме `VITE_API_URL` можно не указывать — proxy в `vite.config.js` уже настроен.

### 3. Запустить dev-сервер

```bash
npm run dev
```

Приложение откроется на `http://localhost:5173`.

### 4. Продакшн-сборка

```bash
npm run build
# Статические файлы появятся в dist/
```

---

## Переменные окружения

| Переменная    | Описание                       | По умолчанию                  |
|---------------|--------------------------------|-------------------------------|
| `VITE_API_URL`| URL бекенд-API с суффиксом /api| `http://localhost:8000/api`   |

---

## Как работает сканирование паспорта

Проект использует **сканирование по фото**, а не по камере в реальном времени.

1. Пользователь загружает фотографию разворота паспорта через `PassportScanner.jsx`.
2. Tesseract.js выполняет OCR прямо в браузере (без отправки на сервер).
3. `mrzParser.js` извлекает MRZ-строки (Machine Readable Zone) из распознанного текста.
4. Данные (имя, фамилия, номер документа, дата рождения, срок действия, пол, гражданство) заполняют форму автоматически.
5. Пользователь может отредактировать данные вручную и сохранить паспорт через API.

---

## Деплой на Render

Фронтенд деплоится как **Static Site** отдельно от бекенда.

1. Создать **Static Site** в Render, указать репозиторий и папку `frontend/`.
2. **Build command:** `npm install && npm run build`
3. **Publish directory:** `dist`
4. Добавить переменную окружения:
   ```
   VITE_API_URL=https://ваш-бекенд.onrender.com/api
   ```
5. После деплоя бекенда — обновить эту переменную и перезапустить деплой фронтенда.

> **Важно:** Для SPA-роутинга (React Router) нужно добавить файл `public/_redirects`:
> ```
> /*  /index.html  200
> ```

---

## Запуск в режиме Electron (опционально)

```bash
# Dev-режим (Vite + Electron параллельно)
npm run electron:dev

# Только Electron (если Vite уже запущен)
npm run electron
```

> Electron-режим предназначен для локального десктоп-использования и **не нужен** при деплое на Render.

---

## Разработка

### Структура маршрутов

| Путь            | Экран                          |
|-----------------|--------------------------------|
| `/`             | Главная (лента рейсов)         |
| `/auth`         | Вход / Регистрация             |
| `/booking`      | Процесс бронирования           |
| `/confirmation` | Подтверждение бронирования     |
| `/profile`      | Профиль пользователя           |

### Локализация

Переводы в `src/i18n/translations.js`. Поддерживаемые языки: `ru`, `kg`, `en`.  
Язык переключается через `AppContext` и сохраняется в `localStorage`.