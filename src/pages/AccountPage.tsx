import { motion } from 'motion/react';
import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { useRouter } from '../context/RouterContext';
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
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [emailExists] = useState(false);

  const handleEmailContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setEmailSubmitted(true);
    if (!emailExists) {
      navigateTo('create-account', { email });
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Login successful!');
  };

  return (
    <form onSubmit={emailSubmitted && emailExists ? handleLogin : handleEmailContinue} className="mx-auto max-w-md">
      <p className="mb-6 text-center text-sm text-zinc-700">
        Please enter your email below to access or create your account
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

      {emailSubmitted && emailExists && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-6 overflow-hidden"
        >
          <Label htmlFor="login-password" className="mb-2 block text-sm text-zinc-700">
            Password *
          </Label>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              id="login-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-12 rounded-none border-zinc-300 pr-16"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-zinc-600 hover:text-black"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </motion.div>
      )}

      <Button
        type="submit"
        className="mb-4 h-12 w-full rounded-none bg-zinc-800 hover:bg-black"
      >
        CONTINUE
      </Button>
    </form>
  );
}

