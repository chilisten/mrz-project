import httpx
import random
import logging
import hashlib
from app.core.config import settings

logger = logging.getLogger(__name__)

AIRPORT_CITIES = {
    "FRU": "Бишкек",
    "ALA": "Алматы",
    "NQZ": "Астана",
    "SVO": "Москва",
    "DME": "Москва",
    "VKO": "Москва",
    "LED": "Санкт-Петербург",
    "IST": "Стамбул",
    "SAW": "Стамбул",
    "DXB": "Дубай",
    "PEK": "Пекин",
    "PKX": "Пекин",
    "OVB": "Новосибирск",
    "TAS": "Ташкент",
    "TSE": "Нур-Султан",
    "KBL": "Кабул",
    "SVX": "Екатеринбург",
    "KZN": "Казань",
    "UFA": "Уфа",
    "AER": "Сочи",
    "HKG": "Гонконг",
    "ICN": "Сеул",
    "NRT": "Токио",
    "BKK": "Бангкок",
    "DEL": "Дели",
    "DOH": "Доха",
    "AUH": "Абу-Даби",
    "LHR": "Лондон",
    "CDG": "Париж",
    "FRA": "Франкфурт",
    "AMS": "Амстердам",
    "VIE": "Вена",
    "MUC": "Мюнхен",
    "ZRH": "Цюрих",
    "FCO": "Рим",
    "BCN": "Барселона",
    "MAD": "Мадрид",
}


def get_city_name(iata_code: str, fallback: str = None) -> str:
    """Возвращает название города по IATA-коду аэропорта."""
    return AIRPORT_CITIES.get(iata_code.upper(), fallback or iata_code.upper())


AIRCRAFT_CONFIGS = {
    "Boeing 737-800":   {"businessRows": 3, "economyRows": 27, "cols": ["A","B","C","D","E","F"]},
    "Boeing 777-300ER": {"businessRows": 6, "economyRows": 40, "cols": ["A","B","C","D","E","F","G","H","J"]},
    "Airbus A320":      {"businessRows": 3, "economyRows": 24, "cols": ["A","B","C","D","E","F"]},
    "Airbus A320neo":   {"businessRows": 2, "economyRows": 28, "cols": ["A","B","C","D","E","F"]},
    "Embraer E190":     {"businessRows": 2, "economyRows": 20, "cols": ["A","B","C","D"]},
    "Airbus A319":      {"businessRows": 2, "economyRows": 22, "cols": ["A","B","C","D","E","F"]},
    "Boeing 737 MAX 8": {"businessRows": 3, "economyRows": 26, "cols": ["A","B","C","D","E","F"]},
    "Boeing 787-9":     {"businessRows": 4, "economyRows": 38, "cols": ["A","B","C","D","E","F","G","H","J"]},
    "default":          {"businessRows": 3, "economyRows": 27, "cols": ["A","B","C","D","E","F"]},
}

# Цены по маршрутам (KGS)
ROUTE_PRICES = {
    ("FRU","SVO"): {"economy": 11200, "business": 32000},
    ("FRU","DME"): {"economy": 10800, "business": 30000},
    ("FRU","LED"): {"economy": 13500, "business": 37000},
    ("FRU","IST"): {"economy": 17500, "business": 48000},
    ("FRU","ALA"): {"economy": 3800,  "business": 9500},
    ("FRU","NQZ"): {"economy": 5200,  "business": 14000},
    ("FRU","OVB"): {"economy": 6800,  "business": 18500},
    ("FRU","DXB"): {"economy": 21000, "business": 58000},
    ("FRU","PEK"): {"economy": 19000, "business": 52000},
    ("FRU","KBL"): {"economy": 8500,  "business": None},
    ("FRU","TAS"): {"economy": 4200,  "business": 11000},
    ("FRU","TSE"): {"economy": 5100,  "business": 13500},
    ("ALA","SVO"): {"economy": 14000, "business": 38000},
    ("ALA","IST"): {"economy": 19000, "business": 51000},
}

