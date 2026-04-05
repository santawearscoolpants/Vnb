type Env = {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  PAYSTACK_SECRET_KEY: string;
  PAYSTACK_BASE_URL?: string;
  PAYSTACK_CURRENCY?: string;
  PAYSTACK_CHANNELS?: string;
  PAYSTACK_CALLBACK_URL?: string;
  FRONTEND_ORIGIN: string;
  ALLOWED_ORIGINS?: string;
  MEDIA_BASE_URL?: string;
  SHIPPING_LOCAL_COUNTRIES?: string;
  SHIPPING_LOCAL?: string;
  SHIPPING_INTERNATIONAL?: string;
  FREE_SHIPPING_THRESHOLD?: string;
  TAX_MODE?: string;
  TAX_RATE?: string;
  TAXABLE_COUNTRIES?: string;
  RESEND_API_KEY?: string;
  EMAIL_FROM?: string;
  EMAIL_REPLY_TO?: string;
  MEDIA_BUCKET: R2Bucket;
};

type CheckoutItem = {
  product_id: number;
  quantity: number;
  size?: string;
  color?: string;
};

type ResolvedStewardReferral = {
  steward_id: string;
  code: string;
  display_name: string;
  commission_tier: string;
  commission_rate: string | number;
};

const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8' };
const DEFAULT_TAX_RATE = 0.08;
const ORDER_STATUS_VALUES = new Set(['pending', 'processing', 'shipped', 'delivered', 'cancelled']);
const PAYMENT_STATUS_VALUES = new Set(['pending', 'paid', 'failed']);

function getAllowedOrigin(request: Request, env: Env) {
  const origin = request.headers.get('Origin');
  const allowed = (env.ALLOWED_ORIGINS || env.FRONTEND_ORIGIN || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  if (!origin) return allowed[0] || '*';
  return allowed.includes(origin) ? origin : allowed[0] || '*';
}

function corsHeaders(request: Request, env: Env) {
  return {
    'Access-Control-Allow-Origin': getAllowedOrigin(request, env),
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type, X-Requested-With',
  };
}

function json(data: unknown, request: Request, env: Env, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      ...JSON_HEADERS,
      ...corsHeaders(request, env),
      ...(init.headers || {}),
    },
  });
}

function badRequest(message: string, request: Request, env: Env, status = 400) {
  return json({ error: message }, request, env, { status });
}

function paystackBaseUrl(env: Env) {
  return (env.PAYSTACK_BASE_URL || 'https://api.paystack.co').replace(/\/+$/, '');
}

function paystackCurrency(env: Env) {
  return env.PAYSTACK_CURRENCY || 'GHS';
}

function paystackChannels(env: Env) {
  return (env.PAYSTACK_CHANNELS || 'card,mobile_money,bank_transfer')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
}

function callbackUrl(env: Env) {
  return env.PAYSTACK_CALLBACK_URL || `${env.FRONTEND_ORIGIN}/payment-callback?payment_callback=1`;
}

function toSubunit(amount: number) {
  return Math.round(amount * 100);
}

function nowIso() {
  return new Date().toISOString();
}

function parseNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeCountry(value: string) {
  return String(value || '').trim().toLowerCase();
}

function parseCountrySet(raw: string | undefined, fallback: string[]) {
  const values = (raw || fallback.join(','))
    .split(',')
    .map((item) => normalizeCountry(item))
    .filter(Boolean);
  return new Set(values);
}

function isLocalCountry(country: string, env: Env) {
  const local = parseCountrySet(env.SHIPPING_LOCAL_COUNTRIES, ['Ghana']);
  return local.has(normalizeCountry(country));
}

function isTaxableCountry(country: string, env: Env) {
  const taxable = parseCountrySet(env.TAXABLE_COUNTRIES, ['Ghana']);
  return taxable.has(normalizeCountry(country));
}

