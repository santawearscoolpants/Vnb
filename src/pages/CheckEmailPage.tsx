import { motion } from 'motion/react';
import { useState } from 'react';
import { Button } from '../components/ui/button';
import { useRouter } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'sonner';

export function CheckEmailPage() {
  const { pageParams, navigateTo } = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const email = (pageParams.email || '').trim();
  const [resendLoading, setResendLoading] = useState(false);

  const handleResend = async () => {
    if (!email) {
      toast.error('Missing email. Return to create account and try again.');
      return;
    }
    setResendLoading(true);
    try {
      await api.resendSignupConfirmation(email);
      toast.success('Confirmation email sent. Check your inbox.');
    } catch (err: any) {
      toast.error(err?.message || 'Could not resend. Try again in a moment.');
    } finally {
      setResendLoading(false);
    }
  };

  const displayEmail = email || 'the email address you used';

  return (
    <div className="min-h-screen bg-zinc-50 pt-20">
      <div className="mx-auto max-w-5xl px-4 py-16 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-sm bg-white p-8 shadow-sm md:p-12"
        >
          <h1 className="mb-2 text-center text-black">CHECK YOUR EMAIL</h1>

          <div className="mx-auto max-w-md text-center">
            <div className="mb-6 mt-6 flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 text-2xl">
                ✉️
              </div>
            </div>

            {!authLoading && isAuthenticated ? (
              <>
                <p className="mb-2 text-sm font-medium text-black">Your account is ready</p>
                <p className="mb-8 text-sm text-zinc-600">
                  You're signed in. You can go to your account or keep shopping.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <Button
                    className="rounded-none bg-zinc-800 hover:bg-black"
                    onClick={() => navigateTo('account-dashboard')}
                  >
                    My account
                  </Button>
                  <Button variant="outline" className="rounded-none" onClick={() => navigateTo('home')}>
                    Continue shopping
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="mb-2 text-sm font-medium text-black">Confirm your email</p>
                <p className="mb-4 text-sm text-zinc-600">
                  We sent a verification link to{' '}
                  {email ? <span className="font-medium text-black">{email}</span> : displayEmail}.
                  Open the email and tap the link to activate your account.
                </p>
                <p className="mb-8 text-xs text-zinc-500">
                  Didn't receive it? Check spam or promotions, or resend the email below.
                </p>

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-none"
                    disabled={resendLoading || !email}
                    onClick={handleResend}
                  >
                    {resendLoading ? 'Sending…' : 'Resend confirmation email'}
                  </Button>
                  <Button
                    type="button"
                    className="rounded-none bg-zinc-800 hover:bg-black"
                    onClick={() => navigateTo('account', email ? { email } : undefined)}
                  >
                    Back to sign in
                  </Button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