# База всех рейсов: (airline, code, num, dep, arr, dur, aircraft, stops, first_price)
ROUTES_DB = {
    ("FRU","SVO"): [
        ("Air Kyrgyzstan",   "KR","204", "08:45","12:20","5ч 35м","Boeing 737-800",    0, None),
        ("Aeroflot",         "SU","1762","14:10","18:05","5ч 55м","Airbus A320",        0, None),
        ("S7 Airlines",      "S7","212", "19:30","23:15","5ч 45м","Boeing 737 MAX 8",   0, None),
        ("Pobeda",           "DP","482", "06:10","10:05","5ч 55м","Boeing 737-800",     0, None),
        ("Ural Airlines",    "U6","3412","11:50","15:40","5ч 50м","Airbus A320",        0, None),
    ],
    ("FRU","DME"): [
        ("Aeroflot",         "SU","1764","07:30","11:20","5ч 50м","Airbus A320",        0, None),
        ("Red Wings",        "WZ","110", "15:00","18:55","5ч 55м","Boeing 737-800",     0, None),
        ("NordStar",         "Y7","412", "22:10","02:05","5ч 55м","Boeing 737-800",     0, None),
    ],
    ("FRU","LED"): [
        ("S7 Airlines",      "S7","294", "09:00","13:30","6ч 30м","Airbus A319",        0, None),
        ("Aeroflot",         "SU","2014","18:30","23:10","6ч 40м","Airbus A320",        0, None),
    ],
    ("FRU","IST"): [
        ("Turkish Airlines", "TK","883", "22:55","03:45","6ч 50м","Airbus A320neo",     0, 89000),
        ("Air Kyrgyzstan",   "KR","112", "11:20","17:40","6ч 20м","Boeing 737-800",     0, None),
        ("Pegasus Airlines", "PC","510", "16:20","22:10","5ч 50м","Boeing 737 MAX 8",   0, None),
    ],
    ("FRU","ALA"): [
        ("FlyArystan",       "KC","421", "10:30","11:45","1ч 15м","Airbus A320",        0, None),
        ("Air Astana",       "KC","882", "16:00","17:15","1ч 15м","Embraer E190",       0, None),
        ("SCAT Airlines",    "DV","712", "08:00","09:20","1ч 20м","Boeing 737-800",     0, None),
        ("Bek Air",          "Z9","104", "13:45","15:00","1ч 15м","Fokker 100",         0, None),
    ],
    ("FRU","NQZ"): [
        ("Air Astana",       "KC","106", "07:00","08:30","1ч 30м","Embraer E190",       0, None),
        ("FlyArystan",       "KC","523", "14:20","15:50","1ч 30м","Airbus A320",        0, None),
        ("SCAT Airlines",    "DV","714", "19:10","20:40","1ч 30м","Boeing 737-800",     0, None),
    ],
    ("FRU","OVB"): [
        ("S7 Airlines",      "S7","2481","19:50","23:15","3ч 25м","Airbus A319",        0, None),
        ("Pobeda",           "DP","502", "12:30","15:55","3ч 25м","Boeing 737-800",     0, None),
    ],
    ("FRU","DXB"): [
        ("flydubai",         "FZ","964", "03:30","06:00","5ч 30м","Boeing 737 MAX 8",   0, None),
        ("Air Arabia",       "G9","512", "14:15","17:00","5ч 45м","Airbus A320",        0, None),
        ("Emirates",         "EK","772", "23:45","02:30","5ч 45м","Boeing 777-300ER",   0, 120000),
    ],
    ("FRU","PEK"): [
        ("Air China",        "CA","638", "10:00","18:30","5ч 30м","Airbus A320",        0, None),
        ("CAAC",             "CA","902", "08:15","13:45","5ч 30м","Boeing 737-800",     0, None),
    ],
    ("FRU","TAS"): [
        ("Uzbekistan AW",    "HY","110", "09:40","11:20","1ч 40м","Airbus A320",        0, None),
        ("Air Kyrgyzstan",   "KR","320", "15:00","16:40","1ч 40м","Boeing 737-800",     0, None),
        ("Qanot Sharq",      "HH","501", "06:30","08:10","1ч 40м","Boeing 757-200",     0, None),
    ],
    ("FRU","TSE"): [
        ("Air Astana",       "KC","202", "08:45","10:25","1ч 40м","Embraer E190",       0, None),
        ("FlyArystan",       "KC","612", "17:30","19:10","1ч 40м","Airbus A320",        0, None),
    ],
    ("ALA","SVO"): [
        ("Air Astana",       "KC","876", "09:00","13:10","6ч 10м","Boeing 767-300",     0, None),
        ("Aeroflot",         "SU","1776","15:30","19:40","6ч 10м","Airbus A320",        0, None),
    ],
    ("ALA","IST"): [
        ("Turkish Airlines", "TK","491", "03:30","08:10","7ч 40м","Boeing 787-9",       0, 95000),
        ("Air Astana",       "KC","932", "20:00","01:40","8ч 40м","Boeing 767-300",     0, None),
    ],
}


