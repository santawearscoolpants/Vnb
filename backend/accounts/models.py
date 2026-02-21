from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
    TITLE_CHOICES = [
        ('Mr.', 'Mr.'),
        ('Mrs.', 'Mrs.'),
        ('Ms.', 'Ms.'),
        ('Dr.', 'Dr.'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    title = models.CharField(max_length=10, choices=TITLE_CHOICES, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    area_code = models.CharField(max_length=10, default='+1')
    birth_date = models.DateField(null=True, blank=True)
    company = models.CharField(max_length=200, blank=True)
    address = models.CharField(max_length=255, blank=True)
    address_continued = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    zip_code = models.CharField(max_length=20, blank=True)
    zip_plus = models.CharField(max_length=10, blank=True)
    location = models.CharField(max_length=100, default='United States')
    newsletter_subscribed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'{self.user.get_full_name()} Profile'

    class Meta:
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'
