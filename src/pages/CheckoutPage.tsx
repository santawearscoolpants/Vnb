import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Lock, Package } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useRouter } from '../context/RouterContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'sonner';
import logo from '../assets/logo.png';

const MEDIA_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') ?? 'http://localhost:8000';
function resolveImageUrl(url?: string) {
  if (!url) return '/logo.png';
  if (url.startsWith('http')) return url;
  return `${MEDIA_BASE}${url}`;
}

const COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Nigeria',
  'Ghana', 'South Africa', 'Kenya', 'France', 'Germany', 'Italy',
  'Spain', 'Netherlands', 'Belgium', 'Sweden', 'Norway', 'Denmark',
  'Switzerland', 'Austria', 'Portugal', 'Brazil', 'Mexico', 'Argentina',
  'Japan', 'South Korea', 'China', 'India', 'Singapore', 'New Zealand',
  'Ireland', 'Scotland', 'Wales', 'Jamaica', 'Trinidad and Tobago',
];

type FormData = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  notes: string;
};

export function CheckoutPage() {
  const { goBack, navigateTo } = useRouter();
  const { cart, refresh } = useCart();
  const { user } = useAuth();

  const [form, setForm] = useState<FormData>({
    email: user?.email ?? '',
    firstName: user?.first_name ?? '',
    lastName: user?.last_name ?? '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const items = cart?.items ?? [];
  const subtotal = Number(cart?.total ?? 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;
  const isEmpty = items.length === 0;

  function set(field: keyof FormData) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setForm(prev => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
    };
  }

  function validate(): boolean {
    const required: (keyof FormData)[] = ['email', 'firstName', 'lastName', 'phone', 'address', 'city', 'state', 'zipCode', 'country'];
    const next: Partial<FormData> = {};
    for (const k of required) {
      if (!form[k].trim()) next[k] = 'This field is required';
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = 'Enter a valid email address';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    if (isEmpty) {
      toast.error('Your cart is empty.');
      return;
    }

    setIsSubmitting(true);
    try {
      const order = (await api.createOrder({
        email: form.email,
        first_name: form.firstName,
        last_name: form.lastName,
        phone: form.phone,
        address: form.address,
        city: form.city,
        state: form.state,
        zip_code: form.zipCode,
        country: form.country,
        notes: form.notes || undefined,
      })) as any;

      await refresh();
      navigateTo('order-confirmation', {
        orderNumber: order.order_number,
        orderTotal: String(order.total),
        email: form.email,
      });
    } catch (err: any) {
      toast.error(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 pt-20">
      {/* Header */}
      <div className="border-b border-zinc-200 bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <button
            onClick={goBack}
            className="mb-4 flex items-center gap-2 text-sm text-zinc-700 transition-colors hover:text-black"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to cart
          </button>
          <img src={logo} alt="VNB" className="mx-auto h-12 w-auto" />
        </div>
      </div>

      {/* Progress Steps */}
      <div className="border-b border-zinc-200 bg-white py-8">
        <div className="mx-auto max-w-4xl px-4 md:px-8">
          <div className="flex items-center justify-between">
            <StepIndicator label="CART" done />
            <div className="h-px flex-1 bg-black" />
            <StepIndicator label="CHECKOUT" active />
            <div className="h-px flex-1 bg-zinc-300" />
            <StepIndicator label="CONFIRMATION" />
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <form onSubmit={handleSubmit}>
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Left — Form */}
            <div className="space-y-8 lg:col-span-2">
              {/* Contact */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-sm bg-white p-6 shadow-sm"
              >
                <h2 className="mb-6 text-sm font-medium uppercase tracking-widest text-black">
                  Contact Information
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label htmlFor="email" className="text-xs text-zinc-700">
                      Email address *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={set('email')}
                      className={`mt-1 rounded-none border-zinc-300 ${errors.email ? 'border-red-400' : ''}`}
                      placeholder="you@example.com"
                    />
                    {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                  </div>
                </div>
              </motion.div>

              {/* Delivery */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="rounded-sm bg-white p-6 shadow-sm"
              >
                <h2 className="mb-6 text-sm font-medium uppercase tracking-widest text-black">
                  Delivery Details
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="firstName" className="text-xs text-zinc-700">First name *</Label>
                    <Input
                      id="firstName"
                      value={form.firstName}
                      onChange={set('firstName')}
                      className={`mt-1 rounded-none border-zinc-300 ${errors.firstName ? 'border-red-400' : ''}`}
                    />
                    {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>}
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-xs text-zinc-700">Last name *</Label>
                    <Input
                      id="lastName"
                      value={form.lastName}
                      onChange={set('lastName')}
                      className={`mt-1 rounded-none border-zinc-300 ${errors.lastName ? 'border-red-400' : ''}`}
                    />
                    {errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>}
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-xs text-zinc-700">Phone *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={form.phone}
                      onChange={set('phone')}
                      className={`mt-1 rounded-none border-zinc-300 ${errors.phone ? 'border-red-400' : ''}`}
                      placeholder="+1 555 000 0000"
                    />
                    {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
                  </div>
                  <div>
                    <Label htmlFor="country" className="text-xs text-zinc-700">Country *</Label>
                    <select
                      id="country"
                      value={form.country}
                      onChange={set('country')}
                      className={`mt-1 h-10 w-full rounded-none border border-zinc-300 bg-white px-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-400 ${errors.country ? 'border-red-400' : ''}`}
                    >
                      {COUNTRIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    {errors.country && <p className="mt-1 text-xs text-red-500">{errors.country}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="address" className="text-xs text-zinc-700">Address *</Label>
                    <Input
                      id="address"
                      value={form.address}
                      onChange={set('address')}
                      className={`mt-1 rounded-none border-zinc-300 ${errors.address ? 'border-red-400' : ''}`}
                      placeholder="123 Main Street, Apt 4B"
                    />
                    {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
                  </div>
                  <div>
                    <Label htmlFor="city" className="text-xs text-zinc-700">City *</Label>
                    <Input
                      id="city"
                      value={form.city}
                      onChange={set('city')}
                      className={`mt-1 rounded-none border-zinc-300 ${errors.city ? 'border-red-400' : ''}`}
                    />
                    {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city}</p>}
                  </div>
                  <div>
                    <Label htmlFor="state" className="text-xs text-zinc-700">State / Region *</Label>
                    <Input
                      id="state"
                      value={form.state}
                      onChange={set('state')}
                      className={`mt-1 rounded-none border-zinc-300 ${errors.state ? 'border-red-400' : ''}`}
                    />
                    {errors.state && <p className="mt-1 text-xs text-red-500">{errors.state}</p>}
                  </div>
                  <div>
                    <Label htmlFor="zipCode" className="text-xs text-zinc-700">ZIP / Postal code *</Label>
                    <Input
                      id="zipCode"
                      value={form.zipCode}
                      onChange={set('zipCode')}
                      className={`mt-1 rounded-none border-zinc-300 ${errors.zipCode ? 'border-red-400' : ''}`}
                    />
                    {errors.zipCode && <p className="mt-1 text-xs text-red-500">{errors.zipCode}</p>}
                  </div>
                </div>
              </motion.div>

              {/* Notes */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-sm bg-white p-6 shadow-sm"
              >
                <h2 className="mb-4 text-sm font-medium uppercase tracking-widest text-black">
                  Order Notes
                  <span className="ml-2 text-xs font-normal normal-case tracking-normal text-zinc-500">(optional)</span>
                </h2>
                <textarea
                  value={form.notes}
                  onChange={set('notes')}
                  rows={3}
                  className="w-full resize-none rounded-none border border-zinc-300 p-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400"
                  placeholder="Special instructions for delivery…"
                />
              </motion.div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={isSubmitting || isEmpty}
                className="w-full rounded-none bg-black py-6 text-xs font-medium tracking-widest text-white hover:bg-zinc-800 disabled:opacity-50"
              >
                {isSubmitting ? 'PLACING ORDER…' : 'PLACE ORDER'}
                <Lock className="ml-2 h-4 w-4" />
              </Button>
              <p className="text-center text-xs text-zinc-500">
                Your payment information is encrypted and secure.
              </p>
            </div>

            {/* Right — Order Summary */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="rounded-sm bg-white p-6 shadow-sm"
              >
                <h3 className="mb-4 text-sm font-medium uppercase tracking-widest text-black">
                  Your Order ({items.length} {items.length === 1 ? 'item' : 'items'})
                </h3>

                {isEmpty ? (
                  <p className="text-xs text-zinc-500">Your cart is empty.</p>
                ) : (
                  <div className="space-y-4">
                    {items.map((item: any) => (
                      <div key={item.id} className="flex items-start gap-3 border-b border-zinc-100 pb-4">
                        <img
                          src={resolveImageUrl(item.product_detail?.image)}
                          alt={item.product_detail?.name}
                          className="h-16 w-16 flex-shrink-0 object-cover"
                        />
                        <div className="flex-1">
                          <p className="text-xs font-medium text-black">{item.product_detail?.name || 'Product'}</p>
                          <p className="text-xs text-zinc-500">
                            {[item.size && `Size: ${item.size}`, item.color && item.color]
                              .filter(Boolean)
                              .join(' · ')}
                          </p>
                          <div className="mt-1 flex justify-between">
                            <span className="text-xs text-zinc-500">Qty {item.quantity}</span>
                            <span className="text-xs font-medium text-black">
                              ${Number(item.subtotal ?? (Number(item.product_detail?.price ?? 0) * item.quantity)).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 space-y-2 border-t border-zinc-100 pt-4">
                  <div className="flex justify-between text-xs text-zinc-600">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-zinc-600">
                    <span>Shipping</span>
                    <span className="text-green-700">Free</span>
                  </div>
                  <div className="flex justify-between text-xs text-zinc-600">
                    <span>Tax (8%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-zinc-200 pt-2 text-sm font-medium text-black">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </motion.div>

              {/* VNB Box */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-sm bg-white p-6 shadow-sm"
              >
                <h3 className="mb-4 text-sm text-black">THE VNB BOX</h3>
                <div className="flex items-start gap-4">
                  <Package className="mt-0.5 h-10 w-10 flex-shrink-0 text-amber-500" />
                  <p className="text-xs text-zinc-700">
                    All orders are delivered in a VNB box tied with a ribbon, with the exception of{' '}
                    <a href="#" className="underline">certain items</a>.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </form>
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
