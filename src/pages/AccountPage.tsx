import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { useRouter } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

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
  const { navigateTo } = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setError(null);
    setIsLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigateTo('home');
    } catch (err: any) {
      setError(err?.message || 'Sign in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="mx-auto max-w-md">
      <p className="mb-6 text-center text-sm text-zinc-700">
        Sign in with your email and password.
      </p>

      <div className="mb-6">
        <Label htmlFor="email" className="mb-2 block text-sm text-zinc-700">
          E-mail *
        </Label>
        <Input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="yourname@domain.com"
          required
          className="h-12 rounded-none border-zinc-300"
        />
        <p className="mt-1 text-xs text-zinc-500">Expected format: yourname@domain.com</p>
      </div>

      <div className="mb-6 overflow-hidden">
        <div className="mb-2 flex items-center justify-between">
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
      </div>

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
        {isLoading ? 'Please wait…' : 'SIGN IN'}
      </Button>

      <p className="text-center text-xs text-zinc-500">
        New here?{' '}
        <button type="button" onClick={() => navigateTo('create-account')} className="underline hover:text-black">
          Create account
        </button>
      </p>
    </form>
  );
}
