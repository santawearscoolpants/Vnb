from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.conf import settings
from .models import UserProfile
from .serializers import UserSerializer, UserRegistrationSerializer, UserProfileSerializer


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.action in ['create', 'login', 'check_email', 'request_password_reset', 'reset_password']:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.action == 'create':
            return UserRegistrationSerializer
        return UserSerializer

    @action(detail=False, methods=['post'])
    def login(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response(
                {'error': 'Please provide both email and password'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(email=email)
            user = authenticate(username=user.username, password=password)

            if user:
                login(request, user)
                serializer = self.get_serializer(user)
                return Response({
                    'message': 'Login successful',
                    'user': serializer.data
                })
            else:
                return Response(
                    {'error': 'Invalid credentials'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['post'])
    def logout(self, request):
        logout(request)
        return Response({'message': 'Logout successful'})

    @action(detail=False, methods=['post'])
    def check_email(self, request):
        email = request.data.get('email')
        if not email:
            return Response(
                {'error': 'Email is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        exists = User.objects.filter(email=email).exists()
        return Response({'exists': exists})

    @action(detail=False, methods=['get'])
    def me(self, request):
        if request.user.is_authenticated:
            serializer = self.get_serializer(request.user)
            return Response(serializer.data)
        return Response(
            {'error': 'Not authenticated'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    @action(detail=False, methods=['post'])
    def request_password_reset(self, request):
        email = request.data.get('email', '').strip().lower()
        if not email:
            return Response({'error': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            # Return success even if email not found — prevents user enumeration
            return Response({'message': 'If that email is registered, a reset link has been sent.'})

        token = default_token_generator.make_token(user)
        reset_url = f"{settings.FRONTEND_URL}?page=reset-password&email={user.email}&token={token}"

        send_mail(
            subject='Reset your Vines & Branches password',
            message=(
                f"Hello {user.first_name or user.email},\n\n"
                f"You requested a password reset for your Vines & Branches account.\n\n"
                f"Click the link below to set a new password:\n{reset_url}\n\n"
                f"This link expires after one use. If you didn't request this, you can ignore this email.\n\n"
                f"— Vines & Branches"
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )

        return Response({'message': 'If that email is registered, a reset link has been sent.'})

    @action(detail=False, methods=['post'])
    def reset_password(self, request):
        email = request.data.get('email', '').strip().lower()
        token = request.data.get('token', '').strip()
        new_password = request.data.get('new_password', '')

        if not email or not token or not new_password:
            return Response({'error': 'Email, token, and new password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return Response({'error': 'Invalid or expired reset link.'}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            return Response({'error': 'Invalid or expired reset link.'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()

        return Response({'message': 'Password reset successfully. You can now sign in.'})
