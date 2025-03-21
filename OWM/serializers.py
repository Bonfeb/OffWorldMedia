from rest_framework import serializers
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth.hashers import make_password
from .models import *

class CustomUserSerializer(serializers.ModelSerializer):
    profile_pic = serializers.ImageField(required=False)  # Make profile_pic optional
    parser_classes = (MultiPartParser, FormParser)

    class Meta:
        model = CustomUser
        fields = ['id', 'first_name', 'last_name', 'username', 'email', 'phone', 'profile_pic', 'password', 'address']
        extra_kwargs = {'password': {'write_only': True, 'required': False}}  # Make password optional

    def get(self, instance):
        """Retrieve the authenticated user's profile"""
        return {
            "id": instance.id,
            "username": instance.username,
            "email": instance.email,
            "first_name": instance.first_name,
            "last_name": instance.last_name,
            "profile_pic": instance.profile_pic.url if instance.profile_pic else None,
            "phone": instance.phone,
            "address": instance.address,
        }

    def validate_email(self, value):
        """Ensure email is unique if changed"""
        user = self.instance
        if user and CustomUser.objects.exclude(id=user.id).filter(email=value).exists():
            raise serializers.ValidationError("This email is already in use.")
        return value

    def validate_username(self, value):
        """Ensure username is unique if changed"""
        user = self.instance
        if user and CustomUser.objects.exclude(id=user.id).filter(username=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        return value

    def update(self, instance, validated_data):
        """Handle profile updates, including optional image uploads"""
        profile_pic = validated_data.pop("profile_pic", None)
        password = validated_data.pop("password", None)

        if profile_pic:
            instance.profile_pic = profile_pic  # Update profile picture

        if password:
            instance.set_password(password)  # Use `set_password()` instead of `make_password()`

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance

    def to_representation(self, instance):
        """Modify response to return full URL for profile_pic"""
       
        representation = super().to_representation(instance)
        request = self.context.get("request")  # Get request context for full URL
        if hasattr(instance, "profile_pic") and instance.profile_pic:
            profile_pic_url = instance.profile_pic.url
            if request:
                profile_pic_url = request.build_absolute_uri(profile_pic_url)
            representation["profile_pic"] = profile_pic_url
        return representation

class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = '__all__'

class BookingSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')  # Auto-fill user
    service = ServiceSerializer()
    service_image_url = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = ['id', 'user', 'service', 'status', 'event_date', 'event_time', 'event_location', 'service_image_url']
        
    def get_service_image_url(self, obj):
        request = self.context.get('request')
        if obj.service and obj.service.image:
            if request is not None:
                return request.build_absolute_uri(obj.service.image.url)  # ✅ Only use build_absolute_uri if request exists
            return obj.service.image.url  # ✅ Return relative URL if no request
        return None  # ✅ Return None if no image

class CartSerializer(serializers.ModelSerializer):
    service_name = serializers.CharField(source="service.name", read_only=True)
    service_price = serializers.DecimalField(source="service.price", max_digits=10, decimal_places=2, read_only=True)
    service_image = serializers.ImageField(source="service.image", read_only=True)
    added_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S")
    event_date = serializers.DateField()
    event_location = serializers.CharField()
    event_time = serializers.TimeField()
    
    class Meta:
        model = Cart
        fields = ["id", "service", "service_name", "service_price", "service_image", "added_at", "event_date", "event_location", "event_time"]

class ContactUsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactUs
        fields = ['id', 'name', 'email', 'subject', 'message', 'sent_at']
        read_only_fields = ['sent_at'] 

class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')  # Auto-fill user

    class Meta:
        model = Review
        fields = '__all__'

class TeamMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamMember
        fields = '__all__'