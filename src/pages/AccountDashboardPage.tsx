import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingBag, User, ChevronDown, ChevronUp,
  Package, Clock, CheckCircle, Truck, XCircle, ArrowLeft,
  MapPin, CreditCard, Plus, Lock,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAuth } from '../context/AuthContext';
import { useRouter } from '../context/RouterContext';
import api from '../services/api';
import { toast } from 'sonner';

type Tab = 'orders' | 'addresses' | 'payments' | 'profile';

const TABS: { id: Tab; label: string }[] = [
  { id: 'orders',    label: 'My Orders' },
  { id: 'addresses', label: 'Address Book' },
  { id: 'payments',  label: 'Payments' },
  { id: 'profile',   label: 'Profile' },
];

type OrderItem = {
  id: number;
  product_name: string;
  quantity: number;
  size: string;
  color: string;
  price: string;
  subtotal: string;
};

type Order = {
  id: number;
  order_number: string;
  status: string;
  total: string;
  subtotal: string;
  shipping: string;
  tax: string;
  created_at: string;
  items: OrderItem[];
  address: string;
  city: string;
  state: string;
  country: string;
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending:    { label: 'Pending',    color: 'bg-amber-100 text-amber-800',   icon: Clock },
  processing: { label: 'Processing', color: 'bg-blue-100 text-blue-800',     icon: Package },
  shipped:    { label: 'Shipped',    color: 'bg-indigo-100 text-indigo-800', icon: Truck },
  delivered:  { label: 'Delivered',  color: 'bg-green-100 text-green-800',   icon: CheckCircle },
  cancelled:  { label: 'Cancelled',  color: 'bg-red-100 text-red-800',       icon: XCircle },
};

