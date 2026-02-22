import { motion } from 'motion/react';
import { CheckCircle, ShoppingBag } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useRouter } from '../context/RouterContext';
import logo from '../assets/logo.png';

export function OrderConfirmationPage() {
  const { navigateTo, pageParams } = useRouter();
  const orderNumber = pageParams?.orderNumber ?? '';
  const orderTotal = pageParams?.orderTotal ?? '';
  const email = pageParams?.email ?? '';

  return (
    <div className="min-h-screen bg-zinc-50 pt-20">
      {/* Header */}
      <div className="border-b border-zinc-200 bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <img src={logo} alt="VNB" className="mx-auto h-12 w-auto" />
        </div>
      </div>

      {/* Progress Steps */}
      <div className="border-b border-zinc-200 bg-white py-8">
        <div className="mx-auto max-w-4xl px-4 md:px-8">
          <div className="flex items-center justify-between">
            <StepIndicator label="CART" done />
            <div className="h-px flex-1 bg-black" />
            <StepIndicator label="CHECKOUT" done />
            <div className="h-px flex-1 bg-black" />
            <StepIndicator label="CONFIRMATION" active />
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="mx-auto max-w-2xl px-4 py-20 md:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="rounded-sm bg-white p-10 shadow-sm text-center"
        >
          {/* Checkmark */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 20 }}
            className="mb-6 flex justify-center"
          >
            <CheckCircle className="h-16 w-16 text-green-600" />
          </motion.div>

          <h1 className="mb-2 text-2xl font-light tracking-wide text-black">
            Thank you for your order
          </h1>
          <p className="mb-8 text-sm text-zinc-500">
            Your order has been placed and is being processed.
          </p>

          {/* Order details */}
          <div className="mb-8 rounded-sm bg-zinc-50 px-8 py-6 text-left space-y-3">
            <div className="flex justify-between">
              <span className="text-xs text-zinc-500 uppercase tracking-widest">Order number</span>
              <span className="text-sm font-medium text-black">{orderNumber || '—'}</span>
            </div>
            {orderTotal && (
              <div className="flex justify-between border-t border-zinc-200 pt-3">
                <span className="text-xs text-zinc-500 uppercase tracking-widest">Total charged</span>
                <span className="text-sm font-medium text-black">${Number(orderTotal).toFixed(2)}</span>
              </div>
            )}
            {email && (
              <div className="flex justify-between border-t border-zinc-200 pt-3">
                <span className="text-xs text-zinc-500 uppercase tracking-widest">Confirmation sent to</span>
                <span className="text-sm text-zinc-700">{email}</span>
              </div>
            )}
          </div>

          <p className="mb-8 text-xs text-zinc-500 leading-relaxed">
            A confirmation email will be sent to{' '}
            <span className="font-medium text-zinc-700">{email || 'your email'}</span>.
            We'll notify you when your order ships.
          </p>

          <Button
            onClick={() => navigateTo('home')}
            className="rounded-none bg-black px-10 py-5 text-xs font-medium tracking-widest text-white hover:bg-zinc-800"
          >
            <ShoppingBag className="mr-2 h-4 w-4" />
            CONTINUE SHOPPING
          </Button>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex flex-wrap justify-center gap-4">
              {['Terms and conditions', 'Privacy & cookies', 'Legal issues', 'Accessibility'].map(link => (
                <a key={link} href="#" className="text-xs text-zinc-600 hover:text-black">{link}</a>
              ))}
            </div>
            <p className="text-xs text-zinc-600">© Vines & Branches 2025. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StepIndicator({ label, active = false, done = false }: { label: string; active?: boolean; done?: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`mb-2 h-3 w-3 rounded-full transition-colors ${
          done ? 'bg-zinc-600' : active ? 'bg-black' : 'bg-zinc-300'
        }`}
      />
      <span className={`text-xs ${active ? 'text-black' : done ? 'text-zinc-600' : 'text-zinc-400'}`}>
        {label}
      </span>
    </div>
  );
}
