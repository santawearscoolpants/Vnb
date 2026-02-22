import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { useRouter } from '../context/RouterContext';
import api from '../services/api';

const PASSWORD_RULES = [
  { key: 'length', label: 'At least 10 characters', test: (v: string) => v.length >= 10 },
  { key: 'upper', label: 'At least 1 uppercase letter', test: (v: string) => /[A-Z]/.test(v) },
  { key: 'lower', label: 'At least 1 lowercase letter', test: (v: string) => /[a-z]/.test(v) },
  { key: 'number', label: 'At least 1 number', test: (v: string) => /\d/.test(v) },
  { key: 'special', label: 'At least 1 special character', test: (v: string) => /[^A-Za-z0-9]/.test(v) },
];

export function ResetPasswordPage() {
  const { pageParams, navigateTo } = useRouter();
  const { email = '', token = '' } = pageParams;

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passwordValid = PASSWORD_RULES.every((r) => r.test(password));
  const confirmMatch = password !== '' && password === confirm;

  // Guard: if no token/email in params, this page was accessed directly
  if (!email || !token) {
    return (
      <div className="min-h-screen bg-zinc-50 pt-20">
        <div className="mx-auto max-w-5xl px-4 py-16 md:px-8">
          <div className="rounded-sm bg-white p-8 shadow-sm md:p-12 text-center">
            <p className="text-sm text-zinc-600 mb-6">This reset link is invalid or has already been used.</p>
            <Button className="rounded-none bg-zinc-800 hover:bg-black" onClick={() => navigateTo('forgot-password')}>
              Request a new link
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordValid || !confirmMatch) return;
    setError(null);
    setIsLoading(true);
    try {
      await api.resetPassword(email, token, password);
      setDone(true);
    } catch (err: any) {
      setError(err?.message || 'Invalid or expired reset link. Please request a new one.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 pt-20">
      <div className="mx-auto max-w-5xl px-4 py-16 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-sm bg-white p-8 shadow-sm md:p-12"
        >
          <h1 className="mb-2 text-center text-black">SET NEW PASSWORD</h1>

          <AnimatePresence mode="wait">
            {done ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-auto max-w-md text-center"
              >
                <div className="mb-6 mt-6 flex justify-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 text-2xl">
                    ✓
                  </div>
                </div>
                <p className="mb-2 text-sm font-medium text-black">Password updated</p>
                <p className="mb-8 text-sm text-zinc-600">
                  Your password has been reset. You can now sign in with your new password.
                </p>
                <Button
                  className="rounded-none bg-zinc-800 hover:bg-black"
                  onClick={() => navigateTo('account', { email })}
                >
                  Sign in
                </Button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handleSubmit}
                className="mx-auto max-w-md"
              >
                <p className="mb-8 text-center text-sm text-zinc-600">
                  Enter a new password for <span className="font-medium">{email}</span>.
                </p>

                {/* New password */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="new-password" className="text-sm text-zinc-700">
                      New password *
                    </Label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-xs text-zinc-500 underline hover:text-black"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <Input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoFocus
                    required
                    className="h-12 rounded-none border-zinc-300"
                  />
                  {/* Password rules */}
                  {password && (
                    <ul className="mt-3 space-y-1">
                      {PASSWORD_RULES.map((rule) => {
                        const passed = rule.test(password);
                        return (
                          <li
                            key={rule.key}
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
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                {/* Confirm password */}
                <div className="mb-6">
                  <Label htmlFor="confirm-password" className="mb-2 block text-sm text-zinc-700">
                    Confirm password *
                  </Label>
                  <Input
                    id="confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    className="h-12 rounded-none border-zinc-300"
                  />
                  {confirm && (
                    <p className={`mt-1 text-xs ${confirmMatch ? 'text-green-700' : 'text-red-600'}`}>
                      {confirmMatch ? 'Passwords match.' : 'Passwords do not match.'}
                    </p>
                  )}
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="mb-4 text-xs text-red-600"
                      role="alert"
                    >
                      {error}{' '}
                      <button
                        type="button"
                        onClick={() => navigateTo('forgot-password')}
                        className="underline hover:text-black"
                      >
                        Request a new link.
                      </button>
                    </motion.p>
                  )}
                </AnimatePresence>

                <Button
                  type="submit"
                  disabled={isLoading || !passwordValid || !confirmMatch}
                  className="h-12 w-full rounded-none bg-zinc-800 hover:bg-black disabled:bg-zinc-400"
                >
                  {isLoading ? 'Saving…' : 'SET NEW PASSWORD'}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
