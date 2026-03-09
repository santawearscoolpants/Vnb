from decimal import Decimal
import uuid
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from django.db import transaction
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from django.conf import settings
from .models import Cart, CartItem, Order, OrderItem, PaymentAttempt
from store.models import Product
from .serializers import (
    CartSerializer, OrderSerializer, OrderCreateSerializer
)
from .paystack import PaystackError, initialize_transaction, verify_transaction
from .emails import send_order_confirmation


def get_or_create_cart_for_request(request):
    if request.user.is_authenticated:
        cart, _ = Cart.objects.get_or_create(user=request.user)
        return cart

    session_key = request.session.session_key
    if not session_key:
        request.session.create()
        session_key = request.session.session_key

    cart, _ = Cart.objects.get_or_create(session_key=session_key)
    return cart


def calculate_cart_totals(cart):
    subtotal = cart.total
    shipping = Decimal('0.00')
    tax = subtotal * Decimal('0.08')
    total = subtotal + shipping + tax
    return subtotal, shipping, tax, total


def snapshot_cart(cart):
    items = []
    item_ids = []
    for cart_item in cart.items.select_related('product').all():
        items.append({
            'product_id': cart_item.product_id,
            'product_name': cart_item.product.name,
            'product_sku': cart_item.product.sku,
            'quantity': cart_item.quantity,
            'size': cart_item.size,
            'color': cart_item.color,
            'price': str(cart_item.product.price),
            'subtotal': str(cart_item.subtotal),
        })
        item_ids.append(cart_item.id)
    return items, item_ids


def create_order_from_payment_attempt(payment_attempt: PaymentAttempt, user=None):
    with transaction.atomic():
        if payment_attempt.order_id:
            return payment_attempt.order

        order = Order.objects.create(
            user=user if user and user.is_authenticated else payment_attempt.user,
            email=payment_attempt.email,
            first_name=payment_attempt.first_name,
            last_name=payment_attempt.last_name,
            phone=payment_attempt.phone,
            address=payment_attempt.address,
            city=payment_attempt.city,
            state=payment_attempt.state,
            zip_code=payment_attempt.zip_code,
            country=payment_attempt.country,
            notes=payment_attempt.notes,
            subtotal=payment_attempt.subtotal,
            shipping=payment_attempt.shipping,
            tax=payment_attempt.tax,
            total=payment_attempt.total,
            status='processing',
            payment_provider='paystack',
            payment_reference=payment_attempt.reference,
            payment_currency=payment_attempt.currency,
            payment_status='paid',
            paid_at=payment_attempt.verified_at or timezone.now(),
        )

        for item in payment_attempt.cart_snapshot:
            try:
                product = Product.objects.select_for_update().get(id=item['product_id'], is_active=True)
            except Product.DoesNotExist:
                raise ValueError(f"Product no longer exists for reference {payment_attempt.reference}.")

            if product.stock_quantity < item['quantity']:
                raise ValueError(f"Insufficient stock for {product.name}.")

            OrderItem.objects.create(
                order=order,
                product=product,
                product_name=item['product_name'],
                product_sku=item['product_sku'],
                quantity=item['quantity'],
                size=item.get('size', ''),
                color=item.get('color', ''),
                price=Decimal(item['price']),
                subtotal=Decimal(item['subtotal']),
            )

            product.stock_quantity -= item['quantity']
            product.save(update_fields=['stock_quantity'])

        payment_attempt.order = order
        payment_attempt.status = 'success'
        payment_attempt.save(update_fields=['order', 'status', 'updated_at'])

        send_order_confirmation(order)

        return order


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
        return get_or_create_cart_for_request(self.request)

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
        tax = subtotal * Decimal('0.08')
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


