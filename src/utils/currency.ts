const DEFAULT_CURRENCY = (
  import.meta.env.VITE_CURRENCY ||
  import.meta.env.VITE_PAYSTACK_CURRENCY ||
  'GHS'
).toUpperCase();

export function formatMoney(amount: number | string, currency: string = DEFAULT_CURRENCY): string {
  const value = Number(amount || 0);
  try {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}

export function getCurrencyCode(): string {
  return DEFAULT_CURRENCY;
}
