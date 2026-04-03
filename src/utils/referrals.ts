const STEWARD_REFERRAL_KEY = 'vnb_steward_referral';

type StoredStewardReferral = {
  code: string;
  captured_at: string;
  source_path: string;
};

function normalizeReferralCode(code: string) {
  return code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
}

export function getStoredStewardReferral(): StoredStewardReferral | null {
  try {
    const raw = localStorage.getItem(STEWARD_REFERRAL_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredStewardReferral;
    if (!parsed?.code) return null;
    return { ...parsed, code: normalizeReferralCode(parsed.code) };
  } catch {
    return null;
  }
}

export function getStoredStewardReferralCode() {
  return getStoredStewardReferral()?.code || '';
}

export function clearStewardReferral() {
  try {
    localStorage.removeItem(STEWARD_REFERRAL_KEY);
  } catch {
    // ignore
  }
}

export function storeStewardReferral(code: string, sourcePath = window.location.pathname + window.location.search) {
  const normalized = normalizeReferralCode(code);
  if (!normalized) return;

  try {
    localStorage.setItem(STEWARD_REFERRAL_KEY, JSON.stringify({
      code: normalized,
      captured_at: new Date().toISOString(),
      source_path: sourcePath,
    }));
  } catch {
    // Ignore storage failures.
  }
}

export function captureStewardReferralFromUrl(search = window.location.search) {
  const params = new URLSearchParams(search);
  const code =
    params.get('steward') ||
    params.get('steward_code') ||
    params.get('ref') ||
    params.get('referral') ||
    '';

  if (code) {
    storeStewardReferral(code);
  }
}
