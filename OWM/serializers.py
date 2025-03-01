from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import *

class CustomUserSerializer(serializers.ModelSerializer):
    profile_pic = serializers.ImageField(required=True)
    class Meta:
        model = CustomUser
        fields = ['id', 'first_name', 'last_name', 'username', 'email', 'phone', 'profile_pic', 'password', 'address']
        extra_kwargs = {'password': {'write_only': True}}

    def validate_email(self, value):
        """Ensure email is unique if changed"""
        user = self.instance  # Current user instance
        if CustomUser.objects.exclude(id=user.id).filter(email=value).exists():
            raise serializers.ValidationError("This email is already in use.")
        return value

    def validate_username(self, value):
        """Ensure username is unique if changed"""
        user = self.instance
        if CustomUser.objects.exclude(id=user.id).filter(username=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        return value

    def update(self, instance, validated_data):
        """Handle profile updates, including optional image uploads"""
        profile_pic = validated_data.pop("profile_pic", None)
        password = validated_data.pop("password", None)

        if profile_pic:
            instance.profile_pic = profile_pic  # Update profile picture

        if password:
            instance.password = make_password(password)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance

    def create(self, validated_data):
        profile_pic = validated_data.pop("profile_pic", None)
        user = CustomUser.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            phone=validated_data.get("phone", ""),
            address=validated_data.get("address", ""),
            password=validated_data["password"],  # Will be hashed in `RegisterView`
        )

        if profile_pic:  # Save profile picture if provided
            user.profile_pic = profile_pic
            user.save()

        return user
    
    def to_representation(self, instance):
        """Modify response to return full URL for profile_pic"""
        representation = super().to_representation(instance)
        request = self.context.get("request")  # Get request context for full URL
        if instance.profile_pic:
            representation["profile_pic"] = request.build_absolute_uri(instance.profile_pic.url)
        return representation

class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = '__all__'

class BookingSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')  # Auto-fill user
    service = ServiceSerializer()

    class Meta:
        model = Booking
        fields = '__all__'

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