export function AccountDashboardPage() {
  const { user, logout } = useAuth();
  const { navigateTo, goBack } = useRouter();
  const [tab, setTab] = useState<Tab>('orders');

  useEffect(() => {
    if (!user) navigateTo('account');
  }, [user, navigateTo]);

  if (!user) return null;

  const initials = `${(user.first_name ?? '')[0] ?? ''}${(user.last_name ?? '')[0] ?? ''}`.toUpperCase();

  return (
    <div className="min-h-screen bg-zinc-50 pt-20">
      {/* Header */}
      <div className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-6 md:px-8">
          <button
            onClick={goBack}
            className="mb-4 flex items-center gap-2 text-sm text-zinc-600 hover:text-black"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-sm font-medium text-white">
              {initials || <User className="h-5 w-5" />}
            </div>
            <div>
              <h1 className="text-lg font-medium text-black">
                {user.first_name || user.last_name
                  ? `${user.first_name} ${user.last_name}`.trim()
                  : 'My Account'}
              </h1>
              <p className="text-sm text-zinc-500">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Tabs — scrollable on mobile */}
        <div className="mx-auto max-w-5xl px-4 md:px-8">
          <div className="flex gap-6 overflow-x-auto scrollbar-none">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`relative shrink-0 pb-3 text-sm transition-colors ${
                  tab === t.id ? 'font-medium text-black' : 'text-zinc-500 hover:text-zinc-700'
                }`}
              >
                {t.label}
                {tab === t.id && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute bottom-0 left-0 h-0.5 w-full bg-black"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-5xl px-4 py-10 md:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18 }}
          >
            {tab === 'orders'    && <OrdersTab />}
            {tab === 'addresses' && <AddressBookTab />}
            {tab === 'payments'  && <PaymentsTab />}
            {tab === 'profile'   && (
              <ProfileTab
                user={user}
                onLogout={async () => { await logout(); navigateTo('home'); }}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ─── Orders Tab ─────────────────────────────────────────────── */
function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { navigateTo } = useRouter();

  useEffect(() => {
    api.getOrders()
      .then((data: any) => {
        const items = Array.isArray(data) ? data : data?.results ?? [];
        setOrders(items);
      })
      .catch(() => setOrders([]))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse rounded-sm bg-white p-6 shadow-sm">
            <div className="mb-4 flex justify-between">
              <div className="h-4 w-32 rounded bg-zinc-200" />
              <div className="h-4 w-20 rounded bg-zinc-200" />
            </div>
            <div className="h-3 w-24 rounded bg-zinc-100" />
          </div>
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="py-20 text-center">
        <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-zinc-300" />
        <h3 className="mb-2 text-black">No orders yet</h3>
        <p className="mb-6 text-sm text-zinc-500">Once you place an order it will appear here.</p>
        <Button
          onClick={() => navigateTo('home')}
          className="rounded-none bg-black px-8 text-white hover:bg-zinc-800"
        >
          START SHOPPING
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => <OrderCard key={order.id} order={order} />)}
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
  const StatusIcon = cfg.icon;
  const date = new Date(order.created_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="rounded-sm bg-white shadow-sm">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-start justify-between p-6 text-left"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-black">{order.order_number}</span>
            <span className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.color}`}>
              <StatusIcon className="h-3 w-3" />
              {cfg.label}
            </span>
          </div>
          <p className="text-xs text-zinc-500">{date}</p>
          <p className="text-xs text-zinc-500">
            {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
            {' · '}{order.city}, {order.country}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-black">${Number(order.total).toFixed(2)}</span>
          {expanded
            ? <ChevronUp className="h-4 w-4 text-zinc-400" />
            : <ChevronDown className="h-4 w-4 text-zinc-400" />
          }
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-zinc-100 px-6 pb-6 pt-4">
              <div className="mb-4 space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium text-black">{item.product_name}</p>
                      <p className="text-xs text-zinc-500">
                        {[item.size && `Size ${item.size}`, item.color && item.color]
                          .filter(Boolean).join(' · ')}
                        {' · '}Qty {item.quantity}
                      </p>
                    </div>
                    <span className="text-zinc-700">${Number(item.subtotal).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-1 border-t border-zinc-100 pt-3 text-xs text-zinc-500">
                <div className="flex justify-between"><span>Subtotal</span><span>${Number(order.subtotal).toFixed(2)}</span></div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{Number(order.shipping) === 0 ? 'Free' : `$${Number(order.shipping).toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between"><span>Tax</span><span>${Number(order.tax).toFixed(2)}</span></div>
                <div className="flex justify-between border-t border-zinc-200 pt-2 text-sm font-medium text-black">
                  <span>Total</span><span>${Number(order.total).toFixed(2)}</span>
                </div>
              </div>
              <p className="mt-3 text-xs text-zinc-400">
                Delivered to: {order.address}, {order.city}, {order.state}, {order.country}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Address Book Tab ───────────────────────────────────────── */
const ADDRESS_COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Nigeria',
  'Ghana', 'South Africa', 'Kenya', 'France', 'Germany', 'Italy',
  'Spain', 'Netherlands', 'Belgium', 'Sweden', 'Norway', 'Denmark',
  'Switzerland', 'Austria', 'Portugal', 'Brazil', 'Mexico', 'Japan',
  'South Korea', 'Singapore', 'New Zealand', 'Ireland',
];

type AddressForm = {
  address: string;
  address_continued: string;
  city: string;
  state: string;
  zip_code: string;
  location: string;
  phone: string;
};

function AddressBookTab() {
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<AddressForm>({
    address: '', address_continued: '', city: '', state: '', zip_code: '', location: 'Ghana', phone: '',
  });
  const hasAddress = Boolean(form.address && form.city);

  useEffect(() => {
    api.getCurrentUser()
      .then((data: any) => {
        const p = data?.profile ?? {};
        setForm({
          address:           p.address          ?? '',
          address_continued: p.address_continued ?? '',
          city:              p.city             ?? '',
          state:             p.state            ?? '',
          zip_code:          p.zip_code         ?? '',
          location:          p.location         ?? 'Ghana',
          phone:             p.phone            ?? '',
        });
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  function set(field: keyof AddressForm) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }));
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.updateProfile({ profile: form });
      toast.success('Address saved.');
      setIsEditing(false);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save address.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-40 rounded-sm bg-white shadow-sm" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-black">Saved Addresses</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-black"
          >
            <Plus className="h-3.5 w-3.5" />
            {hasAddress ? 'Edit address' : 'Add address'}
          </button>
        )}
      </div>

      {/* Address card or empty state */}
      {!isEditing && (
        hasAddress ? (
          <div className="rounded-sm bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-start justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-zinc-400" />
                <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">Default Address</span>
              </div>
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">Primary</span>
            </div>
            <div className="text-sm text-zinc-700 leading-relaxed">
              <p>{form.address}{form.address_continued && `, ${form.address_continued}`}</p>
              <p>{form.city}{form.state && `, ${form.state}`} {form.zip_code}</p>
              <p>{form.location}</p>
              {form.phone && <p className="mt-1 text-zinc-500">{form.phone}</p>}
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="mt-4 text-xs text-zinc-400 underline hover:text-black"
            >
              Edit
            </button>
          </div>
        ) : (
          <div className="py-16 text-center">
            <MapPin className="mx-auto mb-4 h-10 w-10 text-zinc-300" />
            <p className="mb-2 text-sm text-zinc-700">No saved addresses yet</p>
            <p className="mb-6 text-xs text-zinc-400">
              Add an address to speed up checkout.
            </p>
            <Button
              onClick={() => setIsEditing(true)}
              className="rounded-none bg-black px-8 text-xs font-medium tracking-widest text-white hover:bg-zinc-800"
            >
              ADD ADDRESS
            </Button>
          </div>
        )
      )}

      {/* Edit form */}
      {isEditing && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-sm bg-white p-6 shadow-sm"
        >
          <h3 className="mb-5 text-sm font-medium text-black">
            {hasAddress ? 'Edit Default Address' : 'Add New Address'}
          </h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="address" className="text-xs text-zinc-600">Street address *</Label>
                <Input id="address" value={form.address} onChange={set('address')} required
                  placeholder="123 Main Street"
                  className="mt-1 rounded-none border-zinc-300" />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="address_continued" className="text-xs text-zinc-600">Apt, suite, unit</Label>
                <Input id="address_continued" value={form.address_continued} onChange={set('address_continued')}
                  placeholder="Apt 4B"
                  className="mt-1 rounded-none border-zinc-300" />
              </div>
              <div>
                <Label htmlFor="city" className="text-xs text-zinc-600">City *</Label>
                <Input id="city" value={form.city} onChange={set('city')} required
                  className="mt-1 rounded-none border-zinc-300" />
              </div>
              <div>
                <Label htmlFor="state" className="text-xs text-zinc-600">State / Region</Label>
                <Input id="state" value={form.state} onChange={set('state')}
                  className="mt-1 rounded-none border-zinc-300" />
              </div>
              <div>
                <Label htmlFor="zip_code" className="text-xs text-zinc-600">ZIP / Postal code</Label>
                <Input id="zip_code" value={form.zip_code} onChange={set('zip_code')}
                  className="mt-1 rounded-none border-zinc-300" />
              </div>
              <div>
                <Label htmlFor="location" className="text-xs text-zinc-600">Country *</Label>
                <select id="location" value={form.location} onChange={set('location')}
                  className="mt-1 h-10 w-full rounded-none border border-zinc-300 bg-white px-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-400">
                  {ADDRESS_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="phone" className="text-xs text-zinc-600">Phone number</Label>
                <Input id="phone" type="tel" value={form.phone} onChange={set('phone')}
                  placeholder="+233 20 000 0000"
                  className="mt-1 rounded-none border-zinc-300" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isSaving}
                className="rounded-none bg-black px-6 text-xs font-medium tracking-widest text-white hover:bg-zinc-800 disabled:opacity-50">
                {isSaving ? 'SAVING…' : 'SAVE ADDRESS'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)}
                className="rounded-none border-zinc-300 text-xs tracking-widest hover:bg-zinc-50">
                CANCEL
              </Button>
            </div>
          </form>
        </motion.div>
      )}
    </div>
  );
}

