from rest_framework import serializers
from .models import (
    Category, Product, ProductImage, ProductColor,
    ProductSize, ProductDetail, Newsletter, ContactMessage, InvestmentInquiry
)


class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.IntegerField(source='products.count', read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'image', 'is_active', 'product_count', 'created_at']


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'alt_text', 'is_primary', 'order']


class ProductColorSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductColor
        fields = ['id', 'name', 'hex_code', 'is_available']


class ProductSizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductSize
        fields = ['id', 'size', 'is_available']


class ProductDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductDetail
        fields = ['id', 'detail', 'order']


class ProductListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'price', 'image', 'is_featured',
            'category_name', 'category_slug', 'in_stock', 'created_at'
        ]


class ProductDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    colors = ProductColorSerializer(many=True, read_only=True)
    sizes = ProductSizeSerializer(many=True, read_only=True)
    details = ProductDetailSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'category', 'name', 'slug', 'description', 'price', 'image',
            'is_active', 'is_featured', 'stock_quantity', 'sku', 'in_stock',
            'images', 'colors', 'sizes', 'details', 'created_at', 'updated_at'
        ]


class NewsletterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Newsletter
        fields = ['email']


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ['name', 'email', 'phone', 'subject', 'message']


class InvestmentInquirySerializer(serializers.ModelSerializer):
    class Meta:
        model = InvestmentInquiry
        fields = ['name', 'email', 'phone', 'tier', 'message']
