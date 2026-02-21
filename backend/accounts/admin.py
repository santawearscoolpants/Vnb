from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from .models import UserProfile


class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'Profile'
    fk_name = 'user'


class UserAdmin(BaseUserAdmin):
    inlines = (UserProfileInline,)
    list_display = ['username', 'email', 'first_name', 'last_name', 'is_staff', 'date_joined']
    list_filter = ['is_staff', 'is_superuser', 'is_active', 'date_joined']


admin.site.unregister(User)
admin.site.register(User, UserAdmin)


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'phone', 'city', 'state', 'newsletter_subscribed', 'created_at']
    list_filter = ['newsletter_subscribed', 'location', 'created_at']
    search_fields = ['user__username', 'user__email', 'phone', 'city']
    readonly_fields = ['created_at', 'updated_at']

    fieldsets = (
        ('User', {
            'fields': ('user',)
        }),
        ('Personal Information', {
            'fields': ('title', 'phone', 'area_code', 'birth_date')
        }),
        ('Address', {
            'fields': ('company', 'address', 'address_continued', 'city', 'state', 'zip_code', 'zip_plus', 'location')
        }),
        ('Preferences', {
            'fields': ('newsletter_subscribed',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
