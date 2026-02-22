import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { useRouter } from '../context/RouterContext';
import api from '../services/api';

export function ForgotPasswordPage() {
  const { navigateTo } = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setError(null);
    setIsLoading(true);
    try {
      await api.requestPasswordReset(email);
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
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
          <h1 className="mb-2 text-center text-black">RESET PASSWORD</h1>

          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-auto max-w-md text-center"
              >
                <div className="mb-6 mt-6 flex justify-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 text-2xl">
                    ✉️
                  </div>
                </div>
                <p className="mb-2 text-sm font-medium text-black">Check your inbox</p>
                <p className="mb-8 text-sm text-zinc-600">
                  If <span className="font-medium">{email}</span> is registered, you'll receive a
                  password reset link shortly.
                </p>
                <Button
                  variant="outline"
                  className="rounded-none"
                  onClick={() => navigateTo('account')}
                >
                  Back to sign in
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
                  Enter the email address for your account and we'll send you a link to reset your
                  password.
                </p>

                <div className="mb-6">
                  <Label htmlFor="reset-email" className="mb-2 block text-sm text-zinc-700">
                    E-mail *
                  </Label>
                  <Input
                    type="email"
                    id="reset-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@domain.com"
                    required
                    autoFocus
                    className="h-12 rounded-none border-zinc-300"
                  />
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
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="mb-4 h-12 w-full rounded-none bg-zinc-800 hover:bg-black disabled:bg-zinc-400"
                >
                  {isLoading ? 'Sending…' : 'SEND RESET LINK'}
                </Button>

                <button
                  type="button"
                  onClick={() => navigateTo('account')}
                  className="w-full text-center text-xs text-zinc-500 underline hover:text-black"
                >
                  Back to sign in
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
