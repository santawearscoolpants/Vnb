#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const requiredBase = [
  'SMOKE_FRONTEND_URL',
  'SMOKE_API_URL',
  'SMOKE_SUPABASE_URL',
  'SMOKE_SUPABASE_ANON_KEY',
];

const optionalFlows = [
  'SMOKE_CHECKOUT_PRODUCT_ID',
  'SMOKE_USER_EMAIL',
  'SMOKE_USER_PASSWORD',
  'SMOKE_ADMIN_EMAIL',
  'SMOKE_ADMIN_PASSWORD',
];

const config = {
  frontendUrl: String(process.env.SMOKE_FRONTEND_URL || '').replace(/\/+$/, ''),
  apiUrl: String(process.env.SMOKE_API_URL || '').replace(/\/+$/, ''),
  supabaseUrl: String(process.env.SMOKE_SUPABASE_URL || '').replace(/\/+$/, ''),
  supabaseAnonKey: String(process.env.SMOKE_SUPABASE_ANON_KEY || ''),
  checkoutProductId: Number(process.env.SMOKE_CHECKOUT_PRODUCT_ID || 0),
  smokeUserEmail: String(process.env.SMOKE_USER_EMAIL || '').trim(),
  smokeUserPassword: String(process.env.SMOKE_USER_PASSWORD || '').trim(),
  adminEmail: String(process.env.SMOKE_ADMIN_EMAIL || ''),
  adminPassword: String(process.env.SMOKE_ADMIN_PASSWORD || ''),
};

for (const key of requiredBase) {
  if (!String(process.env[key] || '').trim()) {
    console.error(`[smoke] Missing required env: ${key}`);
    process.exit(1);
  }
}

const missingOptional = optionalFlows.filter((k) => !String(process.env[k] || '').trim());
if (missingOptional.length > 0) {
  console.log(`[smoke] Optional env missing (${missingOptional.join(', ')}). Some checks will be skipped.`);
}

const results = [];
let failed = 0;

function pushResult(name, status, detail) {
  results.push({ name, status, detail });
  if (status === 'failed') failed += 1;
}

async function runCheck(name, fn) {
  try {
    const detail = await fn();
    pushResult(name, 'passed', detail || 'ok');
  } catch (error) {
    pushResult(name, 'failed', error?.message || 'failed');
  }
}

function randomEmail(prefix) {
  const seed = `${Date.now()}${Math.floor(Math.random() * 10000)}`;
  return `${prefix}+${seed}@example.com`;
}

function requireStatus(response, accepted, message) {
  if (accepted.includes(response.status)) return;
  throw new Error(`${message}: expected ${accepted.join('/')}, got ${response.status}`);
}

