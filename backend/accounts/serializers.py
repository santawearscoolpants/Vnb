from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = [
            'title', 'phone', 'area_code', 'birth_date', 'company',
            'address', 'address_continued', 'city', 'state', 'zip_code',
            'zip_plus', 'location', 'newsletter_subscribed'
        ]


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(required=False)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'profile']
        read_only_fields = ['id']


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=10)
    profile = UserProfileSerializer(required=False)

    class Meta:
        model = User
        fields = ['email', 'password', 'first_name', 'last_name', 'profile']

    def create(self, validated_data):
        profile_data = validated_data.pop('profile', {})
        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        UserProfile.objects.create(user=user, **profile_data)
        return user