class PaymentInitializeView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = OrderCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        cart = get_or_create_cart_for_request(request)
        if not cart.items.exists():
            return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)

        subtotal, shipping, tax, total = calculate_cart_totals(cart)
        snapshot, cart_item_ids = snapshot_cart(cart)
        reference = f'VNBPAY-{uuid.uuid4().hex[:12].upper()}'

        payment_attempt = PaymentAttempt.objects.create(
            user=request.user if request.user.is_authenticated else None,
            reference=reference,
            subtotal=subtotal,
            shipping=shipping,
            tax=tax,
            total=total,
            currency=settings.PAYSTACK_CURRENCY,
            cart_snapshot=snapshot,
            cart_item_ids=cart_item_ids,
            **serializer.validated_data,
        )

        try:
            cancel_action = f'{settings.FRONTEND_URL}?payment_callback=1&status=cancelled'
            paystack_data = initialize_transaction(
                reference=reference,
                email=payment_attempt.email,
                amount=payment_attempt.total,
                callback_url=settings.PAYSTACK_CALLBACK_URL,
                metadata={
                    'source': 'vnb-checkout',
                    'payment_attempt_id': str(payment_attempt.id),
                    'cancel_action': cancel_action,
                },
                channels=list(getattr(settings, 'PAYSTACK_CHANNELS', []) or []),
            )
        except PaystackError as exc:
            payment_attempt.status = 'failed'
            payment_attempt.save(update_fields=['status', 'updated_at'])
            return Response({'error': str(exc)}, status=status.HTTP_502_BAD_GATEWAY)

        payment_attempt.access_code = paystack_data.get('access_code', '')
        payment_attempt.authorization_url = paystack_data.get('authorization_url', '')
        payment_attempt.status = 'pending'
        payment_attempt.save(update_fields=['access_code', 'authorization_url', 'status', 'updated_at'])

        return Response({
            'authorization_url': payment_attempt.authorization_url,
            'access_code': payment_attempt.access_code,
            'reference': payment_attempt.reference,
        })


class PaymentVerifyView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        reference = request.query_params.get('reference') or request.query_params.get('trxref')
        if not reference:
            return Response({'error': 'Missing payment reference'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            payment_attempt = PaymentAttempt.objects.get(reference=reference)
        except PaymentAttempt.DoesNotExist:
            return Response({'error': 'Payment reference not found'}, status=status.HTTP_404_NOT_FOUND)

        if payment_attempt.order_id:
            return Response({
                'status': 'success',
                'order': OrderSerializer(payment_attempt.order).data,
            })

        try:
            paystack_data = verify_transaction(reference)
        except PaystackError as exc:
            return Response({'error': str(exc)}, status=status.HTTP_502_BAD_GATEWAY)

        payment_attempt.paystack_status = paystack_data.get('status', '')
        payment_attempt.verified_at = parse_datetime(paystack_data.get('paid_at', '') or '') or timezone.now()
        payment_attempt.save(update_fields=['paystack_status', 'verified_at', 'updated_at'])

        if paystack_data.get('status') != 'success':
            payment_attempt.status = 'failed'
            payment_attempt.save(update_fields=['status', 'updated_at'])
            return Response({'error': 'Payment has not been completed.'}, status=status.HTTP_400_BAD_REQUEST)

        paystack_amount = Decimal(str(paystack_data.get('amount', 0))) / Decimal('100')
        paystack_currency = paystack_data.get('currency', settings.PAYSTACK_CURRENCY)
        if paystack_amount != payment_attempt.total or paystack_currency != payment_attempt.currency:
            payment_attempt.status = 'failed'
            payment_attempt.save(update_fields=['status', 'updated_at'])
            return Response({'error': 'Payment verification failed due to an amount or currency mismatch.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            order = create_order_from_payment_attempt(payment_attempt, request.user if request.user.is_authenticated else None)
        except ValueError as exc:
            return Response({'error': str(exc)}, status=status.HTTP_409_CONFLICT)

        cart = get_or_create_cart_for_request(request)
        cart.items.filter(id__in=payment_attempt.cart_item_ids).delete()

        return Response({
            'status': 'success',
            'order': OrderSerializer(order).data,
        })