async function main() {
  const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let userEmail = '';
  let userPassword = '';
  let userAccessToken = '';

  await runCheck('storefront reachable', async () => {
    const response = await fetch(config.frontendUrl, { method: 'GET' });
    requireStatus(response, [200], 'Storefront health check failed');
    return config.frontendUrl;
  });

  await runCheck('api health', async () => {
    const response = await fetch(`${config.apiUrl}/health`, { method: 'GET' });
    requireStatus(response, [200], 'API health check failed');
    const body = await response.json().catch(() => ({}));
    if (!body?.ok) throw new Error('API /health returned unexpected payload');
    return `${config.apiUrl}/health`;
  });

  const quoteProductId = config.checkoutProductId > 0 ? config.checkoutProductId : 4;
  await runCheck('checkout quote (no auth)', async () => {
    const response = await fetch(`${config.apiUrl}/checkout/quote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: config.frontendUrl,
      },
      body: JSON.stringify({
        country: 'Ghana',
        items: [{ product_id: quoteProductId, quantity: 1 }],
      }),
    });
    requireStatus(response, [200], 'Checkout quote failed');
    const data = await response.json().catch(() => null);
    if (!data || typeof data.total !== 'number') {
      throw new Error('Checkout quote returned unexpected payload');
    }
    return `product_id=${quoteProductId} total=${data.total}`;
  });

  const useFixedUser = config.smokeUserEmail && config.smokeUserPassword;
  if (useFixedUser) {
    userEmail = config.smokeUserEmail;
    userPassword = config.smokeUserPassword;
    pushResult(
      'auth sign-up',
      'skipped',
      'SMOKE_USER_EMAIL and SMOKE_USER_PASSWORD set — using existing confirmed account',
    );
    await runCheck('auth sign-in', async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: userPassword,
      });
      if (error) throw new Error(error.message);
      userAccessToken = data.session?.access_token || '';
      if (!userAccessToken) throw new Error('No access token returned from sign-in');
      return 'session issued';
    });
  } else {
    userEmail = randomEmail('smoke-user');
    userPassword = `Vnb${Date.now()}!Aa1`;
    await runCheck('auth sign-up', async () => {
      const { data, error } = await supabase.auth.signUp({
        email: userEmail,
        password: userPassword,
        options: {
          data: { first_name: 'Smoke', last_name: 'User' },
        },
      });
      if (error) throw new Error(error.message);
      if (data.session?.access_token) {
        userAccessToken = data.session.access_token;
      }
      return userEmail;
    });

    if (userAccessToken) {
      pushResult('auth sign-in', 'passed', 'session returned on sign-up (no email confirmation delay)');
    } else {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: userEmail,
          password: userPassword,
        });
        if (error) throw new Error(error.message);
        userAccessToken = data.session?.access_token || '';
        if (!userAccessToken) throw new Error('No access token returned from sign-in');
        pushResult('auth sign-in', 'passed', 'session issued');
      } catch (e) {
        const msg = e?.message || 'failed';
        if (/confirm|verified|not confirmed/i.test(msg)) {
          pushResult(
            'auth sign-in',
            'skipped',
            'Supabase requires email confirmation for new users. Set SMOKE_USER_EMAIL + SMOKE_USER_PASSWORD to a confirmed account, or disable email confirmations on a staging project.',
          );
        } else {
          pushResult('auth sign-in', 'failed', msg);
        }
      }
    }
  }

  if (config.checkoutProductId > 0 && userAccessToken) {
    let checkoutReference = '';
    await runCheck('checkout init', async () => {
      const response = await fetch(`${config.apiUrl}/checkout/init`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${userAccessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          first_name: 'Smoke',
          last_name: 'User',
          phone: '+233200000000',
          address: 'Accra Test Address',
          city: 'Accra',
          state: 'Greater Accra',
          zip_code: '00233',
          country: 'Ghana',
          items: [
            {
              product_id: config.checkoutProductId,
              quantity: 1,
            },
          ],
        }),
      });
      requireStatus(response, [200], 'Checkout init failed');
      const data = await response.json().catch(() => null);
      if (!data?.reference || !data?.authorization_url) {
        throw new Error('Checkout init returned incomplete payload');
      }
      checkoutReference = String(data.reference);
      return checkoutReference;
    });

    await runCheck('payment callback invalid reference handling', async () => {
      const invalidRef = `SMOKE-INVALID-${Date.now()}`;
      const response = await fetch(
        `${config.apiUrl}/payments/verify?reference=${encodeURIComponent(invalidRef)}`,
        {
          method: 'GET',
          headers: { Authorization: `Bearer ${userAccessToken}` },
        },
      );
      requireStatus(response, [400, 404], 'Invalid payment reference should not verify');
      return `handled with status ${response.status}`;
    });

    await runCheck('payment callback cancelled-status handling', async () => {
      const response = await fetch(
        `${config.frontendUrl}/payment-callback?payment_callback=1&status=cancelled`,
        { method: 'GET' },
      );
      requireStatus(response, [200], 'Payment callback page not reachable');
      return 'cancelled callback URL reachable';
    });

    if (checkoutReference) {
      pushResult(
        'payment success path (manual)',
        'skipped',
        `Complete one Paystack test payment using reference ${checkoutReference}, then re-run verify flow manually.`,
      );
    }
  } else if (config.checkoutProductId > 0 && !userAccessToken) {
    pushResult(
      'checkout/payment flow',
      'skipped',
      'SMOKE_CHECKOUT_PRODUCT_ID is set but there is no auth session (email confirmation or auth failure).',
    );
  } else {
    pushResult(
      'checkout/payment flow',
      'skipped',
      'Set SMOKE_CHECKOUT_PRODUCT_ID and valid catalog stock to run checkout + callback checks.',
    );
  }

  if (config.adminEmail && config.adminPassword) {
    const adminClient = createClient(config.supabaseUrl, config.supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    let adminToken = '';

    await runCheck('admin auth sign-in', async () => {
      const { data, error } = await adminClient.auth.signInWithPassword({
        email: config.adminEmail,
        password: config.adminPassword,
      });
      if (error) throw new Error(error.message);
      adminToken = data.session?.access_token || '';
      if (!adminToken) throw new Error('No admin token returned');
      return config.adminEmail;
    });

    if (adminToken) {
      await runCheck('admin worker auth guard', async () => {
        const response = await fetch(`${config.apiUrl}/orders/status`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            order_id: 0,
            status: 'processing',
            payment_status: 'paid',
          }),
        });
        requireStatus(response, [400], 'Admin auth guard / payload validation check failed');
        return 'authorized request reached validation layer';
      });
    }
  } else {
    pushResult('admin flow', 'skipped', 'Set SMOKE_ADMIN_EMAIL and SMOKE_ADMIN_PASSWORD to run admin checks.');
  }

  console.table(results);
  if (failed > 0) {
    console.error(`[smoke] ${failed} check(s) failed.`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(`[smoke] Fatal error: ${error?.message || error}`);
  process.exit(1);
});