/* ─── Payments Tab ───────────────────────────────────────────── */
function PaymentsTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-sm font-medium text-black">Payment Methods</h2>

      {/* Empty state */}
      <div className="rounded-sm bg-white p-10 text-center shadow-sm">
        <CreditCard className="mx-auto mb-4 h-10 w-10 text-zinc-300" />
        <p className="mb-1 text-sm text-zinc-700">No payment methods saved</p>
        <p className="text-xs text-zinc-400">Saved cards will appear here once payment is set up.</p>
      </div>

      {/* Coming soon notice */}
      <div className="flex items-start gap-3 rounded-sm border border-zinc-200 bg-zinc-50 p-5">
        <Lock className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
        <div className="text-xs text-zinc-500 leading-relaxed">
          <p className="mb-1 font-medium text-zinc-700">Secure payments coming soon</p>
          We are integrating{' '}
          <span className="font-medium text-zinc-700">Paystack</span> for local payments (Ghana, Nigeria)
          and <span className="font-medium text-zinc-700">Stripe</span> for international cards.
          Your payment data is never stored on our servers — it is handled directly by the payment provider.
        </div>
      </div>

      {/* Accepted methods preview */}
      <div className="rounded-sm bg-white p-6 shadow-sm">
        <p className="mb-4 text-xs font-medium uppercase tracking-wider text-zinc-400">Accepted payment methods</p>
        <div className="flex flex-wrap gap-3">
          {['Visa', 'Mastercard', 'Mobile Money', 'Paystack', 'Bank Transfer'].map((method) => (
            <span
              key={method}
              className="rounded border border-zinc-200 px-3 py-1.5 text-xs text-zinc-600"
            >
              {method}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Profile Tab ────────────────────────────────────────────── */
function ProfileTab({
  user,
  onLogout,
}: {
  user: { id: number; email: string; first_name: string; last_name: string };
  onLogout: () => void;
}) {
  const [form, setForm] = useState({ firstName: user.first_name, lastName: user.last_name });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.updateProfile({ first_name: form.firstName, last_name: form.lastName });
      toast.success('Profile updated.');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Personal info */}
      <div className="rounded-sm bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <User className="h-4 w-4 text-zinc-400" />
          <h3 className="text-sm font-medium text-black">Personal Information</h3>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="firstName" className="text-xs text-zinc-600">First name</Label>
              <Input id="firstName" value={form.firstName}
                onChange={(e) => setForm(p => ({ ...p, firstName: e.target.value }))}
                className="mt-1 rounded-none border-zinc-300" />
            </div>
            <div>
              <Label htmlFor="lastName" className="text-xs text-zinc-600">Last name</Label>
              <Input id="lastName" value={form.lastName}
                onChange={(e) => setForm(p => ({ ...p, lastName: e.target.value }))}
                className="mt-1 rounded-none border-zinc-300" />
            </div>
          </div>
          <div>
            <Label className="text-xs text-zinc-600">Email address</Label>
            <Input value={user.email} disabled
              className="mt-1 rounded-none border-zinc-200 bg-zinc-50 text-zinc-500" />
            <p className="mt-1 text-xs text-zinc-400">Email cannot be changed.</p>
          </div>
          <Button type="submit" disabled={isSaving}
            className="rounded-none bg-black px-6 text-xs font-medium tracking-widest text-white hover:bg-zinc-800 disabled:opacity-50">
            {isSaving ? 'SAVING…' : 'SAVE CHANGES'}
          </Button>
        </form>
      </div>

      {/* Account actions */}
      <div className="space-y-6">
        <div className="rounded-sm bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-medium text-black">Account</h3>
          <p className="mb-4 text-xs text-zinc-500">
            Signed in as <span className="font-medium text-zinc-700">{user.email}</span>.
          </p>
          <Button variant="outline" onClick={onLogout}
            className="rounded-none border-zinc-300 text-xs font-medium tracking-widest hover:bg-zinc-50">
            SIGN OUT
          </Button>
        </div>

        <div className="rounded-sm bg-zinc-50 p-6 text-xs text-zinc-500 leading-relaxed">
          <p className="mb-1 font-medium text-zinc-700">Need help?</p>
          Contact our team at{' '}
          <a href="mailto:support@vinesandbranches.com" className="underline hover:text-black">
            support@vinesandbranches.com
          </a>{' '}
          or call us Monday–Saturday, 9AM–6PM.
        </div>
      </div>
    </div>
  );
}
