from django.urls import path
from . import views

urlpatterns = [
    path('api/register/', views.api_register, name='api_register'),
    path('api/login/', views.api_login, name='api_login'),
    path('api/flights/', views.api_flights, name='api_flights'),
    
    # ВОТ ЭТОТ ПУТЬ МЫ ДОБАВЛЯЕМ:
    path('api/flights/seatmap/<int:flight_id>/', views.api_seatmap, name='api_seatmap'),
    
    path('api/bookings/create/', views.api_create_booking, name='api_create_booking'),
    path('api/history/<int:user_id>/', views.api_booking_history, name='api_booking_history'),
]