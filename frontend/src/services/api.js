const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';


export const token = {
  get:          () => localStorage.getItem('airbook_token'),
  set:          (t) => localStorage.setItem('airbook_token', t),
  clear:        () => localStorage.removeItem('airbook_token'),
  getRefresh:   () => localStorage.getItem('airbook_refresh'),
  setRefresh:   (t) => localStorage.setItem('airbook_refresh', t),
  clearRefresh: () => localStorage.removeItem('airbook_refresh'),
};

// ─── Core fetch wrapper ────────────────────────────────────────────────────

async function request(path, options = {}) {
  const accessToken = token.get();
  const headers = {
    'Content-Type': 'application/json',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...options.headers,
  };

  let res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  // Если 401 — пробуем обновить токен через refresh
  if (res.status === 401 && token.getRefresh() && path !== '/auth/refresh') {
    const refreshed = await tryRefresh();
    if (refreshed) {
      headers.Authorization = `Bearer ${token.get()}`;
      res = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
      });
    } else {
      token.clear();
      token.clearRefresh();
      window.location.reload();
      return;
    }
  }

  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const detail = data?.detail;
    let msg;

    if (typeof detail === 'string') {
      msg = detail;
    } else if (Array.isArray(detail)) {
      msg = detail.map(err => {
        const field = err.loc?.slice(1).join('.') || '';
        const text  = _translateMsg(err.msg || '');
        return field ? `${_fieldLabel(field)}: ${text}` : text;
      }).join('\n');
    } else {
      msg = `HTTP ${res.status}`;
    }

    const error = new Error(msg);
    error.status = res.status;
    throw error;
  }

  return data;
}

// ─── Refresh token logic ───────────────────────────────────────────────────

async function tryRefresh() {
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: token.getRefresh() }),
    });
    if (!res.ok) {
      // Генерируем событие для AppContext
      window.dispatchEvent(new CustomEvent('auth:logout'))
      return false
    }
    const data = await res.json();
    token.set(data.access_token);
    token.setRefresh(data.refresh_token);
    return true;
  } catch {
    window.dispatchEvent(new CustomEvent('auth:logout'))
    return false;
  }
}

// ─── Field labels ──────────────────────────────────────────────────────────

function _fieldLabel(field) {
  const map = {
    email:    'Email',
    password: 'Пароль',
    nickname: 'Имя пользователя',
    username: 'Имя пользователя',
  };
  return map[field] || field;
}

// ─── Error message translation ─────────────────────────────────────────────

function _translateMsg(msg) {
  if (!msg) return msg;
  return msg
    .replace(/^Value error,\s*/i, '')
    .replace(/value is not a valid email address:/i, '')
    .replace(/An email address must have an @-sign\./i, 'Введите корректный email-адрес.')
    .replace(/There must be something after the @-sign\./i, 'После @ должен быть домен.')
    .replace(/There must be something before the @-sign\./i, 'Перед @ не должно быть пусто.')
    .replace(/The part after the @-sign is not valid\./i, 'Домен после @ некорректен.')
    .replace(/value is not a valid email/i, 'Некорректный email.')
    .replace(/ensure this value has at least (\d+) characters?/i, 'Минимум $1 символов.')
    .replace(/ensure this value has at most (\d+) characters?/i, 'Максимум $1 символов.')
    .replace(/field required/i, 'Обязательное поле.')
    .replace(/string does not match regex/i, 'Недопустимые символы.')
    .trim();
}

// ─── Auth ──────────────────────────────────────────────────────────────────

export const authApi = {
  register: (email, password, nickname) =>
    request('/auth/register', { method: 'POST', body: { email, password, nickname } }),

  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: { email, password } }),

  me: () => request('/auth/me'),

  refresh: (refreshToken) =>
    request('/auth/refresh', { method: 'POST', body: { refresh_token: refreshToken } }),
};

// ─── Flights ───────────────────────────────────────────────────────────────

export const flightsApi = {
  all: () => request('/flights/all'),

  search: (params) =>
    request('/flights/search', { method: 'POST', body: params }),

  // GET вместо POST
  seatmap: (flightId, queryString) =>
    request(`/flights/seatmap/${encodeURIComponent(flightId)}?${queryString}`),
};

// ─── Bookings ──────────────────────────────────────────────────────────────

export const bookingsApi = {
  create: (booking) =>
    request('/bookings/', { method: 'POST', body: booking }),

  list: () => request('/bookings/'),

  get: (id) => request(`/bookings/${id}`),

  cancel: (id) => request(`/bookings/${id}/cancel`, { method: 'PATCH' }),
};

// ─── Passports ─────────────────────────────────────────────────────────────

export const passportsApi = {
  save:   (passport) => request('/passports/', { method: 'POST', body: passport }),
  list:   ()         => request('/passports/'),
  update: (id, passport) => request(`/passports/${id}`, { method: 'PUT', body: passport }),
  delete: (id)       => request(`/passports/${id}`, { method: 'DELETE' }),
};