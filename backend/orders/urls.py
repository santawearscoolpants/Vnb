from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CartViewSet, OrderViewSet, PaymentInitializeView, PaymentVerifyView

router = DefaultRouter()
router.register('cart', CartViewSet, basename='cart')
router.register('orders', OrderViewSet, basename='order')

urlpatterns = [
    path('payments/initialize/', PaymentInitializeView.as_view(), name='payment-initialize'),
    path('payments/verify/', PaymentVerifyView.as_view(), name='payment-verify'),
    path('', include(router.urls)),
]
