import { motion } from 'motion/react';
import { useState, useMemo, useId } from 'react';
import { ChevronDown } from 'lucide-react';
import { useRouter } from '../context/RouterContext';
import { toast } from 'sonner';

const COUNTRY_CODES = [
  { code: '+1', label: 'US +1', flag: '🇺🇸' },
  { code: '+44', label: 'UK +44', flag: '🇬🇧' },
  { code: '+233', label: 'GH +233', flag: '🇬🇭' },
  { code: '+234', label: 'NG +234', flag: '🇳🇬' },
  { code: '+91', label: 'IN +91', flag: '🇮🇳' },
  { code: '+33', label: 'FR +33', flag: '🇫🇷' },
  { code: '+49', label: 'DE +49', flag: '🇩🇪' },
  { code: '+81', label: 'JP +81', flag: '🇯🇵' },
  { code: '+86', label: 'CN +86', flag: '🇨🇳' },
  { code: '+61', label: 'AU +61', flag: '🇦🇺' },
];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

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
  title: string;
  firstName: string;
  lastName: string;
  areaCode: string;
  phone: string;
  birthMonth: string;
  birthDay: string;
  birthYear: string;
  consent: boolean;
}

interface FieldErrors {
  [key: string]: string;
}

const inputBase =
  'w-full border-0 border-b border-zinc-300 bg-transparent px-0 py-2 text-xs text-black outline-none transition-colors placeholder:text-zinc-400 focus:border-black';
const labelBase = 'block text-[10px] text-zinc-500 mb-0';
const errorText = 'mt-0.5 text-[10px] text-red-600';

