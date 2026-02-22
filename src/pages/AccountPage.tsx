import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { useRouter } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import api from '../services/api';

export function AccountPage() {
  return (
    <div className="min-h-screen bg-zinc-50 pt-20">
      <div className="mx-auto max-w-5xl px-4 py-16 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-sm bg-white p-8 shadow-sm md:p-12"
        >
          <h1 className="mb-8 text-center text-black">ACCOUNT</h1>
          <LoginForm />
        </motion.div>
      </div>
    </div>
  );
}

function LoginForm() {
  const { navigateTo, pageParams } = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState(pageParams.email || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(pageParams.showPassword === 'true');
  const [emailExists, setEmailExists] = useState(pageParams.showPassword === 'true');
  const [emailChecked, setEmailChecked] = useState(pageParams.showPassword === 'true');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setError(null);
    setIsLoading(true);
    try {
      const result = await api.checkEmail(email) as { exists: boolean };
      setEmailChecked(true);
      if (result.exists) {
        setEmailExists(true);
      } else {
        navigateTo('create-account', { email });
      }
    } catch {
      setError('Unable to check email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setError(null);
    setIsLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigateTo('home');
    } catch {
      setError('Incorrect password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setEmailChecked(false);
    setEmailExists(false);
    setPassword('');
    setError(null);
  };

  return (
    <form
      onSubmit={emailChecked && emailExists ? handleLogin : handleEmailContinue}
      className="mx-auto max-w-md"
    >
      <p className="mb-6 text-center text-sm text-zinc-700">
        Please enter your email below to access or create your account
      </p>

      {/* Email field */}
      <div className="mb-6">
        <Label htmlFor="email" className="mb-2 block text-sm text-zinc-700">
          E-mail *
        </Label>
        <div className="flex gap-2">
          <Input
            type="email"
            id="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailChecked) handleBack();
            }}
            placeholder="yourname@domain.com"
            required
            disabled={emailChecked && emailExists}
            className="h-12 rounded-none border-zinc-300 disabled:bg-zinc-50 disabled:text-zinc-500"
          />
          {emailChecked && emailExists && (
            <button
              type="button"
              onClick={handleBack}
              className="shrink-0 text-xs text-zinc-500 underline hover:text-black"
            >
              Change
            </button>
          )}
        </div>
        {!emailChecked && (
          <p className="mt-1 text-xs text-zinc-500">Expected format: yourname@domain.com</p>
        )}
      </div>

      {/* Password field — only shown after email is confirmed to exist */}
      <AnimatePresence>
        {emailChecked && emailExists && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="mb-6 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="login-password" className="block text-sm text-zinc-700">
                Password *
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
              type={showPassword ? 'text' : 'password'}
              id="login-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              required
              className="h-12 rounded-none border-zinc-300"
            />
            <button
              type="button"
              onClick={() => navigateTo('forgot-password')}
              className="mt-2 text-xs text-zinc-500 underline hover:text-black"
            >
              Forgot your password?
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error message */}
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
        {isLoading
          ? 'Please wait…'
          : emailChecked && emailExists
          ? 'SIGN IN'
          : 'CONTINUE'}
      </Button>
    </form>
  );
}
