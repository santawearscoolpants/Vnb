import { motion, AnimatePresence } from 'motion/react';
import { useState, useMemo, useId, useCallback, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useRouter } from '../context/RouterContext';
import { toast } from 'sonner';

// 8px spacing: 2=8, 4=16, 6=24, 8=32, 10=40, 12=48

const PASSWORD_RULES = [
  { key: 'length', label: 'At least 10 characters', test: (v: string) => v.length >= 10 },
  { key: 'upper', label: 'At least 1 uppercase letter', test: (v: string) => /[A-Z]/.test(v) },
  { key: 'lower', label: 'At least 1 lowercase letter', test: (v: string) => /[a-z]/.test(v) },
  { key: 'number', label: 'At least 1 number', test: (v: string) => /\d/.test(v) },
  { key: 'special', label: 'At least 1 special character', test: (v: string) => /[^A-Za-z0-9]/.test(v) },
];

const COUNTRIES = [
  { code: 'US', name: 'United States', callingCode: '+1' },
  { code: 'GB', name: 'United Kingdom', callingCode: '+44' },
  { code: 'GH', name: 'Ghana', callingCode: '+233' },
  { code: 'NG', name: 'Nigeria', callingCode: '+234' },
  { code: 'CA', name: 'Canada', callingCode: '+1' },
  { code: 'AU', name: 'Australia', callingCode: '+61' },
  { code: 'DE', name: 'Germany', callingCode: '+49' },
  { code: 'FR', name: 'France', callingCode: '+33' },
  { code: 'IN', name: 'India', callingCode: '+91' },
  { code: 'JP', name: 'Japan', callingCode: '+81' },
  { code: 'CN', name: 'China', callingCode: '+86' },
];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 120 }, (_, i) => CURRENT_YEAR - i);

function getPhonePattern(countryCode: string): RegExp | null {
  switch (countryCode) {
    case 'US':
    case 'CA':
      return /^\d{10}$/;
    case 'GB':
      return /^\d{10,11}$/;
    case 'GH':
      return /^\d{9,10}$/;
    case 'NG':
      return /^\d{10,11}$/;
    case 'AU':
    case 'DE':
    case 'FR':
    case 'IN':
    case 'JP':
    case 'CN':
    default:
      return /^\d{8,15}$/;
  }
}

function getAge(year: number, month: number, day: number): number | null {
  if (!year || !month || !day) return null;
  const birth = new Date(year, month - 1, day);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  title: string;
  firstName: string;
  lastName: string;
  country: string;
  phone: string;
  birthDay: string;
  birthMonth: string;
  birthYear: string;
  consentRequired: boolean;
  consentMarketing: boolean;
}

interface FieldErrors {
  [key: string]: string;
}

const inputBase =
  'w-full rounded-sm border border-zinc-300 bg-white px-3 py-3 text-sm text-black outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-zinc-400 hover:border-zinc-400 focus:border-black focus:ring-2 focus:ring-zinc-300/50 focus:ring-offset-0';
const labelBase = 'block text-sm font-medium text-zinc-800 mb-1';
const helperBase = 'text-xs text-zinc-500 leading-relaxed mt-1';
const errorBase = 'text-xs text-red-600 mt-1';
const successBase = 'text-xs text-green-700 mt-1';

