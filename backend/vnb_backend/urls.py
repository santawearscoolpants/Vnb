from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView, RedirectView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/store/', include('store.urls')),
    path('api/accounts/', include('accounts.urls')),
    path('api/orders/', include('orders.urls')),
]

# In DEBUG, it's convenient to redirect the root URL to the Vite dev server
# so developers can visit the Django address and be forwarded to Vite.
if settings.DEBUG:
    urlpatterns.insert(0, path('', RedirectView.as_view(url='http://localhost:5173/', permanent=False)))
else:
    # In non-debug (or production) serve the built index.html via Django templates
    urlpatterns.insert(0, path('', TemplateView.as_view(template_name='index.html'), name='home'))

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

admin.site.site_header = 'Vines & Branches Administration'
admin.site.site_title = 'VNB Admin'
admin.site.index_title = 'Welcome to Vines & Branches Admin Portal'
