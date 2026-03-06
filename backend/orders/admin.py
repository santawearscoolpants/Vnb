from django.contrib import admin
from .models import Cart, CartItem, Order, OrderItem, PaymentAttempt


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0
    readonly_fields = ['subtotal']
    fields = ['product', 'quantity', 'size', 'color', 'subtotal']


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'item_count', 'total', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username', 'user__email', 'session_key']
    readonly_fields = ['total', 'item_count', 'created_at', 'updated_at']
    inlines = [CartItemInline]


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['product_name', 'product_sku', 'price', 'subtotal']
    fields = ['product', 'product_name', 'quantity', 'size', 'color', 'price', 'subtotal']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['order_number', 'user', 'email', 'total', 'status', 'payment_status', 'created_at']
    list_filter = ['status', 'payment_status', 'created_at']
    search_fields = ['order_number', 'payment_reference', 'email', 'first_name', 'last_name', 'phone']
    readonly_fields = ['order_number', 'payment_reference', 'paid_at', 'created_at', 'updated_at']
    list_editable = ['status']
    inlines = [OrderItemInline]

    fieldsets = (
        ('Order Information', {
            'fields': ('order_number', 'user', 'status', 'payment_status')
        }),
        ('Payment', {
            'fields': ('payment_provider', 'payment_reference', 'payment_currency', 'paid_at')
        }),
        ('Customer Information', {
            'fields': ('email', 'first_name', 'last_name', 'phone')
        }),
        ('Shipping Address', {
            'fields': ('address', 'city', 'state', 'zip_code', 'country')
        }),
        ('Pricing', {
            'fields': ('subtotal', 'shipping', 'tax', 'total')
        }),
        ('Additional Information', {
            'fields': ('notes',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(PaymentAttempt)
class PaymentAttemptAdmin(admin.ModelAdmin):
    list_display = ['reference', 'email', 'total', 'currency', 'status', 'paystack_status', 'created_at']
    list_filter = ['status', 'currency', 'created_at']
    search_fields = ['reference', 'email', 'first_name', 'last_name']
    readonly_fields = ['reference', 'access_code', 'authorization_url', 'cart_snapshot', 'cart_item_ids', 'verified_at', 'created_at', 'updated_at']
