from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db import transaction
from .models import Cart, CartItem, Order, OrderItem
from store.models import Product
from .serializers import (
    CartSerializer, CartItemSerializer, OrderSerializer, OrderCreateSerializer
)


class CartViewSet(viewsets.ModelViewSet):
    serializer_class = CartSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return Cart.objects.filter(user=self.request.user)
        session_key = self.request.session.session_key
        if not session_key:
            self.request.session.create()
            session_key = self.request.session.session_key
        return Cart.objects.filter(session_key=session_key)

    def get_or_create_cart(self):
        if self.request.user.is_authenticated:
            cart, _ = Cart.objects.get_or_create(user=self.request.user)
        else:
            session_key = self.request.session.session_key
            if not session_key:
                self.request.session.create()
                session_key = self.request.session.session_key
            cart, _ = Cart.objects.get_or_create(session_key=session_key)
        return cart

    @action(detail=False, methods=['get'])
    def current(self, request):
        cart = self.get_or_create_cart()
        serializer = self.get_serializer(cart)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def add_item(self, request):
        cart = self.get_or_create_cart()
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))
        size = request.data.get('size', '')
        color = request.data.get('color', '')

        try:
            product = Product.objects.get(id=product_id, is_active=True)
        except Product.DoesNotExist:
            return Response(
                {'error': 'Product not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if product.stock_quantity < quantity:
            return Response(
                {'error': 'Insufficient stock'},
                status=status.HTTP_400_BAD_REQUEST
            )

        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            size=size,
            color=color,
            defaults={'quantity': quantity}
        )

        if not created:
            cart_item.quantity += quantity
            cart_item.save()

        serializer = CartSerializer(cart)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def update_item(self, request):
        cart = self.get_or_create_cart()
        item_id = request.data.get('item_id')
        quantity = int(request.data.get('quantity', 1))

        try:
            cart_item = CartItem.objects.get(id=item_id, cart=cart)
        except CartItem.DoesNotExist:
            return Response(
                {'error': 'Cart item not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if quantity <= 0:
            cart_item.delete()
        else:
            if cart_item.product.stock_quantity < quantity:
                return Response(
                    {'error': 'Insufficient stock'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            cart_item.quantity = quantity
            cart_item.save()

        serializer = CartSerializer(cart)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def remove_item(self, request):
        cart = self.get_or_create_cart()
        item_id = request.data.get('item_id')

        try:
            cart_item = CartItem.objects.get(id=item_id, cart=cart)
            cart_item.delete()
        except CartItem.DoesNotExist:
            return Response(
                {'error': 'Cart item not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = CartSerializer(cart)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def clear(self, request):
        cart = self.get_or_create_cart()
        cart.items.all().delete()
        serializer = CartSerializer(cart)
        return Response(serializer.data)


class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return Order.objects.filter(user=self.request.user)
        return Order.objects.none()

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        serializer = OrderCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        cart_viewset = CartViewSet()
        cart_viewset.request = request
        cart = cart_viewset.get_or_create_cart()

        if not cart.items.exists():
            return Response(
                {'error': 'Cart is empty'},
                status=status.HTTP_400_BAD_REQUEST
            )

        subtotal = cart.total
        shipping = 0
        tax = subtotal * 0.08
        total = subtotal + shipping + tax

        order = Order.objects.create(
            user=request.user if request.user.is_authenticated else None,
            subtotal=subtotal,
            shipping=shipping,
            tax=tax,
            total=total,
            **serializer.validated_data
        )

        for cart_item in cart.items.all():
            if cart_item.product.stock_quantity < cart_item.quantity:
                transaction.set_rollback(True)
                return Response(
                    {'error': f'Insufficient stock for {cart_item.product.name}'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            OrderItem.objects.create(
                order=order,
                product=cart_item.product,
                quantity=cart_item.quantity,
                size=cart_item.size,
                color=cart_item.color
            )

            cart_item.product.stock_quantity -= cart_item.quantity
            cart_item.product.save()

        cart.items.all().delete()

        order_serializer = OrderSerializer(order)
        return Response(order_serializer.data, status=status.HTTP_201_CREATED)
