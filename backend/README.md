# AirBook — Backend

REST API для системы бронирования авиабилетов с MRZ-сканированием паспорта по фото.

Стек: **FastAPI · SQLAlchemy (async) · PostgreSQL (Neon cloud) · Alembic · Uvicorn**

---

## Структура проекта

```
backend/
├── app/
│   ├── main.py               # точка входа FastAPI, CORS, lifespan
│   ├── core/
│   │   ├── config.py         # настройки через pydantic-settings / .env
│   │   ├── database.py       # async engine, sessionmaker, Base, get_db
│   │   ├── security.py       # JWT (access + refresh), bcrypt, get_current_user
│   │   └── limiter.py        # slowapi rate-limiter
│   ├── models/
│   │   ├── user.py           # ORM-модель пользователя
│   │   ├── passport.py       # MRZ-данные паспорта (хранятся как текст)
│   │   └── booking.py        # бронирование рейса
│   ├── routers/
│   │   ├── auth.py           # /api/auth — register, login, refresh, /me
│   │   ├── flights.py        # /api/flights — лента всех рейсов, поиск, карта мест
│   │   ├── bookings.py       # /api/bookings — CRUD + отмена
│   │   └── passports.py      # /api/passports — CRUD сохранённых паспортов
│   ├── schemas/
│   │   ├── auth.py           # Pydantic-схемы для auth
│   │   ├── booking.py        # схемы бронирования
│   │   └── passport.py       # схемы паспорта
│   └── services/
│       └── aviationstack.py  # интеграция AviationStack API + генерация карты мест
├── alembic/
│   ├── env.py                # конфигурация Alembic
│   ├── script.py.mako        # шаблон миграций
│   └── versions/
│       └── 0001_initial.py   # начальная миграция (users, bookings, passports)
├── alembic.ini               # настройки Alembic CLI
├── requirements.txt          # зависимости
├── .env.example              # пример переменных окружения
└── .gitignore
```

---

## Быстрый старт

### 1. Клонировать и перейти в папку

```bash
git clone <repo-url>
cd airbook/backend
```

### 2. Создать виртуальное окружение

```bash
python -m venv .venv
source .venv/bin/activate      # Linux / macOS
# .venv\Scripts\activate       # Windows
```

### 3. Установить зависимости

```bash
pip install -r requirements.txt
```

### 4. Настроить переменные окружения

```bash
cp .env.example .env
```

Отредактировать `.env`:

```env
# Строка подключения к Neon PostgreSQL
DATABASE_URL=postgresql+asyncpg://user:password@ep-xxx.neon.tech/neondb

# SSL обязателен для Neon
DB_SSL=True

# Генерировать: python -c "import secrets; print(secrets.token_hex(32))"
SECRET_KEY=your_random_64_char_hex

# Разрешённые origin'ы фронтенда (через запятую)
CORS_ORIGINS=http://localhost:5173,https://your-frontend.onrender.com

# AviationStack (необязательно — без ключа работают демо-данные)
AVIATIONSTACK_API_KEY=your_key_here
```

### 5. Применить миграции

```bash
alembic upgrade head
```

> Neon создаёт базу автоматически, таблицы создаёт Alembic.

### 6. Запустить сервер разработки

```bash
uvicorn app.main:app --reload --port 8000
```

API будет доступен по адресу `http://localhost:8000`.  
Swagger UI: `http://localhost:8000/docs`

---

## Переменные окружения

| Переменная                   | Описание                                           | Обязательная |
|------------------------------|----------------------------------------------------|:------------:|
| `DATABASE_URL`               | asyncpg-строка подключения к PostgreSQL            | ✅           |
| `DB_SSL`                     | Включить SSL (`True` для Neon)                     | ✅           |
| `SECRET_KEY`                 | Секрет для подписи JWT (мин. 32 байта, random hex) | ✅           |
| `ALGORITHM`                  | Алгоритм JWT (по умолчанию `HS256`)                | —            |
| `ACCESS_TOKEN_EXPIRE_MINUTES`| Время жизни access-токена (по умолчанию `30`)      | —            |
| `REFRESH_TOKEN_EXPIRE_DAYS`  | Время жизни refresh-токена (по умолчанию `30`)     | —            |
| `CORS_ORIGINS`               | Разрешённые origin'ы через запятую                 | ✅           |
| `AVIATIONSTACK_API_KEY`      | Ключ AviationStack API                             | —            |

---

## API — основные эндпоинты

| Метод  | Путь                          | Описание                        | Авторизация |
|--------|-------------------------------|---------------------------------|:-----------:|
| POST   | `/api/auth/register`          | Регистрация                     | —           |
| POST   | `/api/auth/login`             | Вход, возвращает токены         | —           |
| POST   | `/api/auth/refresh`           | Обновление access-токена        | —           |
| GET    | `/api/auth/me`                | Профиль текущего пользователя   | ✅          |
| GET    | `/api/flights/all`            | Лента всех рейсов               | —           |
| POST   | `/api/flights/search`         | Поиск рейсов                    | —           |
| GET    | `/api/flights/seatmap/{id}`   | Карта мест (с реальными броями) | —           |
| POST   | `/api/bookings/`              | Создать бронирование            | ✅          |
| GET    | `/api/bookings/`              | История бронирований            | ✅          |
| PATCH  | `/api/bookings/{id}/cancel`   | Отменить бронирование           | ✅          |
| POST   | `/api/passports/`             | Сохранить паспорт               | ✅          |
| GET    | `/api/passports/`             | Список паспортов                | ✅          |
| PUT    | `/api/passports/{id}`         | Обновить паспорт                | ✅          |
| DELETE | `/api/passports/{id}`         | Удалить паспорт                 | ✅          |
| GET    | `/api/health`                 | Health check                    | —           |

Полная документация с примерами: `/docs` (Swagger UI) или `/redoc`.

---

## Деплой на Render

1. Создать новый **Web Service** в Render, указать репозиторий и папку `backend/`.
2. **Build command:** `pip install -r requirements.txt`
3. **Start command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Добавить все переменные из таблицы выше в Environment Variables.
5. В `CORS_ORIGINS` добавить URL задеплоенного фронтенда.
6. После деплоя выполнить миграции через Render Shell:
   ```bash
   alembic upgrade head
   ```

---

## Разработка

### Создание новой миграции

```bash
alembic revision --autogenerate -m "describe_change"
alembic upgrade head
```

### Форматирование и линтинг

```bash
pip install ruff
ruff check app/
ruff format app/
```