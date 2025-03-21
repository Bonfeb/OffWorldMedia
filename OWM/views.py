from rest_framework.views import APIView
from rest_framework import generics
from django.http import JsonResponse
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from rest_framework import status
from django.conf import settings
from django.db.models import Count
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
    permission_classes = []

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        user = authenticate(username=username, password=password)

        if user:
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)

            # Get profile picture URL
            profile_pic_url = user.profile_pic.url if user.profile_pic else None
            if profile_pic_url:
                profile_pic_url = request.build_absolute_uri(profile_pic_url)  # Full URL

            response = JsonResponse({
                "message": "Login successful",
                "access_token": access_token,  # ✅ Send access token in response
                "username": user.username,
                "profile_pic": profile_pic_url  
            })

            # Store only refresh token in HTTP-only cookie
            response.set_cookie(
                key="refresh_token",
                value=str(refresh),
                httponly=True,
                secure=False,  # 🔒 Use True in production
                samesite="Lax",  # 🔒 Better CSRF protection
                path="/api/token/refresh/"  # 🔄 Only send with refresh endpoint
            )

            return response
        
        return Response({"error": "Invalid credentials"}, status=401)
        
#Logout View
class LogoutView(APIView):
    def post(self, request):
        response = JsonResponse({"message": "Logged out successfully"})
        response.delete_cookie("access_token")
        response.delete_cookie("refresh_token")
        return response

