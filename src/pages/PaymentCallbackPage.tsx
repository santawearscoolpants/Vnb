import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { AlertCircle, LoaderCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useRouter } from '../context/RouterContext';
import api from '../services/api';
import logo from '../assets/logo.png';

const CHECKOUT_FORM_STORAGE_KEY = 'vnb_checkout_form';

function clearPaymentQuery() {
  window.history.replaceState({}, '', window.location.pathname);
}

export function PaymentCallbackPage() {
  const { navigateTo, pageParams } = useRouter();
  const [status, setStatus] = useState<'verifying' | 'error'>('verifying');
  const [message, setMessage] = useState('Confirming your payment with Paystack…');

  useEffect(() => {
    const qs = new URLSearchParams(window.location.search);
    const reference = pageParams.reference || qs.get('reference') || qs.get('trxref') || '';
    const paystackStatus = pageParams.status || qs.get('status') || '';
    if (!reference) {
      setStatus('error');
      setMessage('We could not find a payment reference to verify.');
      return;
    }
    if (paystackStatus === 'cancelled') {
      setStatus('error');
      setMessage('Payment was cancelled before completion. You can try again.');
      return;
    }

    let cancelled = false;

    async function verify() {
      // Paystack verification can be briefly eventual-consistent right after redirect.
      // Retry a few times before failing hard.
      const MAX_RETRIES = 5;
      for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
        try {
          const result = await api.verifyPayment(reference);
          if (cancelled) return;

          sessionStorage.removeItem(CHECKOUT_FORM_STORAGE_KEY);
          clearPaymentQuery();
          navigateTo('order-confirmation', {
            orderNumber: result.order.order_number,
            orderTotal: String(result.order.total),
            email: result.order.email,
            currency: result.order.payment_currency || 'USD',
          });
          return;
        } catch (error: any) {
          if (cancelled) return;
          const errMsg = (error?.message || '').toLowerCase();
          const isRetriable =
            errMsg.includes('not been completed') ||
            errMsg.includes('pending') ||
            errMsg.includes('could not verify');

          if (!isRetriable || attempt === MAX_RETRIES) {
            setStatus('error');
            setMessage(error?.message || 'We could not verify your payment. Please try again.');
            return;
          }
          setMessage(`Confirming your payment with Paystack… (${attempt}/${MAX_RETRIES})`);
          await new Promise((resolve) => setTimeout(resolve, 1200));
        }
      }
    }

    verify();

    return () => {
      cancelled = true;
    };
  }, [navigateTo, pageParams.reference, pageParams.status]);

  return (
    <div className="min-h-screen bg-zinc-50 pt-20">
      <div className="border-b border-zinc-200 bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <img src={logo} alt="VNB" className="mx-auto h-12 w-auto" />
        </div>
      </div>

      <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center px-4 py-16 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full rounded-sm bg-white p-10 text-center shadow-sm"
        >
          {status === 'verifying' ? (
            <>
              <LoaderCircle className="mx-auto mb-6 h-12 w-12 animate-spin text-black" />
              <h1 className="mb-3 text-2xl font-light text-black">Verifying payment</h1>
              <p className="text-sm text-zinc-500">{message}</p>
            </>
          ) : (
            <>
              <AlertCircle className="mx-auto mb-6 h-12 w-12 text-red-500" />
              <h1 className="mb-3 text-2xl font-light text-black">Payment needs attention</h1>
              <p className="mb-8 text-sm text-zinc-500">{message}</p>
              <div className="flex flex-col justify-center gap-3 sm:flex-row">
                <Button
                  onClick={() => {
                    clearPaymentQuery();
                    navigateTo('checkout');
                  }}
                  className="rounded-none bg-black px-8 text-xs font-medium tracking-widest text-white hover:bg-zinc-800"
                >
                  RETURN TO CHECKOUT
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    clearPaymentQuery();
                    navigateTo('home');
                  }}
                  className="rounded-none border-zinc-300 px-8 text-xs font-medium tracking-widest"
                >
                  CONTINUE SHOPPING
                </Button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