async def search_flights(origin: str, destination: str, flight_date: str, limit: int = 20) -> list[dict]:
    if not settings.AVIATIONSTACK_API_KEY:
        return _demo_flights(origin, destination, flight_date)

    try:
        params = {
            "access_key": settings.AVIATIONSTACK_API_KEY,
            "dep_iata": origin.upper(),
            "arr_iata": destination.upper(),
            "flight_date": flight_date,
            "limit": limit,
            "flight_status": "scheduled",
        }
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"{settings.AVIATIONSTACK_BASE_URL}/flights",
                params=params, timeout=15,
            )
            resp.raise_for_status()
            data = resp.json()

        if "error" in data or not data.get("data"):
            return _demo_flights(origin, destination, flight_date)

        return [_normalize(f, origin, destination) for f in data["data"] if f]
    except Exception as e:
        logger.warning(f"AviationStack failed ({origin}→{destination}): {e}")
        return _demo_flights(origin, destination, flight_date)


def _normalize(f: dict, origin: str, destination: str) -> dict:
    dep   = f.get("departure", {})
    arr   = f.get("arrival", {})
    airline = f.get("airline", {})
    flight  = f.get("flight", {})

    dep_time = dep.get("scheduled", "")
    arr_time = arr.get("scheduled", "")
    if "T" in dep_time: dep_time = dep_time[11:16]
    if "T" in arr_time: arr_time = arr_time[11:16]

    origin_code = dep.get("iata") or origin
    dest_code   = arr.get("iata") or destination
    prices = ROUTE_PRICES.get((origin_code.upper(), dest_code.upper()), {"economy": 9000, "business": 25000})

    # Используем маппинг для названий городов, fallback на название аэропорта из API
    from_city = get_city_name(origin_code, dep.get("airport", origin_code))
    to_city   = get_city_name(dest_code,   arr.get("airport", dest_code))

    return {
        "id": flight.get("iata") or f"FL{random.randint(1000,9999)}",
        "airline": airline.get("name", "Unknown"),
        "airlineCode": airline.get("iata", ""),
        "code": f"{airline.get('iata','')} {flight.get('number','')}".strip(),
        "from": {"city": from_city, "code": origin_code, "country": ""},
        "to":   {"city": to_city,   "code": dest_code,   "country": ""},
        "departure": dep_time,
        "arrival":   arr_time,
        "duration":  _calc_duration(dep.get("scheduled"), arr.get("scheduled")),
        "date": (dep.get("scheduled") or "")[:10],
        "prices":         prices,
        "availableSeats": {"economy": random.randint(5,40), "business": random.randint(1,8)},
        "stops": 0,
        "aircraft": f.get("aircraft", {}).get("iata", "Boeing 737-800"),
        "status": f.get("flight_status", "scheduled"),
        "_raw": f,
    }