export function CreateAccountPage() {
  const { pageParams, navigateTo } = useRouter();
  const formId = useId();

  const [form, setForm] = useState<FormData>({
    email: pageParams.email || '',
    password: '',
    title: '',
    firstName: '',
    lastName: '',
    areaCode: '+1',
    phone: '',
    birthMonth: '',
    birthDay: '',
    birthYear: '',
    consent: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const set = (field: keyof FormData, value: string | boolean) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const touch = (field: string) =>
    setTouched(prev => ({ ...prev, [field]: true }));

  const passwordValid = useMemo(
    () => PASSWORD_RULES.every(r => r.test(form.password)),
    [form.password],
  );

  const isFormValid = useMemo(() => {
    return (
      form.email.includes('@') &&
      passwordValid &&
      form.title !== '' &&
      form.firstName.trim() !== '' &&
      form.lastName.trim() !== '' &&
      form.phone.trim() !== '' &&
      form.consent
    );
  }, [form, passwordValid]);

  const validate = (): boolean => {
    const e: FieldErrors = {};
    if (!form.email || !form.email.includes('@')) e.email = 'Please enter a valid email address.';
    if (!passwordValid) e.password = 'Password does not meet all requirements.';
    if (!form.title) e.title = 'Please select a title.';
    if (!form.firstName.trim()) e.firstName = 'First name is required.';
    if (!form.lastName.trim()) e.lastName = 'Last name is required.';
    if (!form.phone.trim()) e.phone = 'Telephone number is required.';
    if (!form.consent) e.consent = 'You must agree to continue.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      email: true, password: true, title: true,
      firstName: true, lastName: true, phone: true, consent: true,
    });
    if (!validate()) return;
    toast.success('Account created successfully!');
    navigateTo('account');
  };

  const fieldError = (field: string) =>
    touched[field] && errors[field] ? errors[field] : null;

  const ariaInvalid = (field: string) =>
    touched[field] && errors[field] ? true : undefined;

  return (
    <div className="min-h-screen bg-[#F8F7F4] pt-20">
      <div className="mx-auto max-w-[800px] px-5 py-8 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Title */}
          <h1 className="mb-3 text-xs font-normal tracking-[0.2em] text-black uppercase">
            CREATE AN ACCOUNT
          </h1>

          {/* Legal subheader */}
          <p className="mb-6 text-[10px] leading-relaxed text-zinc-500">
            By creating an account, you agree to accept the{' '}
            <button type="button" className="underline hover:text-black">
              General Terms and Conditions of Use
            </button>{' '}
            and that your data will be processed in compliance with the{' '}
            <button type="button" className="underline hover:text-black">
              Privacy Policy
            </button>{' '}
            of Vines &amp; Branches.
          </p>

          {/* Required info note */}
          <div className="mb-6 text-right text-[10px] text-zinc-500">
            * Required information
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {/* Two-column grid */}
            <div className="grid gap-x-12 gap-y-0 md:grid-cols-2">
              {/* ─── LEFT COLUMN: LOGIN INFORMATION ─── */}
              <div>
                <h2 className="mb-4 border-b border-zinc-200 pb-2 text-[10px] font-normal tracking-[0.15em] text-black uppercase">
                  LOGIN INFORMATION
                </h2>

                {/* Email */}
                <div className="mb-4">
                  <label htmlFor={`${formId}-email`} className={labelBase}>
                    E-mail *
                  </label>
                  <input
                    id={`${formId}-email`}
                    type="email"
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                    onBlur={() => { touch('email'); validate(); }}
                    aria-invalid={ariaInvalid('email')}
                    aria-describedby={`${formId}-email-hint`}
                    className={inputBase}
                  />
                  <p id={`${formId}-email-hint`} className="mt-0.5 text-[10px] text-zinc-400">
                    Expected format: yourname@domain.com
                  </p>
                  {fieldError('email') && (
                    <p className={errorText} role="alert">{fieldError('email')}</p>
                  )}
                </div>

                {/* Password */}
                <div className="mb-3">
                  <div className="flex items-baseline justify-between">
                    <label htmlFor={`${formId}-password`} className={labelBase}>
                      Password *
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="flex items-center gap-0.5 text-[11px] text-zinc-600 hover:text-black"
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
                    onBlur={() => { touch('password'); validate(); }}
                    aria-invalid={ariaInvalid('password')}
                    aria-describedby={`${formId}-pw-rules`}
                    className={inputBase}
                  />
                  {fieldError('password') && (
                    <p className={errorText} role="alert">{fieldError('password')}</p>
                  )}
                </div>

                {/* Password requirements box */}
                <div
                  id={`${formId}-pw-rules`}
                  className="mt-1.5 rounded-sm border border-zinc-200 bg-zinc-50/80 px-4 py-3"
                >
                  <p className="mb-2 text-[10px] leading-relaxed text-zinc-500">
                    For your security, we invite you to fill your password according to the following criteria:
                  </p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                    {PASSWORD_RULES.map(rule => {
                      const passed = rule.test(form.password);
                      return (
                        <p
                          key={rule.key}
                          className={`text-[10px] leading-relaxed ${
                            form.password
                              ? passed
                                ? 'text-green-700'
                                : 'text-zinc-500'
                              : 'text-zinc-500'
                          }`}
                        >
                          {rule.label}
                        </p>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* ─── RIGHT COLUMN: PERSONAL INFORMATION ─── */}
              <div>
                <h2 className="mb-4 border-b border-zinc-200 pb-2 text-[10px] font-normal tracking-[0.15em] text-black uppercase">
                  Personal information
                </h2>

                {/* Title */}
                <div className="mb-4">
                  <label htmlFor={`${formId}-title`} className={labelBase}>
                    Title *
                  </label>
                  <div className="relative">
                    <select
                      id={`${formId}-title`}
                      value={form.title}
                      onChange={e => set('title', e.target.value)}
                      onBlur={() => { touch('title'); validate(); }}
                      aria-invalid={ariaInvalid('title')}
                      className={`${inputBase} cursor-pointer appearance-none pr-6`}
                    >
                      <option value="" disabled hidden />
                      <option value="Mr.">Mr.</option>
                      <option value="Mrs.">Mrs.</option>
                      <option value="Ms.">Ms.</option>
                      <option value="Mx.">Mx.</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-0 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
                  </div>
                  {fieldError('title') && (
                    <p className={errorText} role="alert">{fieldError('title')}</p>
                  )}
                </div>

                {/* First name */}
                <div className="mb-4">
                  <label htmlFor={`${formId}-firstName`} className={labelBase}>
                    First name *
                  </label>
                  <input
                    id={`${formId}-firstName`}
                    type="text"
                    value={form.firstName}
                    onChange={e => set('firstName', e.target.value)}
                    onBlur={() => { touch('firstName'); validate(); }}
                    aria-invalid={ariaInvalid('firstName')}
                    className={inputBase}
                  />
                  {fieldError('firstName') && (
                    <p className={errorText} role="alert">{fieldError('firstName')}</p>
                  )}
                </div>

                {/* Last name */}
                <div className="mb-4">
                  <label htmlFor={`${formId}-lastName`} className={labelBase}>
                    Last name *
                  </label>
                  <input
                    id={`${formId}-lastName`}
                    type="text"
                    value={form.lastName}
                    onChange={e => set('lastName', e.target.value)}
                    onBlur={() => { touch('lastName'); validate(); }}
                    aria-invalid={ariaInvalid('lastName')}
                    className={inputBase}
                  />
                  {fieldError('lastName') && (
                    <p className={errorText} role="alert">{fieldError('lastName')}</p>
                  )}
                </div>

                {/* Phone — area code + number */}
                <div className="mb-1">
                  <div className="flex gap-0">
                    {/* Country code selector */}
                    <div className="w-[100px] shrink-0">
                      <label className={labelBase} htmlFor={`${formId}-area-code`}>
                        Area code *
                      </label>
                      <div className="relative">
                        <select
                          id={`${formId}-area-code`}
                          value={form.areaCode}
                          onChange={e => set('areaCode', e.target.value)}
                          className={`${inputBase} w-full cursor-pointer appearance-none pr-6`}
                          aria-label="Country area code"
                        >
                          {COUNTRY_CODES.map(c => (
                            <option key={c.code} value={c.code}>
                              {c.flag} {c.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-1 top-1/2 h-3 w-3 -translate-y-1/2 text-zinc-400" />
                      </div>
                    </div>

                    {/* Phone number */}
                    <div className="flex-1 pl-3">
                      <label className={labelBase} htmlFor={`${formId}-phone`}>
                        Telephone number *
                      </label>
                      <input
                        id={`${formId}-phone`}
                        type="tel"
                        value={form.phone}
                        onChange={e => set('phone', e.target.value.replace(/[^\d]/g, ''))}
                        onBlur={() => { touch('phone'); validate(); }}
                        placeholder=""
                        aria-invalid={ariaInvalid('phone')}
                        aria-describedby={`${formId}-phone-hint`}
                        className={inputBase}
                      />
                    </div>
                  </div>
                  <p id={`${formId}-phone-hint`} className="mt-0.5 text-[10px] text-zinc-400">
                    Expected format: phone number with 10 digits
                  </p>
                  {fieldError('phone') && (
                    <p className={errorText} role="alert">{fieldError('phone')}</p>
                  )}
                </div>

                {/* Date of birth */}
                <div className="mt-4">
                  <label className={labelBase}>Date of birth</label>
                  <div className="grid grid-cols-[1fr_0.6fr_0.6fr] gap-2">
                    {/* Month */}
                    <div className="relative">
                      <select
                        value={form.birthMonth}
                        onChange={e => set('birthMonth', e.target.value)}
                        className={`${inputBase} cursor-pointer appearance-none pr-6`}
                        aria-label="Birth month"
                      >
                        <option value="" disabled hidden>Month</option>
                        {MONTHS.map((m, i) => (
                          <option key={m} value={String(i + 1).padStart(2, '0')}>
                            {m}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-0 top-1/2 h-3 w-3 -translate-y-1/2 text-zinc-400" />
                    </div>

                    {/* Day */}
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={2}
                      value={form.birthDay}
                      onChange={e => set('birthDay', e.target.value.replace(/[^\d]/g, ''))}
                      placeholder="Day"
                      aria-label="Birth day"
                      className={inputBase}
                    />

                    {/* Year */}
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={4}
                      value={form.birthYear}
                      onChange={e => set('birthYear', e.target.value.replace(/[^\d]/g, ''))}
                      placeholder="Year"
                      aria-label="Birth year"
                      className={inputBase}
                    />
                  </div>
                  <p className="mt-0.5 text-[10px] text-zinc-400">
                    Youth under the age of 18 cannot join as a member.
                  </p>
                </div>
              </div>
            </div>

            {/* ─── CONSENT ─── */}
            <div className="mt-8 flex items-start gap-2">
              <input
                type="checkbox"
                id={`${formId}-consent`}
                checked={form.consent}
                onChange={e => set('consent', e.target.checked)}
                onBlur={() => { touch('consent'); validate(); }}
                aria-invalid={ariaInvalid('consent')}
                className="mt-0 h-3.5 w-3.5 shrink-0 cursor-pointer appearance-none border border-zinc-400 bg-white checked:border-black checked:bg-black"
                style={{
                  backgroundImage: form.consent
                    ? `url("data:image/svg+xml,%3Csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3E%3C/svg%3E")`
                    : 'none',
                  backgroundSize: '100%',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                }}
              />
              <label
                htmlFor={`${formId}-consent`}
                className="cursor-pointer text-[10px] leading-relaxed text-zinc-600"
              >
                I agree to receive information by email about offers, services, products and events
                from Vines &amp; Branches or other group companies, in accordance with the{' '}
                <button type="button" className="underline hover:text-black">Privacy Policy</button>.
              </label>
            </div>
            <p className="mt-1.5 pl-6 text-[9px] leading-relaxed text-zinc-400">
              You can unsubscribe from email marketing communications via the &ldquo;Unsubscribe&rdquo;
              link at the bottom of each of our email promotional communications.
            </p>
            {fieldError('consent') && (
              <p className={`${errorText} pl-6`} role="alert">{fieldError('consent')}</p>
            )}

            {/* ─── SUBMIT ─── (left edge aligned with form left column) */}
            <div className="mt-8 grid gap-x-12 md:grid-cols-2">
              <div className="flex justify-start">
                <button
                  type="submit"
                  disabled={!isFormValid}
                  className="h-10 cursor-pointer rounded-sm bg-black px-12 text-[11px] font-normal tracking-[0.2em] text-white uppercase transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
                >
                  CREATE AN ACCOUNT
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
