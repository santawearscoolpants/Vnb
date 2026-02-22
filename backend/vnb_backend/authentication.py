from rest_framework.authentication import SessionAuthentication


class CsrfExemptSessionAuthentication(SessionAuthentication):
    """
    Session authentication without CSRF enforcement.
    Safe for SPA clients — CORS headers enforce cross-origin policy instead.
    """
    def enforce_csrf(self, request):
        return
