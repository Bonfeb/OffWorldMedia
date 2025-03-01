from rest_framework.views import APIView
from rest_framework import generics
from django.http import JsonResponse
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from rest_framework import status
from django.conf import settings
from django.core.mail import send_mail
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import InvalidToken
from django.utils.dateparse import parse_date
from rest_framework.exceptions import ValidationError
from .models import *
from .serializers import *

# User Registration View
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = CustomUserSerializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)

            response = Response({"message": "Registration successful"}, status=status.HTTP_201_CREATED)
            response.set_cookie(
                key="refresh_token",
                value=str(refresh),
                httponly=True,
                secure=True,  # Set to True in production with HTTPS
                samesite="Lax",
                path="/api/token/refresh/"
            )
            response.set_cookie(
                key="access_token",
                value=access_token,
                httponly=True,
                secure=True,
                samesite="Lax",
                path="/"
            )
            return response
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Login View (JWT Token Generation)
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        user = authenticate(username=username, password=password)

        if user:
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)

            response = JsonResponse({
                "message": "Login successful",
                "access_token": access_token
                })
            response.set_cookie(
                key="refresh_token",
                value=str(refresh),
                httponly=True,
                secure=False,  # Set to True if using HTTPS
                samesite="Lax",
                path="/"
            )
            
            return response
        return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

#Logout View
class LogoutView(APIView):
    def post(self, request):
        response = JsonResponse({"message": "Logged out successfully"})
        response.delete_cookie("access_token")
        response.delete_cookie("refresh_token")
        return response

#Custom Token Refresh View
class TokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get("refresh_token")

        if not refresh_token:
            return Response({"error": "No refresh token found"}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            refresh = RefreshToken(refresh_token)
            return Response({"access": str(refresh.access_token)})
        except InvalidToken:
            return Response({"error": "Invalid refresh token"}, status=status.HTTP_401_UNAUTHORIZED)

#Profile View/Edit View
class UserProfileView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        """Retrieve the authenticated user's profile"""
        user = request.user
        serializer = CustomUserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        """Update the authenticated user's profile"""
        user = request.user
        serializer = CustomUserSerializer(user, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Service List & Detail View
class ServiceListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        services = Service.objects.all()
        serializer = ServiceSerializer(services, many=True)
        print(serializer)
        return Response(serializer.data, status=status.HTTP_200_OK)
        

class ServiceDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        try:
            service = Service.objects.get(pk=pk)
            serializer = ServiceSerializer(service)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Service.DoesNotExist:
            return Response({"error": "Service not found"}, status=status.HTTP_404_NOT_FOUND)

# Booking API
class BookingListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]

    def create(self, request):
        serializer = BookingSerializer
        serializer.save(user=self.request.user)

    def get(self, request):
        bookings = Booking.objects.filter(user=request.user)
        serializer = BookingSerializer(bookings, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        data = request.data.copy()
        data["user"] = request.user.id  # Assign the logged-in user

        # Extract service and date from request
        service_id = data.get("service")
        booking_date = data.get("date")

        if not service_id or not booking_date:
            return Response({"error": "Service and date are required"}, status=status.HTTP_400_BAD_REQUEST)

        # Convert booking_date string to date object
        booking_date = parse_date(booking_date)

        # Check if the service has already been booked by any user on the same date
        existing_booking = Booking.objects.filter(service_id=service_id, date=booking_date).exists()
        if existing_booking:
            raise ValidationError({"error": "This service is already booked on the selected date by another user. Please choose another date."})

        # Proceed with saving the booking
        serializer = BookingSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class BookingDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        booking = get_object_or_404(Booking, pk=pk, user=self.request.user)
        serializer = BookingSerializer(booking)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        booking = get_object_or_404(Booking, pk=pk, user=self.request.user)

        # Restrict updates to "Pending" or "Cancelled" bookings
        if booking.status not in ["Pending", "Cancelled"]:
            return Response(
                {"error": "Only Pending or Cancelled bookings can be edited."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        data = request.data.copy()
        data["user"] = self.request.user.id  # Ensure user cannot edit ownership

        # Extract service and date from request
        service_id = data.get("service")
        event_date = data.get("date")
        event_time = data.get("event_time")

        if not service_id or not event_date:
            return Response({"error": "Service and date are required"}, status=status.HTTP_400_BAD_REQUEST)

        # Convert booking_date string to date object
        event_date = parse_date(event_date)
        if not event_date:
            return Response({"error": "Invalid date format"}, status=status.HTTP_400_BAD_REQUEST)

        # Check if another booking exists for the same service and date
        existing_booking = Booking.objects.filter(
            service_id=service_id, event_date=event_date, event_time=event_time
        ).exclude(pk=pk).exists()

        if existing_booking:
            return Response(
                {"error": "This service is already booked on the selected date. Choose another date."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Proceed with updating the booking
        serializer = BookingSerializer(booking, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        booking = get_object_or_404(Booking, pk=pk, user=self.request.user)
        booking.delete()
        return Response({"message": "Booking deleted"}, status=status.HTTP_204_NO_CONTENT)

class UserDashboardView(APIView):
    #permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # Serialize user profile
        user_data = CustomUserSerializer(user).data

        # Categorize bookings
        bookings = Booking.objects.filter(user=user)
        pending = bookings.filter(status="Pending")
        completed = bookings.filter(status="Completed")
        cancelled = bookings.filter(status="Cancelled")

        return Response({
            "user": user_data,
            "bookings": {
                "pending": BookingSerializer(pending, many=True).data,
                "completed": BookingSerializer(completed, many=True).data,
                "cancelled": BookingSerializer(cancelled, many=True).data
            }
        })
     
class ContactUsView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        serializer = ContactUsSerializer(data=request.data)
        if serializer.is_valid():
            contact_message = serializer.save()

            # Send email notification
            subject = f"New Contact Message from {contact_message.name}"
            message = f"""
            Name: {contact_message.name}
            Email: {contact_message.email}
            Subject: {contact_message.subject}
            
            Message:
            {contact_message.message}
            """
            studio_email = settings.DEFAULT_FROM_EMAIL  # Ensure this is set in settings.py
            
            try:
                send_mail(
                    subject,
                    message,
                    settings.DEFAULT_FROM_EMAIL,
                    [studio_email],  # Change this to the studio owner's email
                    fail_silently=False
                )
            except Exception as e:
                return Response({"error": "Message saved, but email could not be sent.", "details": str(e)},
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            return Response({"message": "Your message has been sent!"}, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Review API
class ReviewListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        reviews = Review.objects.all()
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        data = request.data.copy()
        data["user"] = request.user.id
        serializer = ReviewSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class TeamListView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        member = TeamMember.objects.all()
        serializer = TeamMemberSerializer(member, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)