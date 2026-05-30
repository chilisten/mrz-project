from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from django.utils import timezone
from datetime import timedelta
import random
from .models import Flight, Booking, Passport


@csrf_exempt
def api_register(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')  # Это наш никнейм для профиля
            email = data.get('email')        # Это уникальный логин
            password = data.get('password')

            if not username or not email or not password:
                return JsonResponse({'error': 'Заполните все поля'}, status=400)

            # 1. ПРОВЕРКА НА УНИКАЛЬНОСТЬ EMAIL
            # Так как стандартный Django User требует уникальный username, а email по умолчанию может повторяться,
            # мы сделаем так: логином (username в БД) станет EMAIL. А никнейм запишем в first_name или кастомный профиль.
            if User.objects.filter(username=email).exists():
                return JsonResponse({'error': 'Пользователь с таким Email уже зарегистрирован'}, status=400)

            # 2. СОЗДАНИЕ ПОЛЬЗОВАТЕЛЯ
            # Записываем email в поле username (чтобы вход был по email), а никнейм — в first_name
            user = User.objects.create_user(
                username=email, 
                email=email, 
                password=password,
                first_name=username  # Храним никнейм тут, чтобы он мог повторяться!
            )
            
            return JsonResponse({'success': True, 'message': 'Регистрация успешна!'}, status=201)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
            
    return JsonResponse({'error': 'Метод не поддерживается'}, status=405)


@csrf_exempt
def api_login(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            password = data.get('password')

            # Так как при регистрации мы сохранили email в поле username,
            # аутентифицируем по email
            user = authenticate(username=email, password=password)

            if user is not None:
                return JsonResponse({
                    'user_id': user.id,
                    'username': user.first_name,  # Отдаем сохраненный никнейм во фронтенд для профиля
                    'email': user.email
                }, status=200)
            else:
                return JsonResponse({'error': 'Неверный email или пароль'}, status=400)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
            
    return JsonResponse({'error': 'Метод не поддерживается'}, status=405)

# 3. Список рейсов (с фильтрацией и сортировкой для HomeScreen)
def api_flights(request):
    # 1. АВТО-ЗАПОЛНЕНИЕ: Если база пуста, создаем рейсы по структуре Django моделей
    if not Flight.objects.exists():
        test_flights = [
            {"flight_number": "SU-1883", "airline": "Aeroflot", "departure_airport": "FRU", "arrival_airport": "SVO", "departure_city": "Бишкек", "arrival_city": "Москва", "price_som": 15000},
            {"flight_number": "FZ-716", "airline": "FlyDubai", "departure_airport": "FRU", "arrival_airport": "DXB", "departure_city": "Бишкек", "arrival_city": "Дубай", "price_som": 24000},
            {"flight_number": "TK-345", "airline": "Turkish Airlines", "departure_airport": "FRU", "arrival_airport": "IST", "departure_city": "Бишкек", "arrival_city": "Стамбул", "price_som": 28000},
            {"flight_number": "KC-110", "airline": "Air Astana", "departure_airport": "ALA", "arrival_airport": "FRU", "departure_city": "Алматы", "arrival_city": "Бишкек", "price_som": 7500}
        ]
        now = timezone.now()
        for idx, tf in enumerate(test_flights):
            Flight.objects.create(
                flight_number=tf["flight_number"],
                airline=tf["airline"],
                departure_airport=tf["departure_airport"],
                arrival_airport=tf["arrival_airport"],
                departure_city=tf["departure_city"],
                arrival_city=tf["arrival_city"],
                departure_time=now + timedelta(days=1, hours=idx*3),
                arrival_time=now + timedelta(days=1, hours=idx*3 + 4),
                price_som=tf["price_som"],
                available_seats=random.randint(40, 90)
            )

    # 2. Получаем данные и фильтруем
    queryset = Flight.objects.all()
    
    from_city = request.GET.get('from')
    to_city = request.GET.get('to')
    if from_city:
        queryset = queryset.filter(departure_city__icontains=from_city)
    if to_city:
        queryset = queryset.filter(arrival_city__icontains=to_city)
        
    sort_by = request.GET.get('sort') 
    if sort_by == 'price':
        queryset = queryset.order_by('price_som')
    elif sort_by == 'time':
        queryset = queryset.order_by('departure_time')
        
    # 3. Формируем JSON в точном соответствии с ожиданиями HomeScreen.jsx
    flights_list = []
    for f in queryset:
        # Вычисляем красивую длительность полета (например, "4ч 0м")
        duration_delta = f.arrival_time - f.departure_time
        hours = duration_delta.seconds // 3600
        minutes = (duration_delta.seconds % 3600) // 60
        duration_str = f"{hours}ч {minutes}м"

        flights_list.append({
            'id': f.id,
            'code': f.flight_number,                                    # flight.code
            'airline': f.airline,                                       # flight.airline
            'airlineCode': f.flight_number[:2].upper(),                 # flight.airlineCode (например, SU)
            'departure': f.departure_time.strftime('%H:%M'),            # flight.departure
            'arrival': f.arrival_time.strftime('%H:%M'),                # flight.arrival
            'duration': duration_str,                                   # flight.duration
            'stops': 0,                                                 # flight.stops
            'aircraft': 'Boeing 737-800',                               # flight.aircraft
            'from': {                                                   # flight.from.city / code
                'code': f.departure_airport,
                'city': f.departure_city
            },
            'to': {                                                     # flight.to.city / code
                'code': f.arrival_airport,
                'city': f.arrival_city
            },
            'prices': {                                                 # flight.prices.economy / business / first
                'economy': f.price_som,
                'business': int(f.price_som * 1.8),
                'first': int(f.price_som * 2.5)
            },
            'availableSeats': {                                         # flight.availableSeats (для Object.values)
                'economy': f.available_seats,
                'business': 12,
                'first': 4
            }
        })
        
    return JsonResponse({'data': flights_list, 'source': 'api'})

# 4. Мультибронирование (Создание паспортов + сохранение мест + "оплата")
@csrf_exempt
def api_create_booking(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        user_id = data.get('user_id')
        flight_id = data.get('flight_id')
        passengers = data.get('passengers') # Список словарей с данными паспортов и мест
        
        try:
            user = User.objects.get(id=user_id)
            flight = Flight.objects.get(id=flight_id)
            
            # Начинаем оформлять каждого пассажира из твоего BookingFlow
            for p in passengers:
                # 1. Сначала сохраняем или обновляем паспорт в БД
                passport, created = Passport.objects.update_or_create(
                    passport_number=p.get('passport_number'),
                    defaults={
                        'user': user,
                        'country_code': p.get('country_code'),
                        'first_name': p.get('first_name'),
                        'last_name': p.get('last_name'),
                        'birth_date': p.get('birth_date'),
                        'expiry_date': p.get('expiry_date'),
                        'gender': p.get('gender'),
                        'mrz_string': p.get('mrz_string', '')
                    }
                )
                
                # 2. Создаем запись о бронировании (включая класс и место из SeatMap)
                Booking.objects.create(
                    user=user,
                    flight=flight,
                    passport=passport,
                    seat_number=p.get('seat_number'),
                    seat_class=p.get('seat_class') # Эконом / Бизнес
                )
                
                # Уменьшаем число свободных мест на рейсе
                if flight.available_seats > 0:
                    flight.available_seats -= 1
                    flight.save()
                    
            return JsonResponse({'success': True, 'message': 'Бронирование успешно оформлено'})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=400)

# 5. История бронирований с сортировкой по Актуальным/Прошедшим
def api_booking_history(request, user_id):
    # Получаем бронирования конкретного пользователя
    bookings = Booking.objects.filter(user_id=user_id)
    
    # Фильтр: 'all', 'actual' (актуальные), 'past' (прошедшие)
    history_filter = request.GET.get('filter', 'all')
    now = timezone.now()
    
    if history_filter == 'actual':
        bookings = bookings.filter(flight__departure_time__gte=now)
    elif history_filter == 'past':
        bookings = bookings.filter(flight__departure_time__lt=now)
        
    history_list = []
    for b in bookings:
        history_list.append({
            'booking_id': b.id,
            'flight_number': b.flight.flight_number,
            'airline': b.flight.airline,
            'departure_city': b.flight.departure_city,
            'arrival_city': b.flight.arrival_city,
            'departure_time': b.flight.departure_time.strftime('%Y-%m-%d %H:%M'),
            'passenger_name': f"{b.passport.first_name} {b.passport.last_name}",
            'seat_number': b.seat_number,
            'seat_class': b.seat_class,
            'booking_date': b.booking_date.strftime('%Y-%m-%d')
        })
        
    return JsonResponse({'history': history_list})




def api_seatmap(request, flight_id):
    # Генерируем фиксированный сид на основе ID рейса, 
    # чтобы при перезагрузках страницы занятые места оставались теми же
    random.seed(flight_id)
    
    # Конфигурация салона самолета: (название_класса, начальный_ряд, конечный_ряд, список_букв)
    cabin_sections = [
        ('first', 1, 2, ['A', 'B', 'E', 'F']),       # 1-й класс (пошире, 4 кресла в ряд)
        ('business', 3, 5, ['A', 'B', 'C', 'D', 'E', 'F']),  # Бизнес-класс (6 кресел в ряд)
        ('economy', 6, 20, ['A', 'B', 'C', 'D', 'E', 'F'])  # Эконом (6 кресел в ряд)
    ]
    
    rows_list = []
    
    for cabin_class, start_row, end_row, letters in cabin_sections:
        for r_num in range(start_row, end_row + 1):
            cols_list = []
            for letter in letters:
                seat_id = f"{r_num}{letter}"
                # Случайно помечаем ~40% мест как уже занятые (taken)
                is_taken = random.random() < 0.40
                
                cols_list.append({
                    'id': seat_id,
                    'taken': is_taken,
                    'class': cabin_class
                })
                
            rows_list.append({
                'row': r_num,
                'class': cabin_class,
                'cols': cols_list
            })
            
    # Возвращаем структуру в точности так, как её ждет `setSeatMap(res.data)`
    return JsonResponse({
        'data': {
            'rows': rows_list
        },
        'source': 'api'
    })