export function CreateAccountPage() {
  const { pageParams, navigateTo } = useRouter();
  const formId = useId();

  const [form, setForm] = useState<FormData>({
    email: pageParams.email || '',
    password: '',
    confirmPassword: '',
    title: '',
    firstName: '',
    lastName: '',
    country: 'US',
    phone: '',
    birthDay: '',
    birthMonth: '',
    birthYear: '',
    consentRequired: false,
    consentMarketing: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmFocused, setConfirmFocused] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const set = useCallback((field: keyof FormData, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const touch = useCallback((field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  const passwordValid = useMemo(
    () => PASSWORD_RULES.every(r => r.test(form.password)),
    [form.password],
  );
  const confirmMatch = useMemo(
    () => form.password !== '' && form.password === form.confirmPassword,
    [form.password, form.confirmPassword],
  );

  const selectedCountry = useMemo(
    () => COUNTRIES.find(c => c.code === form.country) || COUNTRIES[0],
    [form.country],
  );

  const phonePattern = useMemo(
    () => getPhonePattern(form.country),
    [form.country],
  );
  const phoneValid = useMemo(() => {
    const digits = form.phone.replace(/\D/g, '');
    return !form.phone ? false : phonePattern ? phonePattern.test(digits) : digits.length >= 8;
  }, [form.phone, phonePattern]);

  const dobComplete = Boolean(form.birthDay && form.birthMonth && form.birthYear);
  const age = useMemo(() => {
    if (!dobComplete) return null;
    return getAge(
      Number(form.birthYear),
      Number(form.birthMonth),
      Number(form.birthDay),
    );
  }, [dobComplete, form.birthYear, form.birthMonth, form.birthDay]);
  const isUnder18 = age !== null && age < 18;

  const passwordFieldsActive = passwordFocused || confirmFocused || form.password || form.confirmPassword;

  const isFormValid = useMemo(() => {
    if (isUnder18) return false;
    return (
      form.email.includes('@') &&
      passwordValid &&
      confirmMatch &&
      form.title !== '' &&
      form.firstName.trim() !== '' &&
      form.lastName.trim() !== '' &&
      phoneValid &&
      dobComplete &&
      form.consentRequired
    );
  }, [form, passwordValid, confirmMatch, phoneValid, dobComplete, isUnder18]);

  const validate = useCallback((): boolean => {
    const e: FieldErrors = {};
    if (!form.email || !form.email.includes('@')) e.email = 'Enter a valid email address.';
    if (!passwordValid) e.password = 'Password must meet all requirements below.';
    if (!form.confirmPassword.trim()) e.confirmPassword = 'Confirm your password.';
    else if (!confirmMatch) e.confirmPassword = 'Passwords do not match.';
    if (!form.title) e.title = 'Select a title.';
    if (!form.firstName.trim()) e.firstName = 'Enter your first name.';
    if (!form.lastName.trim()) e.lastName = 'Enter your last name.';
    if (!form.country) e.country = 'Select a country.';
    if (!form.phone.trim()) e.phone = 'Enter your phone number.';
    else if (!phoneValid) e.phone = 'Enter a valid phone number for the selected country.';
    if (!dobComplete) e.dob = 'Select your full date of birth.';
    else if (isUnder18) e.dob = 'You must be 18 or older to create an account.';
    if (!form.consentRequired) e.consentRequired = 'You must agree to the terms to continue.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [form, passwordValid, confirmMatch, phoneValid, dobComplete, isUnder18]);

  const fieldError = (field: string) =>
    touched[field] && errors[field] ? errors[field] : null;
  const fieldValid = (field: string) => {
    if (!touched[field]) return false;
    if (field === 'email') return form.email.includes('@');
    if (field === 'password') return passwordValid;
    if (field === 'confirmPassword') return confirmMatch;
    if (field === 'firstName') return form.firstName.trim() !== '';
    if (field === 'lastName') return form.lastName.trim() !== '';
    if (field === 'phone') return phoneValid;
    return false;
  };
  const ariaInvalid = (field: string) =>
    touched[field] && errors[field] ? true : undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      email: true, password: true, confirmPassword: true, title: true,
      firstName: true, lastName: true, country: true, phone: true,
      birthDay: true, birthMonth: true, birthYear: true, consentRequired: true,
    });
    if (!validate() || isUnder18 || !isFormValid) return;
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 800));
    toast.success('Account created successfully!');
    navigateTo('account');
    setIsSubmitting(false);
  };

  // If email already registered, redirect to login and show password field
  useEffect(() => {
    if (pageParams.emailRegistered === 'true' && pageParams.email) {
      navigateTo('account', { email: pageParams.email, showPassword: 'true' });
    }
  }, [pageParams.emailRegistered, pageParams.email, navigateTo]);

  return (
    <div className="min-h-screen bg-[#F8F7F4] pt-20 pb-16">
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="mb-2 text-lg font-medium tracking-[0.12em] text-black uppercase">
            Create an account
          </h1>
          <p className={`mb-8 ${helperBase}`} style={{ lineHeight: 1.6 }}>
            By creating an account, you agree to our{' '}
            <a href="#" className="underline hover:text-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 rounded">
              General Terms and Conditions
            </a>{' '}
            and our{' '}
            <a href="#" className="underline hover:text-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 rounded">
              Privacy Policy
            </a>{' '}
            (Vines &amp; Branches).
          </p>

          <form onSubmit={handleSubmit} noValidate aria-label="Create account">
            <div aria-live="polite" aria-atomic="true" className="sr-only" role="status">
              {Object.keys(errors).length > 0 && (
                <span>Form has errors. Please correct and try again.</span>
              )}
            </div>

            {/* Two-column grid: desktop two cols with clear gutter, mobile single column — focus order: left then right */}
            <div className="grid grid-cols-1 gap-y-8 md:grid-cols-2 md:gap-x-20">
              {/* ——— LEFT: Account Information ——— */}
              <section
                aria-labelledby={`${formId}-account-heading`}
                className="space-y-6 md:border-r md:border-zinc-200 md:pr-10"
              >
                <h2
                  id={`${formId}-account-heading`}
                  className="border-b border-zinc-200 pb-2 text-xs font-medium tracking-[0.1em] text-zinc-800 uppercase"
                >
                  Account information
                </h2>

                <div>
                  <label htmlFor={`${formId}-email`} className={labelBase}>
                    Email <span className="text-zinc-500">*</span>
                  </label>
                  <input
                    id={`${formId}-email`}
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                    onBlur={() => { touch('email'); validate(); }}
                    aria-invalid={ariaInvalid('email')}
                    className={inputBase}
                  />
                  <p id={`${formId}-email-hint`} className={helperBase}>
                    Prefilled from previous step. You can edit if needed.
                  </p>
                  <AnimatePresence mode="wait">
                    {fieldError('email') && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={errorBase} role="alert">
                        {fieldError('email')}
                      </motion.p>
                    )}
                    {fieldValid('email') && !fieldError('email') && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={successBase}>
                        Looks good.
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <div className="flex items-center justify-between gap-2">
                    <label htmlFor={`${formId}-password`} className={labelBase}>
                      Password <span className="text-zinc-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-xs text-zinc-600 underline hover:text-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 rounded"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <input
                    id={`${formId}-password`}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={form.password}
                    onChange={e => set('password', e.target.value)}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => { setPasswordFocused(false); touch('password'); validate(); }}
                    aria-invalid={ariaInvalid('password')}
                    aria-describedby={passwordFieldsActive ? `${formId}-pw-rules` : undefined}
                    className={inputBase}
                  />
                  <AnimatePresence mode="wait">
                    {fieldError('password') && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={errorBase} role="alert">
                        {fieldError('password')}
                      </motion.p>
                    )}
                    {fieldValid('password') && !fieldError('password') && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={successBase}>
                        Password meets all requirements.
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <AnimatePresence>
                    {passwordFieldsActive && (
                      <motion.div
                        id={`${formId}-pw-rules`}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <p className="mt-3 mb-2 text-xs text-zinc-500">Your password must include:</p>
                        <ul className="space-y-1" aria-live="polite">
                          {PASSWORD_RULES.map(rule => {
                            const passed = rule.test(form.password);
                            return (
                              <motion.li
                                key={rule.key}
                                initial={{ opacity: 0, x: -4 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={`flex items-center gap-2 text-xs ${passed ? 'text-green-700' : 'text-zinc-500'}`}
                              >
                                <span
                                  className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[10px]"
                                  style={{
                                    borderColor: passed ? '#15803d' : 'currentColor',
                                    color: passed ? '#15803d' : 'currentColor',
                                    backgroundColor: passed ? 'rgba(21,128,61,0.1)' : 'transparent',
                                  }}
                                >
                                  {passed ? '✓' : '·'}
                                </span>
                                {rule.label}
                              </motion.li>
                            );
                          })}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <div className="flex items-center justify-between gap-2">
                    <label htmlFor={`${formId}-confirmPassword`} className={labelBase}>
                      Confirm password <span className="text-zinc-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-xs text-zinc-600 underline hover:text-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 rounded"
                      aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    >
                      {showConfirmPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <input
                    id={`${formId}-confirmPassword`}
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={form.confirmPassword}
                    onChange={e => set('confirmPassword', e.target.value)}
                    onFocus={() => setConfirmFocused(true)}
                    onBlur={() => { setConfirmFocused(false); touch('confirmPassword'); validate(); }}
                    aria-invalid={ariaInvalid('confirmPassword')}
                    className={inputBase}
                  />
                  <AnimatePresence mode="wait">
                    {fieldError('confirmPassword') && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={errorBase} role="alert">
                        {fieldError('confirmPassword')}
                      </motion.p>
                    )}
                    {fieldValid('confirmPassword') && form.confirmPassword && !fieldError('confirmPassword') && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={successBase}>
                        Passwords match.
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </section>

              {/* ——— RIGHT: Personal Information ——— */}
              <section
                aria-labelledby={`${formId}-personal-heading`}
                className="space-y-6 md:pl-2"
              >
                <h2
                  id={`${formId}-personal-heading`}
                  className="border-b border-zinc-200 pb-2 text-xs font-medium tracking-[0.1em] text-zinc-800 uppercase"
                >
                  Personal information
                </h2>

                <div>
                  <label htmlFor={`${formId}-title`} className={labelBase}>
                    Title <span className="text-zinc-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id={`${formId}-title`}
                      value={form.title}
                      onChange={e => set('title', e.target.value)}
                      onBlur={() => { touch('title'); validate(); }}
                      aria-invalid={ariaInvalid('title')}
                      className={`${inputBase} cursor-pointer appearance-none pr-9`}
                    >
                      <option value="">Select</option>
                      <option value="Mr.">Mr.</option>
                      <option value="Mrs.">Mrs.</option>
                      <option value="Ms.">Ms.</option>
                      <option value="Mx.">Mx.</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  </div>
                  {fieldError('title') && (
                    <p className={errorBase} role="alert">{fieldError('title')}</p>
                  )}
                </div>

                <div>
                  <label htmlFor={`${formId}-firstName`} className={labelBase}>
                    First name <span className="text-zinc-500">*</span>
                  </label>
                  <input
                    id={`${formId}-firstName`}
                    type="text"
                    autoComplete="given-name"
                    value={form.firstName}
                    onChange={e => set('firstName', e.target.value)}
                    onBlur={() => { touch('firstName'); validate(); }}
                    aria-invalid={ariaInvalid('firstName')}
                    className={inputBase}
                  />
                  <AnimatePresence mode="wait">
                    {fieldError('firstName') && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={errorBase} role="alert">
                        {fieldError('firstName')}
                      </motion.p>
                    )}
                    {fieldValid('firstName') && !fieldError('firstName') && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={successBase}>
                        Looks good.
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <label htmlFor={`${formId}-lastName`} className={labelBase}>
                    Last name <span className="text-zinc-500">*</span>
                  </label>
                  <input
                    id={`${formId}-lastName`}
                    type="text"
                    autoComplete="family-name"
                    value={form.lastName}
                    onChange={e => set('lastName', e.target.value)}
                    onBlur={() => { touch('lastName'); validate(); }}
                    aria-invalid={ariaInvalid('lastName')}
                    className={inputBase}
                  />
                  <AnimatePresence mode="wait">
                    {fieldError('lastName') && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={errorBase} role="alert">
                        {fieldError('lastName')}
                      </motion.p>
                    )}
                    {fieldValid('lastName') && !fieldError('lastName') && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={successBase}>
                        Looks good.
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <label htmlFor={`${formId}-country`} className={labelBase}>
                    Country <span className="text-zinc-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id={`${formId}-country`}
                      value={form.country}
                      onChange={e => set('country', e.target.value)}
                      onBlur={() => { touch('country'); validate(); }}
                      aria-invalid={ariaInvalid('country')}
                      className={`${inputBase} cursor-pointer appearance-none pr-9`}
                    >
                      {COUNTRIES.map(c => (
                        <option key={c.code} value={c.code}>{c.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  </div>
                  {fieldError('country') && (
                    <p className={errorBase} role="alert">{fieldError('country')}</p>
                  )}
                </div>

                <div>
                  <label htmlFor={`${formId}-phone`} className={labelBase}>
                    Phone number <span className="text-zinc-500">*</span>
                  </label>
                  <div className="flex gap-0 rounded-sm border border-zinc-300 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-zinc-300/50 focus-within:ring-offset-0 focus-within:border-black">
                    <span
                      className="flex items-center border-r border-zinc-300 bg-zinc-50 px-3 py-3 text-sm text-zinc-700 min-w-[4.5rem]"
                      aria-hidden
                    >
                      {selectedCountry.callingCode}
                    </span>
                    <input
                      id={`${formId}-phone`}
                      type="tel"
                      autoComplete="tel-national"
                      value={form.phone}
                      onChange={e => set('phone', e.target.value.replace(/\D/g, ''))}
                      onBlur={() => { touch('phone'); validate(); }}
                      placeholder="Number only"
                      aria-invalid={ariaInvalid('phone')}
                      className="flex-1 border-0 bg-transparent px-3 py-3 text-sm text-black outline-none placeholder:text-zinc-400"
                    />
                  </div>
                  <p className={helperBase}>
                    Enter number without country code. Format depends on country.
                  </p>
                  <AnimatePresence mode="wait">
                    {fieldError('phone') && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={errorBase} role="alert">
                        {fieldError('phone')}
                      </motion.p>
                    )}
                    {fieldValid('phone') && form.phone && !fieldError('phone') && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={successBase}>
                        Valid.
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <span className={labelBase}>Date of birth <span className="text-zinc-500">*</span></span>
                  <div className="grid grid-cols-[1fr_1fr_0.9fr] gap-2 mt-1">
                    <div className="relative">
                      <select
                        id={`${formId}-birthMonth`}
                        value={form.birthMonth}
                        onChange={e => set('birthMonth', e.target.value)}
                        onBlur={() => { touch('birthMonth'); validate(); }}
                        aria-label="Birth month"
                        className={`${inputBase} cursor-pointer appearance-none pr-8`}
                      >
                        <option value="">Month</option>
                        {MONTHS.map((m, i) => (
                          <option key={m} value={String(i + 1).padStart(2, '0')}>{m}</option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    </div>
                    <div className="relative">
                      <select
                        id={`${formId}-birthDay`}
                        value={form.birthDay}
                        onChange={e => set('birthDay', e.target.value)}
                        onBlur={() => { touch('birthDay'); validate(); }}
                        aria-label="Birth day"
                        className={`${inputBase} cursor-pointer appearance-none pr-8`}
                      >
                        <option value="">Day</option>
                        {DAYS.map(d => (
                          <option key={d} value={String(d).padStart(2, '0')}>{d}</option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    </div>
                    <div className="relative">
                      <select
                        id={`${formId}-birthYear`}
                        value={form.birthYear}
                        onChange={e => set('birthYear', e.target.value)}
                        onBlur={() => { touch('birthYear'); validate(); }}
                        aria-label="Birth year"
                        className={`${inputBase} cursor-pointer appearance-none pr-8`}
                      >
                        <option value="">Year</option>
                        {YEARS.map(y => (
                          <option key={y} value={String(y)}>{y}</option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    </div>
                  </div>
                  {dobComplete && isUnder18 && (
                    <p className="mt-2 text-xs text-red-600" role="alert">
                      You must be 18 or older to create an account.
                    </p>
                  )}
                  {dobComplete && !isUnder18 && (
                    <p className="mt-1 text-xs text-zinc-500">You must be 18 or older to register.</p>
                  )}
                  {fieldError('dob') && !dobComplete && (
                    <p className={errorBase} role="alert">{fieldError('dob')}</p>
                  )}
                </div>
              </section>
            </div>

            {/* ——— Consent (full width below grid) ——— */}
            <div className="mt-10 space-y-6">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id={`${formId}-consentRequired`}
                  checked={form.consentRequired}
                  onChange={e => set('consentRequired', e.target.checked)}
                  onBlur={() => { touch('consentRequired'); validate(); }}
                  aria-invalid={ariaInvalid('consentRequired')}
                  aria-describedby={`${formId}-consent-required-desc`}
                  className="mt-1 h-4 w-4 shrink-0 cursor-pointer rounded border-zinc-400 text-black focus:ring-2 focus:ring-black focus:ring-offset-2 focus:ring-offset-[#F8F7F4]"
                />
                <label
                  htmlFor={`${formId}-consentRequired`}
                  id={`${formId}-consent-required-desc`}
                  className="cursor-pointer text-sm text-zinc-800 leading-relaxed"
                  style={{ lineHeight: 1.5 }}
                >
                  I agree to the{' '}
                  <a href="#" className="underline hover:text-black focus:outline-none focus:ring-2 focus:ring-black rounded">
                    Terms and Conditions
                  </a>{' '}
                  and{' '}
                  <a href="#" className="underline hover:text-black focus:ring-2 focus:ring-black rounded">
                    Privacy Policy
                  </a>{' '}
                  <strong>(required)</strong>.
                </label>
              </div>
              {fieldError('consentRequired') && (
                <p className={errorBase} role="alert">{fieldError('consentRequired')}</p>
              )}

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id={`${formId}-consentMarketing`}
                  checked={form.consentMarketing}
                  onChange={e => set('consentMarketing', e.target.checked)}
                  aria-describedby={`${formId}-consent-marketing-desc`}
                  className="mt-1 h-4 w-4 shrink-0 cursor-pointer rounded border-zinc-400 text-black focus:ring-2 focus:ring-black focus:ring-offset-2 focus:ring-offset-[#F8F7F4]"
                />
                <label
                  htmlFor={`${formId}-consentMarketing`}
                  id={`${formId}-consent-marketing-desc`}
                  className="cursor-pointer text-sm text-zinc-600 leading-relaxed"
                  style={{ lineHeight: 1.5 }}
                >
                  I would like to receive emails about offers, events and news from Vines &amp; Branches <em>(optional)</em>.
                </label>
              </div>
              <p className="text-xs text-zinc-500" style={{ lineHeight: 1.5 }}>
                You can unsubscribe at any time via the link in our emails.
              </p>
            </div>

            {/* ——— CTA ——— */}
            <div className="mt-12">
              <button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className="flex h-12 w-full min-h-[48px] items-center justify-center rounded-sm bg-black px-6 text-sm font-medium tracking-[0.12em] text-white uppercase transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 focus:ring-offset-[#F8F7F4] disabled:cursor-not-allowed disabled:bg-zinc-400 disabled:text-zinc-200"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Creating…
                  </span>
                ) : (
                  'Create account'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
