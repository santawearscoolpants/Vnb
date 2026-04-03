/**
 * Resend email dispatcher for Supabase Database Webhooks.
 *
 * Configure two webhooks (Dashboard → Database → Webhooks):
 * 1) Table public.steward_applications, event INSERT → POST this function URL
 * 2) Optional: public.payment_attempts, event INSERT → same URL (steward notify; see env below)
 *
 * Set Edge Function secrets (Dashboard → Edge Functions → Secrets):
 *   RESEND_API_KEY       — Resend API key (re_...)
 *   RESEND_FROM          — Verified sender, e.g. "VNB <steward@vnbway.com>"
 *   SUPABASE_URL         — Project URL (often auto-injected)
 *   SUPABASE_SERVICE_ROLE_KEY — Service role (for auth.admin.getUserById)
 *   WEBHOOK_SECRET       — Random string; same value in webhook custom header x-webhook-secret
 *
 * Optional:
 *   RESEND_NOTIFY_STEWARD_ON_PAYMENT_ATTEMPT — set to "true" to email stewards when a payment_attempt
 *     is created with steward_id set (can be noisy; prefer notifying on success from your checkout worker).
 *   RESEND_INTERNAL_BCC — if set, BCC this address on applicant confirmation (e.g. ops inbox).
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const RESEND_API = "https://api.resend.com/emails";

type DbWebhookPayload = {
  type?: "INSERT" | "UPDATE" | "DELETE";
  eventType?: string;
  table: string;
  schema?: string;
  record?: Record<string, unknown> | null;
  new?: Record<string, unknown> | null;
  old_record?: Record<string, unknown> | null;
  old?: Record<string, unknown> | null;
};

async function sendResend(params: {
  to: string;
  subject: string;
  html: string;
  text: string;
  bcc?: string[];
}): Promise<{ ok: boolean; error?: string }> {
  const key = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("RESEND_FROM");
  if (!key || !from) {
    return { ok: false, error: "RESEND_API_KEY or RESEND_FROM not set" };
  }

  const body: Record<string, unknown> = {
    from,
    to: [params.to],
    subject: params.subject,
    html: params.html,
    text: params.text,
  };
  if (params.bcc?.length) {
    body.bcc = params.bcc;
  }

  const res = await fetch(RESEND_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    return { ok: false, error: `${res.status} ${errText}` };
  }
  return { ok: true };
}

function unauthorized(): Response {
  return new Response(JSON.stringify({ error: "unauthorized" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return json({ error: "method not allowed" }, 405);
  }

  const expected = Deno.env.get("WEBHOOK_SECRET");
  if (expected) {
    const headerSecret =
      req.headers.get("x-webhook-secret") ||
      req.headers.get("X-Webhook-Secret") ||
      req.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
    if (headerSecret !== expected) {
      return unauthorized();
    }
  }

  let payload: DbWebhookPayload;
  try {
    payload = (await req.json()) as DbWebhookPayload;
  } catch {
    return json({ error: "invalid json" }, 400);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) {
    return json({ error: "missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" }, 500);
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const event =
    payload.type ||
    (payload.eventType as "INSERT" | "UPDATE" | "DELETE" | undefined);
  const record = payload.record ?? payload.new ?? null;
  const schema = payload.schema ?? "public";

  if (event !== "INSERT" || !record) {
    return json({ skipped: true, reason: "not an insert or missing record" });
  }

  // ─── steward_applications: applicant confirmation ─────────────────────
  if (schema === "public" && payload.table === "steward_applications") {
    const rec = record as {
      user_id?: string;
      application_type?: string;
      ambassador_invite_code?: string;
      status?: string;
    };
    const userId = rec.user_id;
    if (!userId) {
      return json({ error: "record missing user_id" }, 400);
    }

    const { data: userData, error: userErr } = await admin.auth.admin.getUserById(userId);
    if (userErr || !userData?.user?.email) {
      return json(
        { error: "could not resolve user email", detail: userErr?.message },
        500,
      );
    }

    const email = userData.user.email;
    const appType = rec.application_type === "brand_ambassador" ? "Brand ambassador" : "Affiliate";
    const subject = "We received your VNB Steward application";
    const text =
      `Hi,\n\nThank you for applying to the VNB Steward program as ${appType}. ` +
      `Your application is submitted and our team will review it.\n\n` +
      `You will hear from us at this email address.\n\n— Vines & Branches`;

    const html = `
<!DOCTYPE html>
<html><body style="font-family:system-ui,sans-serif;line-height:1.5;color:#18181b;">
  <p>Thank you for applying to the <strong>VNB Steward</strong> program.</p>
  <p>Application type: <strong>${appType}</strong></p>
  <p>Your application is received and our team will review it. We will follow up at this email address.</p>
  <p style="margin-top:2rem;color:#71717a;font-size:13px;">— Vines & Branches</p>
</body></html>`;

    const internalBcc = Deno.env.get("RESEND_INTERNAL_BCC")?.trim();
    const out = await sendResend({
      to: email,
      subject,
      html,
      text,
      bcc: internalBcc ? [internalBcc] : undefined,
    });
    if (!out.ok) {
      return json({ error: "resend failed", detail: out.error }, 502);
    }
    return json({ ok: true, event: "steward_application_confirmation", to: email });
  }

  // ─── payment_attempts: optional steward heads-up ────────────────────────
  if (
    schema === "public" &&
    payload.table === "payment_attempts" &&
    Deno.env.get("RESEND_NOTIFY_STEWARD_ON_PAYMENT_ATTEMPT") === "true"
  ) {
    const rec = record as {
      steward_id?: string | null;
      referral_code?: string | null;
      email?: string | null;
      reference?: string | null;
    };
    const stewardId = rec.steward_id;
    if (!stewardId) {
      return json({ skipped: true, reason: "no steward_id" });
    }

    const { data: stewardUser, error: sErr } = await admin.auth.admin.getUserById(stewardId);
    if (sErr || !stewardUser?.user?.email) {
      return json({ error: "could not resolve steward email", detail: sErr?.message }, 500);
    }

    const code = (rec.referral_code || "").trim() || "—";
    const buyerEmail = (rec.email || "").trim() || "—";
    const ref = (rec.reference || "").trim() || "—";

    const subject = "Your VNB steward code was used at checkout";
    const text =
      `A customer started checkout using your steward attribution.\n\n` +
      `Referral code: ${code}\nBuyer email: ${buyerEmail}\nPayment reference: ${ref}\n\n` +
      `If the order completes successfully, commission will follow your program rules.\n\n— VNB`;

    const html = `
<!DOCTYPE html>
<html><body style="font-family:system-ui,sans-serif;line-height:1.5;color:#18181b;">
  <p>A customer <strong>started checkout</strong> with your steward attribution.</p>
  <ul>
    <li>Referral code: <strong>${code}</strong></li>
    <li>Buyer email: <strong>${buyerEmail}</strong></li>
    <li>Payment reference: <strong>${ref}</strong></li>
  </ul>
  <p>If the order completes successfully, commissions follow your program rules.</p>
  <p style="margin-top:2rem;color:#71717a;font-size:13px;">— Vines & Branches</p>
</body></html>`;

    const out = await sendResend({
      to: stewardUser.user.email,
      subject,
      html,
      text,
    });
    if (!out.ok) {
      return json({ error: "resend failed", detail: out.error }, 502);
    }
    return json({
      ok: true,
      event: "steward_checkout_notify",
      to: stewardUser.user.email,
    });
  }

  return json({ skipped: true, reason: "no handler for table", table: payload.table });
});
