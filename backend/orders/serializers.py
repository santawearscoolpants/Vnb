from rest_framework import serializers
from .models import Cart, CartItem, Order, OrderItem
from store.serializers import ProductListSerializer


class CartItemSerializer(serializers.ModelSerializer):
    product_detail = ProductListSerializer(source='product', read_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_detail', 'quantity', 'size', 'color', 'subtotal']


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    item_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Cart
        fields = ['id', 'items', 'total', 'item_count', 'created_at', 'updated_at']


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['id', 'product_name', 'product_sku', 'quantity', 'size', 'color', 'price', 'subtotal']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'email', 'first_name', 'last_name', 'phone',
            'address', 'city', 'state', 'zip_code', 'country',
            'subtotal', 'shipping', 'tax', 'total', 'status', 'notes',
            'items', 'created_at', 'updated_at'
        ]
        read_only_fields = ['order_number', 'created_at', 'updated_at']


class OrderCreateSerializer(serializers.Serializer):
    email = serializers.EmailField()
    first_name = serializers.CharField(max_length=100)
    last_name = serializers.CharField(max_length=100)
    phone = serializers.CharField(max_length=20)
    address = serializers.CharField(max_length=255)
    city = serializers.CharField(max_length=100)
    state = serializers.CharField(max_length=100)
    zip_code = serializers.CharField(max_length=20)
    country = serializers.CharField(max_length=100)
    notes = serializers.CharField(required=False, allow_blank=True)
