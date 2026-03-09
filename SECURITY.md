# VNB — Security Checklist

> Covers the React + Django + Paystack stack. Review before every production deploy.

---

## Environment & Secrets

- [ ] `.env` files are listed in `.gitignore` (both root and `backend/.env`)
- [ ] `SECRET_KEY` in Django settings is unique per environment and never committed
- [ ] `PAYSTACK_SECRET_KEY` is only stored server-side (`backend/.env`), never exposed to the frontend
- [ ] `VITE_PAYSTACK_PUBLIC_KEY` is the only Paystack key visible to the browser
- [ ] `DEBUG = False` in production Django settings
- [ ] `ALLOWED_HOSTS` is set to exact production domains (no `*`)
- [ ] Database credentials are loaded from environment variables, not hardcoded

## Authentication & Sessions

- [ ] Passwords are hashed with Django's default PBKDF2 (never stored in plain text)
- [ ] Auth tokens are stored in `localStorage` — acceptable for this stack, but consider `httpOnly` cookies if adding sensitive scopes later
- [ ] Token expiry is enforced server-side
- [ ] Password reset tokens are single-use and time-limited
- [ ] Login endpoint is rate-limited (Django REST throttling or middleware)
- [ ] Failed login attempts do not reveal whether the email exists (use a generic message)
- [ ] `/api/accounts/users/me/` requires authentication; returns 401/403 for anonymous requests

## API Security

- [ ] All sensitive endpoints require authentication (`IsAuthenticated` permission)
- [ ] CORS (`django-cors-headers`) is restricted to the exact frontend origin in production — no `CORS_ALLOW_ALL_ORIGINS = True`
- [ ] CSRF protection is active for session-based views (DRF token auth is exempt by design)
- [ ] `X-Content-Type-Options: nosniff` header is set
- [ ] `X-Frame-Options: DENY` or `SAMEORIGIN` is set
- [ ] Responses do not leak stack traces (`DEBUG = False`)
- [ ] Django admin (`/admin/`) is behind a strong password and ideally IP-restricted or behind VPN

## Payments (Paystack)

- [ ] Payment verification always happens server-side (`backend/orders/paystack.py`) — never trust the client
- [ ] The `verify_payment` endpoint checks the transaction amount matches the order total to prevent amount tampering
- [ ] Paystack webhook signature is validated before processing events
- [ ] Webhook endpoint is idempotent (processing the same event twice doesn't duplicate orders)
- [ ] Callback URL (`PAYSTACK_CALLBACK_URL`) points to the production frontend
- [ ] Test keys are never used in production; live keys are never used in development

## Input Validation

- [ ] All user input is validated through DRF serializers before hitting the database
- [ ] Search queries (`api.getProducts({ search })`) are parameterised — no raw SQL
- [ ] File uploads (product images) are validated for type and size via Django/Pillow
- [ ] Email fields are validated with Django's `EmailField` / DRF `EmailField`
- [ ] Contact form and newsletter submissions are sanitised and rate-limited

## Frontend

- [ ] No secrets, API keys (other than public Paystack key), or tokens are hardcoded in source
- [ ] `dangerouslySetInnerHTML` is not used (or if used, input is sanitised)
- [ ] External scripts (GA4) are loaded from trusted origins only
- [ ] `rel="noopener noreferrer"` is set on external links opened with `target="_blank"`
- [ ] Currency/exchange-rate API responses are treated as untrusted — validated before use

## Infrastructure

- [ ] HTTPS is enforced on both frontend (Netlify handles this) and backend
- [ ] Django's `SECURE_SSL_REDIRECT = True` in production
- [ ] `SECURE_HSTS_SECONDS` is set (e.g. 31536000) with `SECURE_HSTS_INCLUDE_SUBDOMAINS = True`
- [ ] Static files served via WhiteNoise with proper cache headers
- [ ] Database backups are scheduled and encrypted
- [ ] Server access uses SSH keys, not passwords

## Dependency Management

- [ ] `npm audit` returns no critical vulnerabilities
- [ ] `pip audit` (or `safety check`) returns no critical vulnerabilities
- [ ] Dependencies are pinned to specific versions (`requirements.txt`, `package-lock.json`)
- [ ] Unused dependencies are removed (note: `next` is in `package.json` but unused — remove it)

## Monitoring & Incident Response

- [ ] Error logging is configured (Sentry, or Django logging to a file/service)
- [ ] Failed payment attempts are logged server-side
- [ ] Admin is notified of unusual activity (spike in failed logins, payment failures)
- [ ] There is a process to rotate secrets if compromised