function calculateTotals(subtotal: number, country: string, env: Env) {
  const freeShippingThreshold = Math.max(0, parseNumber(env.FREE_SHIPPING_THRESHOLD, 0));
  let shipping = 0;
  if (freeShippingThreshold <= 0 || subtotal < freeShippingThreshold) {
    shipping = isLocalCountry(country, env)
      ? Math.max(0, parseNumber(env.SHIPPING_LOCAL, 0))
      : Math.max(0, parseNumber(env.SHIPPING_INTERNATIONAL, 0));
  }

  const taxMode = (env.TAX_MODE || 'country').toLowerCase();
  const taxRate = Math.max(0, parseNumber(env.TAX_RATE, DEFAULT_TAX_RATE));
  const taxable = taxMode === 'flat' ? true : isTaxableCountry(country, env);
  const tax = taxable ? Number((subtotal * taxRate).toFixed(2)) : 0;
  const total = Number((subtotal + shipping + tax).toFixed(2));

  return {
    subtotal: Number(subtotal.toFixed(2)),
    shipping: Number(shipping.toFixed(2)),
    tax,
    total,
    policy: {
      free_shipping_threshold: Number(freeShippingThreshold.toFixed(2)),
      shipping_mode: isLocalCountry(country, env) ? 'local' : 'international',
      tax_mode: taxMode,
      tax_rate: taxRate,
    },
  };
}