def _calc_duration(dep_iso, arr_iso):
    if not dep_iso or not arr_iso:
        return ""
    try:
        from datetime import datetime
        dep_dt = datetime.fromisoformat(dep_iso)
        arr_dt = datetime.fromisoformat(arr_iso)
        diff = arr_dt - dep_dt
        h, rem = divmod(int(diff.total_seconds()), 3600)
        m = rem // 60
        if h < 0: return ""
        parts = []
        if h: parts.append(f"{h}ч")
        if m: parts.append(f"{m}м")
        return " ".join(parts)
    except Exception:
        return ""


def _demo_flights(origin: str, destination: str, date: str) -> list[dict]:
    origin = origin.upper()
    destination = destination.upper()
    prices = ROUTE_PRICES.get((origin, destination), {"economy": 9000, "business": 25000})
    template_list = ROUTES_DB.get((origin, destination), [
        ("Generic Air", "GA","100","09:00","13:00","4ч 00м","Boeing 737-800", 0, None),
    ])

    result = []
    for airline, code, num, dep, arr, dur, aircraft, stops, first_price in template_list:
        eco_seats = random.randint(5, 50)
        bus_seats = random.randint(1, 10)
        flight_prices = {
            "economy":  prices.get("economy"),
            "business": prices.get("business"),
            "first":    first_price,
        }
        result.append({
            "id": f"{code}{num}_{date}",
            "airline": airline,
            "airlineCode": code,
            "code": f"{code} {num}",
            "from": {"city": get_city_name(origin),      "code": origin,      "country": ""},
            "to":   {"city": get_city_name(destination), "code": destination, "country": ""},
            "departure": dep,
            "arrival":   arr,
            "duration":  dur,
            "date": date,
            "prices": flight_prices,
            "availableSeats": {"economy": eco_seats, "business": bus_seats, "first": 0 if not first_price else random.randint(1,4)},
            "stops": stops,
            "aircraft": aircraft,
            "status": "scheduled",
            "_raw": None,
        })
    return result


def generate_seatmap(flight_data: dict) -> dict:
    aircraft = flight_data.get("aircraft", "default")
    flight_id = flight_data.get("id", "unknown")
    config   = AIRCRAFT_CONFIGS.get(aircraft, AIRCRAFT_CONFIGS["default"])
    cols     = config["cols"]
    rows     = []
    row_num  = 1

    # Seed на основе flight_id — одинаковый результат при каждом запросе
    seed = int(hashlib.md5(flight_id.encode()).hexdigest(), 16)

    def seeded_random(n: int, occupied_chance: float) -> bool:
        # детерминированный псевдослучай на основе seed + номера места
        val = (seed * 1103515245 + n * 12345) & 0x7fffffff
        return (val / 0x7fffffff) < occupied_chance

    seat_num = 0
    for _ in range(config["businessRows"]):
        rows.append({"row": row_num, "class": "business", "cols": [
            {
                "id": f"{row_num}{c}",
                "col": c,
                "taken": seeded_random(seat_num := seat_num + 1, 0.3),
                "class": "business",
                "price": flight_data.get("prices", {}).get("business")
            }
            for c in cols
        ]})
        row_num += 1

    for _ in range(config["economyRows"]):
        rows.append({"row": row_num, "class": "economy", "cols": [
            {
                "id": f"{row_num}{c}",
                "col": c,
                "taken": seeded_random(seat_num := seat_num + 1, 0.55),
                "class": "economy",
                "price": flight_data.get("prices", {}).get("economy")
            }
            for c in cols
        ]})
        row_num += 1

    return {"rows": rows, "cols": cols, "config": config}