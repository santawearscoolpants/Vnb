import { motion, AnimatePresence } from 'motion/react';
import { useState, useMemo, useId, useCallback } from 'react';
import { useRouter } from '../context/RouterContext';
import { toast } from 'sonner';

// 8px spacing system: space-2=8, space-4=16, space-6=24, space-8=32, space-10=40, space-12=48

const PASSWORD_RULES = [
  { key: 'length', label: 'At least 10 characters', test: (v: string) => v.length >= 10 },
  { key: 'upper', label: 'At least 1 uppercase letter', test: (v: string) => /[A-Z]/.test(v) },
  { key: 'lower', label: 'At least 1 lowercase letter', test: (v: string) => /[a-z]/.test(v) },
  { key: 'number', label: 'At least 1 number', test: (v: string) => /\d/.test(v) },
  { key: 'special', label: 'At least 1 special character', test: (v: string) => /[^A-Za-z0-9]/.test(v) },
];

interface FormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  consent: boolean;
}

interface FieldErrors {
  [key: string]: string;
}

// Reusable input styles: visible border, focus ring, transition (WCAG AA contrast)
const inputClassName =
  'w-full rounded-sm border border-zinc-300 bg-white px-3 py-3 text-sm text-black outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-zinc-400 hover:border-zinc-400 focus:border-black focus:ring-2 focus:ring-zinc-300/50 focus:ring-offset-0';
const labelClassName = 'block text-sm font-medium text-zinc-800 mb-1';
const helperClassName = 'text-xs text-zinc-500 leading-relaxed';
const errorClassName = 'text-xs text-red-600 mt-1';
const successClassName = 'text-xs text-green-700 mt-1';

