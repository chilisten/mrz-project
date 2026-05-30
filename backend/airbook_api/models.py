from django.db import models
from django.contrib.auth.models import User


# 1. Таблица паспортов пассажиров
class Passport(models.Model):
    # Паспорт привязан к пользователю, который его отсканировал
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='passports')
    passport_number = models.CharField(max_length=50, unique=True)
    country_code = models.CharField(max_length=10)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    birth_date = models.CharField(max_length=20)  # Текстом, чтобы проще сохранять из MRZ
    expiry_date = models.CharField(max_length=20)
    gender = models.CharField(max_length=10)
    mrz_string = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.passport_number})"

# 2. Таблица авиарейсов (с поддержкой сортировки)
class Flight(models.Model):
    flight_number = models.CharField(max_length=20, unique=True)
    airline = models.CharField(max_length=100)
    departure_airport = models.CharField(max_length=10) # Например: SVO, FRU, DXB
    arrival_airport = models.CharField(max_length=10)
    departure_city = models.CharField(max_length=100)   # Для сортировки по городам
    arrival_city = models.CharField(max_length=100)     # Для сортировки по городам
    departure_time = models.DateTimeField()
    arrival_time = models.DateTimeField()
    price_som = models.IntegerField()                    # Стоимость в сомах
    available_seats = models.IntegerField(default=120)

    def __str__(self):
        return f"{self.flight_number}: {self.departure_city} -> {self.arrival_city}"

# 3. Таблица бронирований (История)
class Booking(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    flight = models.ForeignKey(Flight, on_delete=models.CASCADE, related_name='bookings')
    passport = models.ForeignKey(Passport, on_delete=models.CASCADE, related_name='bookings')
    seat_number = models.CharField(max_length=10)        # Например: 14A, 5B (из SeatMap.jsx)
    seat_class = models.CharField(max_length=20)         # Эконом / Бизнес
    booking_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Бронь {self.id}: {self.user.username} -> Рейс {self.flight.flight_number}, Место {self.seat_number}"