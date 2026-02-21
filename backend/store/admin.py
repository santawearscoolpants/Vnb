from django.contrib import admin
from django.utils.html import format_html
from .models import (
    Category, Product, ProductImage, ProductColor,
    ProductSize, ProductDetail, Newsletter, ContactMessage, InvestmentInquiry
)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'is_active', 'product_count', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    list_editable = ['is_active']

    def product_count(self, obj):
        return obj.products.count()
    product_count.short_description = 'Products'


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ['image', 'alt_text', 'is_primary', 'order']


class ProductColorInline(admin.TabularInline):
    model = ProductColor
    extra = 1
    fields = ['name', 'hex_code', 'is_available']


class ProductSizeInline(admin.TabularInline):
    model = ProductSize
    extra = 1
    fields = ['size', 'is_available']


class ProductDetailInline(admin.TabularInline):
    model = ProductDetail
    extra = 1
    fields = ['detail', 'order']


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'price', 'stock_quantity', 'is_active', 'is_featured', 'image_preview']
    list_filter = ['category', 'is_active', 'is_featured', 'created_at']
    search_fields = ['name', 'description', 'sku']
    prepopulated_fields = {'slug': ('name',)}
    list_editable = ['price', 'stock_quantity', 'is_active', 'is_featured']
    readonly_fields = ['image_preview', 'created_at', 'updated_at']
    inlines = [ProductImageInline, ProductColorInline, ProductSizeInline, ProductDetailInline]

    fieldsets = (
        ('Basic Information', {
            'fields': ('category', 'name', 'slug', 'description', 'sku')
        }),
        ('Pricing & Stock', {
            'fields': ('price', 'stock_quantity')
        }),
        ('Media', {
            'fields': ('image', 'image_preview')
        }),
        ('Status', {
            'fields': ('is_active', 'is_featured')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="max-height: 100px; max-width: 100px;" />', obj.image.url)
        return '-'
    image_preview.short_description = 'Image Preview'


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ['product', 'image_preview', 'alt_text', 'is_primary', 'order']
    list_filter = ['is_primary', 'created_at']
    search_fields = ['product__name', 'alt_text']
    list_editable = ['is_primary', 'order']

    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="max-height: 50px;" />', obj.image.url)
        return '-'
    image_preview.short_description = 'Preview'


@admin.register(Newsletter)
class NewsletterAdmin(admin.ModelAdmin):
    list_display = ['email', 'subscribed_at', 'is_active']
    list_filter = ['is_active', 'subscribed_at']
    search_fields = ['email']
    list_editable = ['is_active']
    date_hierarchy = 'subscribed_at'


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'subject', 'created_at', 'is_read']
    list_filter = ['is_read', 'created_at']
    search_fields = ['name', 'email', 'subject', 'message']
    list_editable = ['is_read']
    date_hierarchy = 'created_at'
    readonly_fields = ['created_at']

    fieldsets = (
        ('Contact Information', {
            'fields': ('name', 'email', 'phone')
        }),
        ('Message', {
            'fields': ('subject', 'message')
        }),
        ('Status', {
            'fields': ('is_read', 'created_at')
        }),
    )


@admin.register(InvestmentInquiry)
class InvestmentInquiryAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'tier', 'created_at', 'is_contacted']
    list_filter = ['tier', 'is_contacted', 'created_at']
    search_fields = ['name', 'email', 'message']
    list_editable = ['is_contacted']
    date_hierarchy = 'created_at'
    readonly_fields = ['created_at']

    fieldsets = (
        ('Personal Information', {
            'fields': ('name', 'email', 'phone')
        }),
        ('Investment Details', {
            'fields': ('tier', 'message')
        }),
        ('Status', {
            'fields': ('is_contacted', 'created_at')
        }),
    )
