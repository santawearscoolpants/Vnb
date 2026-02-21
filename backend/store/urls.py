from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategoryViewSet, ProductViewSet, NewsletterViewSet,
    ContactMessageViewSet, InvestmentInquiryViewSet
)

router = DefaultRouter()
router.register('categories', CategoryViewSet)
router.register('products', ProductViewSet)
router.register('newsletter', NewsletterViewSet)
router.register('contact', ContactMessageViewSet)
router.register('investment', InvestmentInquiryViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
