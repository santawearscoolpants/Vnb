# VNB — Production Deployment Checklist

> Steps to take the site from development to a live production environment.

---

## 1. Environment Variables

### Backend (`backend/.env`)

| Variable | Production Value | Notes |
|---|---|---|
| `SECRET_KEY` | New random key | `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"` |
| `DEBUG` | `False` | Never `True` in production |
| `ALLOWED_HOSTS` | `api.yourdomain.com` | Comma-separated, no wildcards |
| `DATABASE_URL` | PostgreSQL connection string | Or individual `DB_NAME`, `DB_HOST`, etc. |
| `PAYSTACK_SECRET_KEY` | Live secret key | From Paystack dashboard → Settings → API Keys |
| `PAYSTACK_PUBLIC_KEY` | Live public key | Must match the frontend key |
| `PAYSTACK_CALLBACK_URL` | `https://yourdomain.com/payment/callback` | Points to production frontend |
| `PAYSTACK_CURRENCY` | `GHS` | |
| `EMAIL_BACKEND` | `django.core.mail.backends.smtp.EmailBackend` | Not `console` backend |
| `EMAIL_HOST` | SMTP server | e.g. `smtp.gmail.com`, SendGrid, Mailgun |
| `EMAIL_PORT` | `587` | TLS |
| `EMAIL_HOST_USER` | SMTP username | |
| `EMAIL_HOST_PASSWORD` | SMTP password / API key | |
| `DEFAULT_FROM_EMAIL` | `Vines & Branches <hello@yourdomain.com>` | |
| `FRONTEND_URL` | `https://yourdomain.com` | Used in email templates |
| `CORS_ALLOWED_ORIGINS` | `https://yourdomain.com` | Exact origin, not `*` |

### Frontend (`.env` or Netlify env vars)

| Variable | Production Value |
|---|---|
| `VITE_API_URL` | `https://api.yourdomain.com/api` |
| `VITE_PAYSTACK_PUBLIC_KEY` | Live public key |
| `VITE_GA_MEASUREMENT_ID` | `G-XXXXXXXXXX` |

---

## 2. Backend Deployment

### Pre-deploy

- [ ] Run `python manage.py check --deploy` — fix all warnings
- [ ] Run `python manage.py test` (if tests exist)
- [ ] Run `pip audit` or `safety check` on dependencies
- [ ] Set all production env vars listed above

### Django Settings (`vnb_backend/settings.py`)

- [ ] `DEBUG = False`
- [ ] `ALLOWED_HOSTS` is set
- [ ] `SECURE_SSL_REDIRECT = True`
- [ ] `SECURE_HSTS_SECONDS = 31536000`
- [ ] `SECURE_HSTS_INCLUDE_SUBDOMAINS = True`
- [ ] `SECURE_HSTS_PRELOAD = True`
- [ ] `SESSION_COOKIE_SECURE = True`
- [ ] `CSRF_COOKIE_SECURE = True`
- [ ] `SECURE_CONTENT_TYPE_NOSNIFF = True`
- [ ] `X_FRAME_OPTIONS = "DENY"`
- [ ] `CORS_ALLOWED_ORIGINS` lists only the production frontend origin
- [ ] `CORS_ALLOW_ALL_ORIGINS = False`
- [ ] Static files are served via WhiteNoise (`whitenoise.middleware.WhiteNoiseMiddleware`)

### Database

- [ ] PostgreSQL is configured (not SQLite)
- [ ] Run `python manage.py migrate` on production database
- [ ] Create superuser: `python manage.py createsuperuser`
- [ ] Verify admin panel access at `/admin/`
- [ ] Set up automated backups (daily minimum)

### Static & Media Files

- [ ] Run `python manage.py collectstatic --noinput`
- [ ] WhiteNoise is serving static files, or use a CDN/S3
- [ ] Media uploads (product images) are served from S3 / cloud storage in production — local `media/` folder is not suitable for scaled deployments
- [ ] Set appropriate `Cache-Control` headers for static assets

### Process Manager

- [ ] Use Gunicorn as the WSGI server: `gunicorn vnb_backend.wsgi:application --bind 0.0.0.0:8000 --workers 3`
- [ ] Run behind a reverse proxy (Nginx or cloud load balancer)
- [ ] Use a process manager (systemd, Supervisor, or Docker) to keep Gunicorn running
- [ ] Configure logging output (stdout for container deployments, or file-based)

---

## 3. Frontend Deployment

### Build

```bash
npm ci
npm run build
```

- [ ] `dist/` folder is generated with no build errors
- [ ] All `VITE_*` env vars are set before build (Vite inlines them at build time)

### Netlify

- [ ] `netlify.toml` is configured with correct build command and publish directory
- [ ] Environment variables are set in Netlify dashboard (Settings → Environment variables)
- [ ] Custom domain is configured with SSL
- [ ] Redirect rules handle SPA routing (all paths → `/index.html`)

### Verify

- [ ] Site loads on production URL
- [ ] API calls reach the production backend (check network tab)
- [ ] No `localhost` references in production build
- [ ] Images and assets load correctly
- [ ] Console has no errors

---

## 4. DNS & SSL

- [ ] Domain points to Netlify (frontend) via CNAME or Netlify DNS
- [ ] API subdomain points to backend server (e.g. `api.yourdomain.com`)
- [ ] SSL certificates are active on both frontend and backend
- [ ] HTTP → HTTPS redirect is working
- [ ] HSTS header is present in responses

---

## 5. Paystack (Live Mode)

- [ ] Switch to **live** API keys on both frontend and backend
- [ ] Verify callback URL is the production URL
- [ ] Test a real transaction with a small amount
- [ ] Verify webhook endpoint is reachable and processing correctly
- [ ] Enable desired payment channels (card, bank, mobile money, etc.)
- [ ] Confirm currency is set to `GHS`

---

## 6. Email

- [ ] SMTP credentials are configured and tested
- [ ] Send a test order confirmation email
- [ ] Send a test welcome email (register a new account)
- [ ] Verify emails are not landing in spam (check SPF, DKIM, DMARC records)
- [ ] `DEFAULT_FROM_EMAIL` uses a domain you control

---

## 7. Post-Deploy Verification

- [ ] Homepage loads fully (hero, featured products, categories)
- [ ] Product pages display real data from the backend
- [ ] User registration and login work
- [ ] Add to cart and checkout flow completes
- [ ] Payment processes successfully with live Paystack
- [ ] Order confirmation email is received
- [ ] Currency detection and switching work
- [ ] Language switching works (EN/FR)
- [ ] Google Analytics is receiving page views (check GA4 Real-time report)
- [ ] Django admin is accessible and data is correct
- [ ] Investor page loads and PDF download works
- [ ] Contact form submits successfully
- [ ] Newsletter signup works
- [ ] Mobile responsiveness is intact

---

## 8. Monitoring & Maintenance

- [ ] Set up uptime monitoring (UptimeRobot, Pingdom, or similar)
- [ ] Configure error tracking (Sentry recommended for both frontend and backend)
- [ ] Set up log aggregation for the backend
- [ ] Schedule dependency updates (monthly `npm audit fix`, `pip` upgrades)
- [ ] Schedule database backups (test restore procedure)
- [ ] Document the deploy process for the team
