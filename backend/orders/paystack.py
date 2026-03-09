import json
from decimal import Decimal, ROUND_HALF_UP
from urllib import error, request

from django.conf import settings


class PaystackError(Exception):
    pass


def _headers():
    if not settings.PAYSTACK_SECRET_KEY:
        raise PaystackError('Paystack is not configured. Add PAYSTACK_SECRET_KEY to the backend environment.')

    return {
        'Authorization': f'Bearer {settings.PAYSTACK_SECRET_KEY}',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        # Cloudflare can reject requests without a normal client signature.
        # Adding a user-agent avoids false-positive 1010 blocks in test mode.
        'User-Agent': 'VNB-Backend/1.0 (+https://localhost)',
    }


def _amount_to_subunit(amount: Decimal) -> int:
    return int((amount * Decimal('100')).quantize(Decimal('1'), rounding=ROUND_HALF_UP))


def _request_json(method: str, path: str, payload: dict | None = None):
    data = None
    if payload is not None:
        data = json.dumps(payload).encode('utf-8')

    req = request.Request(
        f'{settings.PAYSTACK_BASE_URL.rstrip("/")}{path}',
        data=data,
        headers=_headers(),
        method=method,
    )

    try:
        with request.urlopen(req, timeout=30) as response:
            body = json.loads(response.read().decode('utf-8'))
    except error.HTTPError as exc:
        details = exc.read().decode('utf-8', errors='ignore')
        try:
            parsed = json.loads(details)
            message = parsed.get('message') or parsed.get('error') or details
        except json.JSONDecodeError:
            message = details or exc.reason
        raise PaystackError(f'Paystack HTTP {exc.code}: {message}')
    except error.URLError as exc:
        raise PaystackError(f'Could not reach Paystack: {exc.reason}')

    if not body.get('status'):
        raise PaystackError(body.get('message') or 'Paystack request failed.')

    return body['data']


def initialize_transaction(*, reference: str, email: str, amount: Decimal, callback_url: str, metadata: dict | None = None):
    payload = {
        'reference': reference,
        'email': email,
        'amount': _amount_to_subunit(amount),
        'currency': settings.PAYSTACK_CURRENCY,
        'callback_url': callback_url,
    }
    if metadata:
        payload['metadata'] = metadata
    return _request_json('POST', '/transaction/initialize', payload)


def verify_transaction(reference: str):
    return _request_json('GET', f'/transaction/verify/{reference}')
