from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import *

urlpatterns = [
    # Auth Endpoints
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),
    #path('token/refresh/', CookieTokenRefreshView.as_view, name='token_refresh'),

    #Profile Endpoint
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('profile/update/', UserProfileView.as_view(), name='profile_udate'),

    #Dashboard Endpoints
    path('userdashboard/', UserDashboardView.as_view(), name="userdashboard"),

    # Service Endpoints
    path('services/', ServiceListView.as_view(), name='service-list'),
    path('services/<int:pk>/', ServiceDetailView.as_view(), name='service-detail'),

    # Booking Endpoints
    path('bookings/', BookingListCreateView.as_view(), name='booking-list'),
    path('bookings/<int:pk>/', BookingDetailView.as_view(), name='booking-detail'),

    # TeamMembers Endpoints
    path('team/', TeamListView.as_view(), name='team'),

    # Review Endpoints
    path('reviews/', ReviewListView.as_view(), name='review-list'),

    #Contact Endpoints
    path('contactus/', ContactUsView.as_view(), name='contactus')
]