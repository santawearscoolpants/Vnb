from django.contrib import admin
from .models import Cart, CartItem, Order, OrderItem


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
    list_display = ['order_number', 'user', 'email', 'total', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['order_number', 'email', 'first_name', 'last_name', 'phone']
    readonly_fields = ['order_number', 'created_at', 'updated_at']
    list_editable = ['status']
    inlines = [OrderItemInline]

    fieldsets = (
        ('Order Information', {
            'fields': ('order_number', 'user', 'status')
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
