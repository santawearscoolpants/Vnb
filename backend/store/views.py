from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import (
    Category, Product, Newsletter, ContactMessage, InvestmentInquiry
)
from .serializers import (
    CategorySerializer, ProductListSerializer, ProductDetailSerializer,
    NewsletterSerializer, ContactMessageSerializer, InvestmentInquirySerializer
)


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    lookup_field = 'slug'
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Product.objects.filter(is_active=True).select_related('category')
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['category__slug', 'is_featured']
    search_fields = ['name', 'description', 'sku']
    ordering_fields = ['price', 'created_at', 'name']
    lookup_field = 'slug'

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProductDetailSerializer
        return ProductListSerializer

    @action(detail=False, methods=['get'])
    def featured(self, request):
        featured_products = self.queryset.filter(is_featured=True)[:8]
        serializer = self.get_serializer(featured_products, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def category(self, request):
        category_slug = request.query_params.get('slug')
        if not category_slug:
            return Response({'error': 'Category slug is required'}, status=status.HTTP_400_BAD_REQUEST)

        products = self.queryset.filter(category__slug=category_slug)
        page = self.paginate_queryset(products)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)


class NewsletterViewSet(viewsets.ModelViewSet):
    queryset = Newsletter.objects.all()
    serializer_class = NewsletterSerializer
    http_method_names = ['post']

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            newsletter, created = Newsletter.objects.get_or_create(email=email)

            if created:
                return Response(
                    {'message': 'Successfully subscribed to newsletter!'},
                    status=status.HTTP_201_CREATED
                )
            else:
                if newsletter.is_active:
                    return Response(
                        {'message': 'You are already subscribed!'},
                        status=status.HTTP_200_OK
                    )
                else:
                    newsletter.is_active = True
                    newsletter.save()
                    return Response(
                        {'message': 'Successfully resubscribed to newsletter!'},
                        status=status.HTTP_200_OK
                    )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ContactMessageViewSet(viewsets.ModelViewSet):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    http_method_names = ['post']

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {'message': 'Thank you for your message. We will get back to you soon!'},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class InvestmentInquiryViewSet(viewsets.ModelViewSet):
    queryset = InvestmentInquiry.objects.all()
    serializer_class = InvestmentInquirySerializer
    http_method_names = ['post']

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {'message': 'Thank you for your interest! Our investment team will contact you within 48 hours.'},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