function slugifyFilename(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function normalizeReferralCode(code: string) {
  return code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
}

async function supabaseRequest<T>(env: Env, path: string, init: RequestInit = {}) {
  const response = await fetch(`${env.SUPABASE_URL}${path}`, {
    ...init,
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...(init.headers || {}),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Supabase request failed (${response.status}): ${body}`);
  }

  const text = await response.text();
  return text ? (JSON.parse(text) as T) : (null as T);
}

async function getAuthUser(request: Request, env: Env) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) return null;

  const response = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
    headers: {
      apikey: env.SUPABASE_ANON_KEY || env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) return null;
  return response.json() as Promise<{ id: string; email?: string }>;
}

async function getProductsByIds(env: Env, ids: number[]) {
  if (ids.length === 0) return [];
  const params = new URLSearchParams({
    select: 'id,name,sku,price,stock_quantity,is_active',
    id: `in.(${ids.join(',')})`,
  });
  return supabaseRequest<Array<{
    id: number;
    name: string;
    sku: string | null;
    price: string;
    stock_quantity: number;
    is_active: boolean;
  }>>(env, `/rest/v1/products?${params.toString()}`, { method: 'GET' });
}

async function getPaymentAttemptByReference(env: Env, reference: string) {
  const params = new URLSearchParams({
    select: 'id,reference,total,currency,status,order_id,paystack_status',
    reference: `eq.${reference}`,
    limit: '1',
  });
  const rows = await supabaseRequest<any[]>(env, `/rest/v1/payment_attempts?${params.toString()}`, { method: 'GET' });
  return rows[0] || null;
}

async function getOrderWithItemsById(env: Env, id: number) {
  const params = new URLSearchParams({
    select: 'id,order_number,email,first_name,last_name,total,payment_currency,status,created_at,order_items(product_name,quantity,subtotal)',
    id: `eq.${id}`,
    limit: '1',
  });
  const rows = await supabaseRequest<any[]>(env, `/rest/v1/orders?${params.toString()}`, { method: 'GET' });
  return rows[0] || null;
}

async function getOrderById(env: Env, id: number) {
  const params = new URLSearchParams({
    select: 'id,order_number,email,total,payment_currency',
    id: `eq.${id}`,
    limit: '1',
  });
  const rows = await supabaseRequest<any[]>(env, `/rest/v1/orders?${params.toString()}`, { method: 'GET' });
  return rows[0] || null;
}

async function updatePaymentAttempt(env: Env, reference: string, patch: Record<string, unknown>) {
  const params = new URLSearchParams({ reference: `eq.${reference}` });
  return supabaseRequest(env, `/rest/v1/payment_attempts?${params.toString()}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
}

async function initializePaystackTransaction(env: Env, payload: Record<string, unknown>) {
  const response = await fetch(`${paystackBaseUrl(env)}/transaction/initialize`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json<any>();
  if (!response.ok || !data?.status) {
    throw new Error(data?.message || 'Paystack initialization failed.');
  }
  return data.data as {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

async function verifyPaystackTransaction(env: Env, reference: string) {
  const response = await fetch(`${paystackBaseUrl(env)}/transaction/verify/${encodeURIComponent(reference)}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
      Accept: 'application/json',
    },
  });

  const data = await response.json<any>();
  if (!response.ok || !data?.status) {
    throw new Error(data?.message || 'Paystack verification failed.');
  }
  return data.data as {
    status: string;
    amount: number;
    currency: string;
    paid_at?: string;
    reference: string;
  };
}

async function finalizePaymentAttempt(env: Env, reference: string, paystackStatus: string, verifiedAt: string) {
  return supabaseRequest<any>(env, '/rest/v1/rpc/finalize_payment_attempt', {
    method: 'POST',
    body: JSON.stringify({
      p_reference: reference,
      p_paystack_status: paystackStatus,
      p_verified_at: verifiedAt,
    }),
  });
}

async function isAdmin(env: Env, userId: string) {
  const params = new URLSearchParams({
    select: 'user_id',
    user_id: `eq.${userId}`,
    limit: '1',
  });
  const rows = await supabaseRequest<any[]>(env, `/rest/v1/admin_users?${params.toString()}`, { method: 'GET' });
  return rows.length > 0;
}

async function resolveStewardReferralCode(env: Env, code: string) {
  const normalized = normalizeReferralCode(code);
  if (!normalized) return null;

  const rows = await supabaseRequest<ResolvedStewardReferral[]>(env, '/rest/v1/rpc/resolve_active_steward_referral_code', {
    method: 'POST',
    body: JSON.stringify({ p_code: normalized }),
  });

  return rows[0] || null;
}

async function verifyWebhookSignature(rawBody: string, signature: string, secret: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-512' },
    false,
    ['sign'],
  );
  const digest = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(rawBody));
  const expected = Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
  return expected === signature;
}

async function handleCheckoutInit(request: Request, env: Env) {
  const body = await request.json<any>().catch(() => null);
  if (!body) return badRequest('Invalid JSON body.', request, env);
  const requiredFields = ['email', 'first_name', 'last_name', 'phone', 'address', 'city', 'state', 'zip_code', 'country'];
  for (const field of requiredFields) {
    if (!String(body[field] || '').trim()) {
      return badRequest(`Missing required field: ${field}.`, request, env);
    }
  }

  const items = Array.isArray(body.items) ? (body.items as CheckoutItem[]) : [];
  if (!items.length) return badRequest('Cart is empty.', request, env);

  const uniqueIds = [...new Set(items.map((item) => Number(item.product_id)).filter(Boolean))];
  const products = await getProductsByIds(env, uniqueIds);
  const productMap = new Map(products.map((product) => [product.id, product]));

  let subtotal = 0;
  let snapshot: Array<Record<string, unknown>> = [];
  try {
    snapshot = items.map((item) => {
      const product = productMap.get(Number(item.product_id));
      if (!product || !product.is_active) {
        throw new Error(`Product ${item.product_id} is unavailable.`);
      }
      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        throw new Error(`Invalid quantity for product ${item.product_id}.`);
      }
      if (product.stock_quantity < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}.`);
      }

      const price = Number(product.price);
      const lineSubtotal = price * item.quantity;
      subtotal += lineSubtotal;

      return {
        product_id: product.id,
        product_name: product.name,
        product_sku: product.sku || '',
        quantity: item.quantity,
        size: item.size || '',
        color: item.color || '',
        price: price.toFixed(2),
        subtotal: lineSubtotal.toFixed(2),
      };
    });
  } catch (error: any) {
    return badRequest(error?.message || 'Invalid cart payload.', request, env);
  }

  const totals = calculateTotals(subtotal, String(body.country || ''), env);
  const reference = `VNBPAY-${crypto.randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase()}`;
  const user = await getAuthUser(request, env);
  const resolvedReferral = await resolveStewardReferralCode(env, String(body.referral_code || ''));

  await supabaseRequest(env, '/rest/v1/payment_attempts', {
    method: 'POST',
    body: JSON.stringify({
      user_id: user?.id || null,
      reference,
      email: body.email,
      first_name: body.first_name,
      last_name: body.last_name,
      phone: body.phone,
      address: body.address,
      city: body.city,
      state: body.state,
      zip_code: body.zip_code,
      country: body.country,
      notes: body.notes || '',
      subtotal: totals.subtotal.toFixed(2),
      shipping: totals.shipping.toFixed(2),
      tax: totals.tax.toFixed(2),
      total: totals.total.toFixed(2),
      currency: paystackCurrency(env),
      status: 'initialized',
      steward_id: resolvedReferral?.steward_id || null,
      referral_code: resolvedReferral?.code || '',
      referral_snapshot: resolvedReferral ? {
        steward_id: resolvedReferral.steward_id,
        code: resolvedReferral.code,
        display_name: resolvedReferral.display_name,
        commission_tier: resolvedReferral.commission_tier,
        commission_rate: String(resolvedReferral.commission_rate),
        pricing_policy: totals.policy,
      } : {},
      cart_snapshot: snapshot,
      cart_item_ids: [],
    }),
  });

  try {
    const paystack = await initializePaystackTransaction(env, {
      reference,
      email: body.email,
      amount: toSubunit(totals.total),
      currency: paystackCurrency(env),
      callback_url: callbackUrl(env),
      metadata: {
        source: 'vnbway-worker-checkout',
        cancel_action: `${env.FRONTEND_ORIGIN}?payment_callback=1&status=cancelled`,
        user_id: user?.id || null,
        referral_code: resolvedReferral?.code || '',
        steward_id: resolvedReferral?.steward_id || null,
      },
      channels: paystackChannels(env),
    });

    await updatePaymentAttempt(env, reference, {
      access_code: paystack.access_code,
      authorization_url: paystack.authorization_url,
      status: 'pending',
    });

    return json(paystack, request, env);
  } catch (error: any) {
    await updatePaymentAttempt(env, reference, { status: 'failed' });
    return badRequest(error?.message || 'Unable to initialize payment.', request, env, 502);
  }
}

async function handleCheckoutQuote(request: Request, env: Env) {
  const body = await request.json<any>().catch(() => null);
  if (!body) return badRequest('Invalid JSON body.', request, env);
  const country = String(body.country || '').trim();
  if (!country) return badRequest('Missing country.', request, env);

  const items = Array.isArray(body.items) ? (body.items as CheckoutItem[]) : [];
  if (!items.length) return badRequest('Cart is empty.', request, env);

  const uniqueIds = [...new Set(items.map((item) => Number(item.product_id)).filter(Boolean))];
  const products = await getProductsByIds(env, uniqueIds);
  const productMap = new Map(products.map((product) => [product.id, product]));

  let subtotal = 0;
  for (const item of items) {
    const product = productMap.get(Number(item.product_id));
    if (!product || !product.is_active) return badRequest(`Product ${item.product_id} is unavailable.`, request, env);
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) return badRequest('Invalid cart quantity.', request, env);
    if (product.stock_quantity < item.quantity) return badRequest(`Insufficient stock for ${product.name}.`, request, env);
    subtotal += Number(product.price) * item.quantity;
  }

  return json(calculateTotals(subtotal, country, env), request, env);
}

async function sendEmailViaResend(env: Env, payload: Record<string, unknown>) {
  if (!env.RESEND_API_KEY || !env.EMAIL_FROM) return false;
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  return response.ok;
}

function renderOrderItemsHtml(items: Array<{ product_name: string; quantity: number; subtotal: string | number }>) {
  return items
    .map((item) => `<li>${item.quantity} × ${item.product_name} — ${Number(item.subtotal || 0).toFixed(2)}</li>`)
    .join('');
}

async function sendOrderConfirmationEmail(env: Env, order: any) {
  if (!order?.email) return;
  const currency = order.payment_currency || 'GHS';
  const items = Array.isArray(order.order_items) ? order.order_items : [];
  const payload: Record<string, unknown> = {
    from: env.EMAIL_FROM,
    to: [order.email],
    subject: `VNB Order Confirmation — ${order.order_number || 'Order'}`,
    html: `
      <h2>Thank you for shopping with VNB.</h2>
      <p>Your payment has been verified and your order is now processing.</p>
      <p><strong>Order number:</strong> ${order.order_number || '-'}</p>
      <p><strong>Total:</strong> ${currency} ${Number(order.total || 0).toFixed(2)}</p>
      <p><strong>Status:</strong> ${order.status || 'processing'}</p>
      <h3>Items</h3>
      <ul>${renderOrderItemsHtml(items)}</ul>
      <p>We will send updates as your order progresses.</p>
    `,
    text: `Order ${order.order_number || ''} confirmed. Total ${currency} ${Number(order.total || 0).toFixed(2)}.`,
  };
  if (env.EMAIL_REPLY_TO) payload.reply_to = env.EMAIL_REPLY_TO;
  await sendEmailViaResend(env, payload);
}

async function sendOrderStatusEmail(env: Env, order: any, previousStatus: string) {
  if (!order?.email || previousStatus === order.status) return;
  const currency = order.payment_currency || 'GHS';
  const trackingLine = order.tracking_url
    ? `<p><strong>Tracking:</strong> <a href="${order.tracking_url}">${order.tracking_number || order.tracking_url}</a></p>`
    : order.tracking_number
      ? `<p><strong>Tracking number:</strong> ${order.tracking_number}</p>`
      : '';
  const noteLine = order.status_note ? `<p><strong>Note:</strong> ${order.status_note}</p>` : '';
  const payload: Record<string, unknown> = {
    from: env.EMAIL_FROM,
    to: [order.email],
    subject: `VNB Order Update — ${order.order_number || 'Order'} (${String(order.status || '').toUpperCase()})`,
    html: `
      <h2>Your VNB order status was updated.</h2>
      <p><strong>Order number:</strong> ${order.order_number || '-'}</p>
      <p><strong>Previous status:</strong> ${previousStatus || 'pending'}</p>
      <p><strong>Current status:</strong> ${order.status || '-'}</p>
      <p><strong>Total:</strong> ${currency} ${Number(order.total || 0).toFixed(2)}</p>
      ${trackingLine}
      ${noteLine}
      <p>If you need support, reply to this email and our team will help.</p>
    `,
    text: `Order ${order.order_number || ''} moved from ${previousStatus} to ${order.status}. ${order.tracking_number ? `Tracking: ${order.tracking_number}.` : ''} ${order.status_note ? `Note: ${order.status_note}` : ''}`.trim(),
  };
  if (env.EMAIL_REPLY_TO) payload.reply_to = env.EMAIL_REPLY_TO;
  await sendEmailViaResend(env, payload);
}

async function handleOrderStatusUpdate(request: Request, env: Env) {
  const user = await getAuthUser(request, env);
  if (!user) return badRequest('Authentication required.', request, env, 401);
  if (!(await isAdmin(env, user.id))) return badRequest('Admin access required.', request, env, 403);

  const body = await request.json<any>().catch(() => null);
  if (!body) return badRequest('Invalid JSON body.', request, env);

  const orderId = Number(body.order_id);
  const status = String(body.status || '');
  const paymentStatus = String(body.payment_status || '');
  const trackingCarrier = String(body.tracking_carrier || '').trim();
  const trackingNumber = String(body.tracking_number || '').trim();
  const trackingUrl = String(body.tracking_url || '').trim();
  const statusNote = String(body.status_note || '').trim();
  const estimatedDeliveryDate = String(body.estimated_delivery_date || '').trim();
  if (!Number.isFinite(orderId) || orderId <= 0) return badRequest('Invalid order_id.', request, env);
  if (!ORDER_STATUS_VALUES.has(status)) return badRequest('Invalid order status.', request, env);
  if (paymentStatus && !PAYMENT_STATUS_VALUES.has(paymentStatus)) return badRequest('Invalid payment status.', request, env);
  if (trackingUrl) {
    try {
      const parsed = new URL(trackingUrl);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return badRequest('Invalid tracking_url protocol.', request, env);
      }
    } catch {
      return badRequest('Invalid tracking_url.', request, env);
    }
  }
  if (estimatedDeliveryDate && !/^\d{4}-\d{2}-\d{2}$/.test(estimatedDeliveryDate)) {
    return badRequest('Invalid estimated_delivery_date format. Use YYYY-MM-DD.', request, env);
  }

  const params = new URLSearchParams({
    select: 'id,order_number,email,total,payment_currency,status,tracking_carrier,tracking_number,tracking_url,status_note,shipped_at,delivered_at,estimated_delivery_date',
    id: `eq.${orderId}`,
    limit: '1',
  });
  const existingRows = await supabaseRequest<any[]>(env, `/rest/v1/orders?${params.toString()}`, { method: 'GET' });
  const existingOrder = existingRows[0];
  if (!existingOrder) return badRequest('Order not found.', request, env, 404);
  const previousStatus = existingOrder.status || '';

  const patch: Record<string, unknown> = { status };
  if (paymentStatus) patch.payment_status = paymentStatus;
  patch.tracking_carrier = trackingCarrier;
  patch.tracking_number = trackingNumber;
  patch.tracking_url = trackingUrl;
  patch.status_note = statusNote;
  patch.estimated_delivery_date = estimatedDeliveryDate || null;
  if (status === 'shipped') {
    patch.shipped_at = existingOrder.shipped_at || nowIso();
  }
  if (status === 'delivered') {
    patch.delivered_at = existingOrder.delivered_at || nowIso();
    patch.shipped_at = existingOrder.shipped_at || nowIso();
  }

  await supabaseRequest(env, `/rest/v1/orders?id=eq.${orderId}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });

  const updatedRows = await supabaseRequest<any[]>(env, `/rest/v1/orders?${params.toString()}`, { method: 'GET' });
  const updated = updatedRows[0] || existingOrder;
  await sendOrderStatusEmail(env, updated, previousStatus);
  return json({ ok: true, order: updated }, request, env);
}

async function handlePaymentVerify(request: Request, env: Env) {
  const url = new URL(request.url);
  const reference = url.searchParams.get('reference') || '';
  if (!reference) return badRequest('Missing payment reference.', request, env);

  const attempt = await getPaymentAttemptByReference(env, reference);
  if (!attempt) return badRequest('Payment reference not found.', request, env, 404);

  if (attempt.order_id) {
    const existingOrder = await getOrderById(env, attempt.order_id);
    return json({ status: 'success', order: existingOrder }, request, env);
  }

  try {
    const paystack = await verifyPaystackTransaction(env, reference);

    if (paystack.status !== 'success') {
      await updatePaymentAttempt(env, reference, {
        status: 'failed',
        paystack_status: paystack.status,
        verified_at: paystack.paid_at || nowIso(),
      });
      return badRequest('Payment has not been completed.', request, env);
    }

    const expectedAmount = Number(attempt.total);
    const paidAmount = paystack.amount / 100;
    if (paidAmount !== expectedAmount || paystack.currency !== attempt.currency) {
      await updatePaymentAttempt(env, reference, {
        status: 'failed',
        paystack_status: paystack.status,
        verified_at: paystack.paid_at || nowIso(),
      });
      return badRequest('Payment verification failed due to an amount or currency mismatch.', request, env);
    }

    const order = await finalizePaymentAttempt(env, reference, paystack.status, paystack.paid_at || nowIso());
    const orderWithItems = order?.id ? await getOrderWithItemsById(env, order.id) : order;
    await sendOrderConfirmationEmail(env, orderWithItems || order);
    return json({ status: 'success', order }, request, env);
  } catch (error: any) {
    return badRequest(error?.message || 'Unable to verify payment.', request, env, 502);
  }
}

async function handlePaystackWebhook(request: Request, env: Env) {
  const rawBody = await request.text();
  const signature = request.headers.get('x-paystack-signature') || '';
  const valid = await verifyWebhookSignature(rawBody, signature, env.PAYSTACK_SECRET_KEY);
  if (!valid) return new Response('invalid signature', { status: 401 });

  const body = JSON.parse(rawBody);
  if (body?.event === 'charge.success' && body?.data?.reference) {
    const reference = String(body.data.reference);
    try {
      const paystack = await verifyPaystackTransaction(env, reference);
      const attempt = await getPaymentAttemptByReference(env, reference);
      if (attempt && !attempt.order_id && paystack.status === 'success') {
        const order = await finalizePaymentAttempt(env, reference, paystack.status, paystack.paid_at || nowIso());
        const orderWithItems = order?.id ? await getOrderWithItemsById(env, order.id) : order;
        await sendOrderConfirmationEmail(env, orderWithItems || order);
      }
    } catch {
      // Webhooks should be idempotent; swallow errors and let retries happen.
    }
  }

  return new Response('ok', { status: 200 });
}

async function handleMediaUpload(request: Request, env: Env) {
  const user = await getAuthUser(request, env);
  if (!user) return badRequest('Authentication required.', request, env, 401);
  if (!(await isAdmin(env, user.id))) return badRequest('Admin access required.', request, env, 403);

  const formData = await request.formData();
  const file = formData.get('file');
  const folder = String(formData.get('folder') || 'products').replace(/^\/+|\/+$/g, '');

  if (!(file instanceof File)) {
    return badRequest('A file field is required.', request, env);
  }

  const filename = slugifyFilename(file.name || 'upload.bin');
  const key = `${folder}/${crypto.randomUUID()}-${filename}`;

  await env.MEDIA_BUCKET.put(key, await file.arrayBuffer(), {
    httpMetadata: {
      contentType: file.type || 'application/octet-stream',
    },
  });

  const baseUrl = (env.MEDIA_BASE_URL || '').replace(/\/+$/, '');
  return json({
    key,
    url: baseUrl ? `${baseUrl}/${key}` : key,
  }, request, env);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(request, env) });
    }

    const url = new URL(request.url);

    try {
      if (request.method === 'GET' && url.pathname === '/health') {
        return json({ ok: true }, request, env);
      }
      if (request.method === 'POST' && url.pathname === '/checkout/init') {
        return await handleCheckoutInit(request, env);
      }
      if (request.method === 'POST' && url.pathname === '/checkout/quote') {
        return await handleCheckoutQuote(request, env);
      }
      if (request.method === 'GET' && url.pathname === '/payments/verify') {
        return await handlePaymentVerify(request, env);
      }
      if (request.method === 'POST' && url.pathname === '/orders/status') {
        return await handleOrderStatusUpdate(request, env);
      }
      if (request.method === 'POST' && url.pathname === '/webhooks/paystack') {
        return await handlePaystackWebhook(request, env);
      }
      if (request.method === 'POST' && url.pathname === '/media/upload') {
        return await handleMediaUpload(request, env);
      }
      return badRequest('Not found.', request, env, 404);
    } catch (error: any) {
      return badRequest(error?.message || 'Unexpected server error.', request, env, 500);
    }
  },
};
