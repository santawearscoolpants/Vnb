export const CONTACT_EMAILS = {
  customerCare: 'customercare@vnbway.com',
  info: 'info@vnbway.com',
  investment: 'investment@vnbway.com',
} as const;

export const CONTACT_PHONES = {
  primary: '+233 (0)59 484 9077',
  secondary: '+233 (0)24 909 7323',
  primaryHref: 'tel:+233594849077',
  secondaryHref: 'tel:+233249097323',
} as const;

export const CONTACT_ADDRESS = {
  line1: 'East Legon',
  line2: 'Accra, Ghana',
} as const;

export const BUSINESS_HOURS = {
  weekday: { days: 'Monday - Friday', hours: '9:00 AM - 7:00 PM' },
  saturday: { days: 'Saturday', hours: '10:00 AM - 6:00 PM' },
  sunday: { days: 'Sunday', hours: 'Closed' },
} as const;
