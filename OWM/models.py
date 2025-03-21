from django.contrib.auth.models import AbstractUser
from django.db import models

# Custom User Model
class CustomUser(AbstractUser):
    first_name = models.CharField(max_length=20, null=False, blank=False)
    last_name = models.CharField(max_length=20, null=False, blank=False)
    username = models.CharField(max_length=20, unique=True, null=False, blank=False)
    phone = models.CharField(max_length=15, blank=True, null=True)
    profile_pic = models.ImageField(upload_to="Profile_Pics")
    address = models.CharField(max_length=30, blank=False, null=False)

    class Meta:
        verbose_name = "CustomerUser"
        verbose_name_plural = "CustomUser"

    def __str__(self):
        return self.username

# Service Model
class Service(models.Model):
    CATEGORY_CHOICES = [
        ('video', 'Video Recording'),
        ('audio', 'Audio Recording'),
        ('photo', 'Photo Shooting'),
    ]
    
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=10, choices=CATEGORY_CHOICES)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to='services/', blank=True, null=True)

    class Meta:
        verbose_name = "Service"
        verbose_name_plural = "Services"

    def __str__(self):
        return self.name

# Booking Model
class Booking(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('canceled', 'Canceled'),
    ]
    
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    service = models.ForeignKey(Service, on_delete=models.CASCADE)
    event_date = models.DateField()
    event_time = models.TimeField()
    event_location = models.CharField(max_length=100)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    booked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Booking"
        verbose_name_plural = "Bookings"

    def __str__(self):
        return f"{self.user.username} - {self.service.name} ({self.event_date} {self.event_time})"

#Cart Model
class Cart(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    service = models.ForeignKey(Service, on_delete=models.CASCADE)
    event_date = models.DateField(null=False)
    event_location = models.CharField(max_length=255, null=False)
    event_time = models.TimeField(null=False)
    added_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.service.name} - {self.event_date}"

# Contact Model
class ContactUs(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    subject = models.CharField(max_length=255)
    message = models.TextField()
    sent_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "ContactUs"
        verbose_name_plural = "ContactUs"

    def __str__(self):
        return f"Message from {self.name} - {self.subject}"
    
# Team Member Model for Team UI
class TeamMember(models.Model):
    ROLE_CHOICES = [
        ('ceo', 'CEO'),
        ('producer', 'Producer'),
        ('director', 'Director'),
        ('editor', 'Editor'),
        ('photographer', 'Photographer'),
        ('videographer', 'Videographer')
    ]
    
    name = models.CharField(max_length=100)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    profile_pic = models.ImageField(upload_to='team/')
    bio = models.TextField()

    class Meta:
        verbose_name = "TeamMember"
        verbose_name_plural = "TeamMembers"

    def __str__(self):
        return f"{self.name} - {self.get_role_display()}"

# Review Model
class Review(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    service = models.ForeignKey(Service, on_delete=models.CASCADE)
    rating = models.PositiveIntegerField()
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Review"
        verbose_name_plural = "Reviews"

    def __str__(self):
        return f"{self.user.username} - {self.service.name} ({self.rating}★)"
