from django.db import models
from django.utils.text import slugify
from django.core.validators import MinValueValidator, MaxValueValidator


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True, blank=True)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='categories/', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Product(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True, blank=True)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    image = models.ImageField(upload_to='products/')
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    stock_quantity = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    sku = models.CharField(max_length=50, unique=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['category', 'is_active']),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        if not self.sku:
            self.sku = f'VNB-{self.id or "NEW"}-{slugify(self.name)[:10]}'
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

    @property
    def in_stock(self):
        return self.stock_quantity > 0


class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='products/gallery/')
    alt_text = models.CharField(max_length=200, blank=True)
    is_primary = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'created_at']

    def __str__(self):
        return f'{self.product.name} - Image {self.order}'


class ProductColor(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='colors')
    name = models.CharField(max_length=50)
    hex_code = models.CharField(max_length=7)
    is_available = models.BooleanField(default=True)

    class Meta:
        unique_together = ['product', 'name']

    def __str__(self):
        return f'{self.product.name} - {self.name}'


class ProductSize(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='sizes')
    size = models.CharField(max_length=20)
    is_available = models.BooleanField(default=True)

    class Meta:
        unique_together = ['product', 'size']
        ordering = ['size']

    def __str__(self):
        return f'{self.product.name} - {self.size}'


class ProductDetail(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='details')
    detail = models.CharField(max_length=200)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f'{self.product.name} - {self.detail}'


class Newsletter(models.Model):
    email = models.EmailField(unique=True)
    subscribed_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.email


class ContactMessage(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    subject = models.CharField(max_length=200)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.name} - {self.subject}'


class InvestmentInquiry(models.Model):
    TIER_CHOICES = [
        ('seed', 'Seed ($50,000)'),
        ('growth', 'Growth ($250,000)'),
        ('strategic', 'Strategic ($1M+)'),
        ('custom', 'Custom Amount'),
    ]

    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    tier = models.CharField(max_length=20, choices=TIER_CHOICES)
    message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_contacted = models.BooleanField(default=False)

    class Meta:
        verbose_name_plural = 'Investment Inquiries'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.name} - {self.tier}'