export function CreateAccountPage() {
  const { pageParams, navigateTo } = useRouter();
  const formId = useId();

  const [form, setForm] = useState<FormData>({
    email: pageParams.email || '',
    password: '',
    firstName: '',
    lastName: '',
    consent: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
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

  const isFormValid = useMemo(() => {
    return (
      form.email.includes('@') &&
      passwordValid &&
      form.firstName.trim() !== '' &&
      form.lastName.trim() !== '' &&
      form.consent
    );
  }, [form, passwordValid]);

  const validate = useCallback((): boolean => {
    const e: FieldErrors = {};
    if (!form.email || !form.email.includes('@')) {
      e.email = 'Enter a valid email address.';
    }
    if (!passwordValid) {
      e.password = 'Password must meet all requirements below.';
    }
    if (!form.firstName.trim()) {
      e.firstName = 'Enter your first name.';
    }
    if (!form.lastName.trim()) {
      e.lastName = 'Enter your last name.';
    }
    if (!form.consent) {
      e.consent = 'You must agree to create an account.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [form, passwordValid]);

  const fieldError = (field: string) =>
    touched[field] && errors[field] ? errors[field] : null;
  const fieldValid = (field: string) => {
    if (!touched[field]) return false;
    if (field === 'email') return form.email.includes('@');
    if (field === 'password') return passwordValid;
    if (field === 'firstName') return form.firstName.trim() !== '';
    if (field === 'lastName') return form.lastName.trim() !== '';
    return false;
  };
  const ariaInvalid = (field: string) =>
    touched[field] && errors[field] ? true : undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      email: true,
      password: true,
      firstName: true,
      lastName: true,
      consent: true,
    });
    if (!validate()) return;
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 800));
    toast.success('Account created successfully!');
    navigateTo('account');
    setIsSubmitting(false);
  };

  const emailFromPreviousStep = Boolean(pageParams.email);

  return (
    <div className="min-h-screen bg-[#F8F7F4] pt-20 pb-16">
      <div className="mx-auto w-full max-w-[520px] px-4 py-8 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Page title — strong hierarchy */}
          <h1 className="mb-2 text-base font-medium tracking-[0.12em] text-black uppercase sm:text-lg">
            Create an account
          </h1>

          {/* Legal (terms + privacy) — separate from consent, readable */}
          <p className={`mb-8 ${helperClassName}`} style={{ lineHeight: 1.6 }}>
            By creating an account, you agree to our{' '}
            <a href="#" className="underline hover:text-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 rounded">
              General Terms and Conditions
            </a>{' '}
            and that your data will be processed in line with our{' '}
            <a href="#" className="underline hover:text-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 rounded">
              Privacy Policy
            </a>{' '}
            (Vines &amp; Branches).
          </p>

          <form onSubmit={handleSubmit} noValidate aria-label="Create account">
            {/* Validation summary for screen readers */}
            <div
              aria-live="polite"
              aria-atomic="true"
              className="sr-only"
              role="status"
            >
              {Object.keys(errors).length > 0 && (
                <span>
                  Form has {Object.keys(errors).length} error
                  {Object.keys(errors).length !== 1 ? 's' : ''}. Please correct and try again.
                </span>
              )}
            </div>

            {/* ——— Account Information ——— */}
            <section aria-labelledby={`${formId}-account-heading`} className="mb-8">
              <h2
                id={`${formId}-account-heading`}
                className="mb-4 border-b border-zinc-200 pb-2 text-xs font-medium tracking-[0.1em] text-zinc-800 uppercase"
              >
                Account information
              </h2>

              {/* Email — prefilled & locked when from previous step */}
              <div className="mb-6">
                <label htmlFor={`${formId}-email`} className={labelClassName}>
                  Email <span className="text-zinc-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id={`${formId}-email`}
                    type="email"
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                    onBlur={() => { touch('email'); validate(); }}
                    readOnly={emailFromPreviousStep}
                    aria-invalid={ariaInvalid('email')}
                    aria-describedby={emailFromPreviousStep ? `${formId}-email-verified` : `${formId}-email-hint`}
                    className={`${inputClassName} ${emailFromPreviousStep ? 'cursor-not-allowed border-zinc-200 bg-zinc-50/80' : ''}`}
                  />
                  {emailFromPreviousStep && (
                    <span
                      id={`${formId}-email-verified`}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded bg-zinc-200 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-700"
                    >
                      Verified
                    </span>
                  )}
                </div>
                {!emailFromPreviousStep && (
                  <p id={`${formId}-email-hint`} className={`mt-1 ${helperClassName}`}>
                    Use the email you entered on the previous step.
                  </p>
                )}
                <AnimatePresence mode="wait">
                  {fieldError('email') && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={errorClassName}
                      role="alert"
                    >
                      {fieldError('email')}
                    </motion.p>
                  )}
                  {fieldValid('email') && !fieldError('email') && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={successClassName}
                    >
                      Looks good.
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Password — requirements on focus, live checklist */}
              <div className="mb-6">
                <div className="flex items-center justify-between gap-2">
                  <label htmlFor={`${formId}-password`} className={labelClassName}>
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
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => { setPasswordFocused(false); touch('password'); validate(); }}
                  aria-invalid={ariaInvalid('password')}
                  aria-describedby={passwordFocused || form.password ? `${formId}-pw-rules` : undefined}
                  className={inputClassName}
                />
                <AnimatePresence mode="wait">
                  {fieldError('password') && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={errorClassName}
                      role="alert"
                    >
                      {fieldError('password')}
                    </motion.p>
                  )}
                  {fieldValid('password') && !fieldError('password') && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={successClassName}
                    >
                      Password meets all requirements.
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* Password requirements — reveal on focus, live checklist */}
                <AnimatePresence>
                  {(passwordFocused || form.password) && (
                    <motion.div
                      id={`${formId}-pw-rules`}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <p className={`mt-3 mb-2 ${helperClassName}`}>
                        Your password must include:
                      </p>
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
                                aria-hidden
                                style={{
                                  borderColor: passed ? 'var(--green-700, #15803d)' : 'currentColor',
                                  color: passed ? 'var(--green-700, #15803d)' : 'currentColor',
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
            </section>

            {/* ——— Personal Information ——— */}
            <section aria-labelledby={`${formId}-personal-heading`} className="mb-8">
              <h2
                id={`${formId}-personal-heading`}
                className="mb-4 border-b border-zinc-200 pb-2 text-xs font-medium tracking-[0.1em] text-zinc-800 uppercase"
              >
                Personal information
              </h2>

              <div className="space-y-6">
                <div>
                  <label htmlFor={`${formId}-firstName`} className={labelClassName}>
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
                    className={inputClassName}
                  />
                  <AnimatePresence mode="wait">
                    {fieldError('firstName') && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={errorClassName}
                        role="alert"
                      >
                        {fieldError('firstName')}
                      </motion.p>
                    )}
                    {fieldValid('firstName') && !fieldError('firstName') && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={successClassName}
                      >
                        Looks good.
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <label htmlFor={`${formId}-lastName`} className={labelClassName}>
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
                    className={inputClassName}
                  />
                  <AnimatePresence mode="wait">
                    {fieldError('lastName') && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={errorClassName}
                        role="alert"
                      >
                        {fieldError('lastName')}
                      </motion.p>
                    )}
                    {fieldValid('lastName') && !fieldError('lastName') && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={successClassName}
                      >
                        Looks good.
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </section>

            {/* ——— Consent ——— */}
            <div className="mb-10">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id={`${formId}-consent`}
                  checked={form.consent}
                  onChange={e => set('consent', e.target.checked)}
                  onBlur={() => { touch('consent'); validate(); }}
                  aria-invalid={ariaInvalid('consent')}
                  aria-describedby={`${formId}-consent-desc`}
                  className="mt-1 h-4 w-4 shrink-0 cursor-pointer rounded border-zinc-400 text-black focus:ring-2 focus:ring-black focus:ring-offset-2 focus:ring-offset-[#F8F7F4]"
                />
                <label
                  htmlFor={`${formId}-consent`}
                  id={`${formId}-consent-desc`}
                  className="cursor-pointer text-sm text-zinc-700 leading-relaxed"
                  style={{ lineHeight: 1.5 }}
                >
                  I agree to receive emails about offers, services, products and events from Vines &amp;
                  Branches and group companies, in accordance with the{' '}
                  <a href="#" className="underline hover:text-black focus:outline-none focus:ring-2 focus:ring-black rounded">
                    Privacy Policy
                  </a>
                  .
                </label>
              </div>
              <p className={`mt-2 pl-7 text-xs text-zinc-500`} style={{ lineHeight: 1.5 }}>
                You can unsubscribe at any time via the link in our emails.
              </p>
              <AnimatePresence mode="wait">
                {fieldError('consent') && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`${errorClassName} pl-7`}
                    role="alert"
                  >
                    {fieldError('consent')}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* ——— CTA ——— */}
            <div className="pt-4">
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