#Custom Token Refresh View
class CustomTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get("refresh_token")

        if not refresh_token:
            return Response({"error": "No refresh token found"}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            refresh = RefreshToken(refresh_token)
            access_token = str(refresh.access_token)
            response = Response({"access_token": access_token})
            return response
        except Exception as e:
            return Response({"error": "Invalid refresh token"}, status=status.HTTP_401_UNAUTHORIZED)

#Profile View/Edit View
class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]  # Only authenticated users can access

    def get(self, request):
        """Retrieve the authenticated user's profile"""
        serializer = CustomUserSerializer(request.user, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        """Update the authenticated user's profile"""
        serializer = CustomUserSerializer(request.user, data=request.data, partial=True, context={"request": request})

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
    permission_classes = [AllowAny]  # Adjust permissions as needed

    def get(self, request, pk):
        """Fetch service details by ID."""
        service = get_object_or_404(Service, pk=pk)
        serializer = ServiceSerializer(service)
        return Response(serializer.data, status=status.HTTP_200_OK)

# Booking API
class BookingListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = BookingSerializer

    def get_queryset(self):
        booking = Booking.objects.filter(user=self.request.user)
        return booking

    def perform_create(self, serializer):
        service_id = self.request.data.get("service")
        event_date = parse_date(self.request.data.get("event_date"))

        if not service_id or not event_date:
            raise ValidationError({"error": "Service and date are required."})

        if Booking.objects.filter(service_id=service_id, event_date=event_date).exists():
            raise ValidationError({"error": "Service already booked on this date."})

        serializer.save(user=self.request.user)

class BookingView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk=None):
        """Fetches either a specific booking (if `pk` is provided) or all user bookings."""
        if pk:
            # Fetch a specific booking for updating
            booking = get_object_or_404(Booking, pk=pk, user=request.user)
            serializer = BookingSerializer(booking)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            # List all bookings for the logged-in user
            bookings = Booking.objects.filter(user=request.user).order_by("-event_date")
            serializer = BookingSerializer(bookings, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        user=request.user
        pk = kwargs.get("pk")
        print(f"pk: {pk}")  # Debug: Check if pk is being passed correctly
        print(f"kwargs: {kwargs}")  # Debug: Check all kwargs
        print(f"request data: {request.data}")  # Debug: Check request payload
        if pk is None:
            """
            Adds a service to the cart and stores event details.
            """
            service_id = request.data.get("service_id")
            event_date = request.data.get("event_date")
            event_time = request.data.get("event_time")
            event_location = request.data.get("event_location")

            if not service_id or not event_date or not event_time or not event_location:
                return Response({"error": "All fields are required"}, status=status.HTTP_400_BAD_REQUEST)

            service = Service.objects.filter(id=service_id).first()

            if not service:
                return Response({"error": "Service not found."}, status=status.HTTP_404_NOT_FOUND)
            
            cart_item = Cart.objects.create(
                user = user,
                service = service,
                event_date = event_date,
                event_location = event_location,
                event_time = event_time
            )

            return Response(
                {"message": "Event details saved and service added to cart!", "cart_item": CartSerializer(cart_item).data},
                status=status.HTTP_201_CREATED
            )

        else:
            #CASE 2: Create a booking from the cart when "Book" is clicked
            service_id = pk  # pk is provided in the URL, meaning we're booking this service
            print(f"Service ID from URL: {service_id}")
            print(f"User: {user}")
            cart_item = Cart.objects.filter(user=user, service_id=service_id).first()
            if not cart_item:
                return Response({"error": "Service not found in cart"}, status=status.HTTP_404_NOT_FOUND)

            # Extract event details from the cart item
            event_date = cart_item.event_date
            event_time = cart_item.event_time
            event_location = cart_item.event_location

            if not event_date or not event_time or not event_location:
                return Response({"error": "Missing event details"}, status=status.HTTP_400_BAD_REQUEST)

            # Create a booking
            booking = Booking.objects.create(
                user=user,
                service=cart_item.service,
                event_date=event_date,
                event_time=event_time,
                event_location=event_location
            )

            # Remove the item from the cart after successful booking
            cart_item.delete()

            return Response(
                {"message": "Service successfully booked!", "booking": BookingSerializer(booking).data},
                status=status.HTTP_201_CREATED
            )


    def put(self, request, pk):
        """Updates an existing booking's event details."""
        print("Received Data:", request.data)
        booking = get_object_or_404(Booking, pk=pk, user=request.user)

        if booking.status not in ["Pending", "Cancelled"]:
            return Response(
                {"error": "Only Pending or Cancelled bookings can be edited."},
                status=status.HTTP_400_BAD_REQUEST
            )

        data = request.data.copy()
        data["user"] = request.user.id  # Ensure the correct user is set

        service_id = data.get("service")
        event_date = parse_date(data.get("event_date"))

        if not service_id:
            return Response({"error": "Service is required."}, status=status.HTTP_400_BAD_REQUEST)

        if not event_date:
            return Response({"error": "Valid event date is required."}, status=status.HTTP_400_BAD_REQUEST)

        # Ensure the same service is not double booked on the same date
        existing_booking = Booking.objects.filter(
            service_id=service_id, event_date=event_date
        ).exclude(pk=pk).exists()

        if existing_booking:
            return Response(
                {"error": "Service already booked on this date."},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = BookingSerializer(booking, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        """Deletes a booking (user can delete their own, admin can delete any)."""
        user = request.user
        booking = get_object_or_404(Booking, pk=pk)

        if request.user != booking.user and not request.user.is_staff:
            return Response(
                {"error": "You do not have permission to delete this booking."},
                status=status.HTTP_403_FORBIDDEN
            )
        if booking.status not in ["Pending"] and not user.is_staff:
            return Response(
                {"error": "You do not have permission to delete a booking whose statsus is not Pending"}, status=status.HTTP_403_FORBIDDEN
                )
        
        booking.delete()
        return Response({"message": "Booking deleted successfully."}, status=status.HTTP_204_NO_CONTENT)

#User Dashboard View
class UserDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Fetch user details, bookings, and cart.
        user = request.user
        context = {'request': request}

        # Fetch user cart items
        cart_items = Cart.objects.filter(user=user).all()
        cart_data = CartSerializer(cart_items, many=True, context=context).data  

        print("serialized cart data:", cart_data)
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
                "pending": BookingSerializer(pending, many=True, context=context).data,
                "completed": BookingSerializer(completed, many=True, context=context).data,
                "cancelled": BookingSerializer(cancelled, many=True, context=context).data
            },
            "cart": cart_data  
        })
    
    def delete(self, request, pk):
        user = request.user

        cart_item = Cart.objects.filter(user=user, id=pk).first()

        if not cart_item:
            return Response({"error": "Item not found in cart"}, status=status.HTTP_404_NOT_FOUND)

        cart_item.delete()

        return Response({"message": "Item removed from cart", "cart": CartSerializer(Cart.objects.filter(user=user), many=True).data}, status=status.HTTP_200_OK)

class ContactUsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        serializer = ContactUsSerializer
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request):
        # Automatically fill user details
        request.data["first_name"] = request.user.first_name
        request.data["last_name"] = request.user.last_name
        request.data["email"] = request.user.email

        serializer = ContactUsSerializer(data=request.data)
        if serializer.is_valid():
            contact_message = serializer.save()

            # Send email notification
            subject = f"New Contact Message from {contact_message.name}"
            message = f"""
            Name: {contact_message.first_name} {contact_message.last_name}
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
    
class TestView(APIView):
    permission_classes = [AllowAny]
    def post(self, request, pk=None, *args, **kwargs):
        return Response({"pk": pk}, status=status.HTTP_200_OK)
        