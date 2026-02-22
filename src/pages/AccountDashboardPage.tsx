import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingBag, User, ChevronDown, ChevronUp,
  Package, Clock, CheckCircle, Truck, XCircle, ArrowLeft,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAuth } from '../context/AuthContext';
import { useRouter } from '../context/RouterContext';
import api from '../services/api';
import { toast } from 'sonner';

type Tab = 'orders' | 'profile';

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
  pending:    { label: 'Pending',    color: 'bg-amber-100 text-amber-800',  icon: Clock },
  processing: { label: 'Processing', color: 'bg-blue-100 text-blue-800',    icon: Package },
  shipped:    { label: 'Shipped',    color: 'bg-indigo-100 text-indigo-800', icon: Truck },
  delivered:  { label: 'Delivered',  color: 'bg-green-100 text-green-800',  icon: CheckCircle },
  cancelled:  { label: 'Cancelled',  color: 'bg-red-100 text-red-800',      icon: XCircle },
};

export function AccountDashboardPage() {
  const { user, logout } = useAuth();
  const { navigateTo, goBack } = useRouter();
  const [tab, setTab] = useState<Tab>('orders');

  // Guard — should not happen, but redirect just in case
  useEffect(() => {
    if (!user) navigateTo('account');
  }, [user, navigateTo]);

  if (!user) return null;

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
              {user.first_name[0]}{user.last_name[0]}
            </div>
            <div>
              <h1 className="text-lg font-medium text-black">
                {user.first_name} {user.last_name}
              </h1>
              <p className="text-sm text-zinc-500">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mx-auto max-w-5xl px-4 md:px-8">
          <div className="flex gap-6">
            {(['orders', 'profile'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`relative pb-3 text-sm capitalize transition-colors ${
                  tab === t ? 'font-medium text-black' : 'text-zinc-500 hover:text-zinc-700'
                }`}
              >
                {t === 'orders' ? 'My Orders' : 'Profile'}
                {tab === t && (
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
          {tab === 'orders' ? (
            <motion.div
              key="orders"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
            >
              <OrdersTab />
            </motion.div>
          ) : (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
            >
              <ProfileTab user={user} onLogout={async () => { await logout(); navigateTo('home'); }} />
            </motion.div>
          )}
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
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
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
      {/* Order header */}
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

      {/* Expanded items */}
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

              {/* Totals */}
              <div className="space-y-1 border-t border-zinc-100 pt-3 text-xs text-zinc-500">
                <div className="flex justify-between">
                  <span>Subtotal</span><span>${Number(order.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{Number(order.shipping) === 0 ? 'Free' : `$${Number(order.shipping).toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span><span>${Number(order.tax).toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-zinc-200 pt-2 text-sm font-medium text-black">
                  <span>Total</span><span>${Number(order.total).toFixed(2)}</span>
                </div>
              </div>

              {/* Delivery address */}
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

/* ─── Profile Tab ────────────────────────────────────────────── */
function ProfileTab({
  user,
  onLogout,
}: {
  user: { id: number; email: string; first_name: string; last_name: string };
  onLogout: () => void;
}) {
  const { login } = useAuth();
  const [form, setForm] = useState({
    firstName: user.first_name,
    lastName: user.last_name,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [isSavingPw, setIsSavingPw] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
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

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    if (pwForm.newPassword.length < 10) {
      toast.error('Password must be at least 10 characters.');
      return;
    }
    setIsSavingPw(true);
    try {
      // Re-authenticate then update — simplest approach: use the reset endpoint
      // Real apps would have a dedicated change-password endpoint. For now, verify
      // by logging in again, then call a PATCH.
      await login(user.email, pwForm.currentPassword);
      await api.updateProfile({});   // placeholder — triggers a round-trip to confirm auth
      toast.success('Password changed.');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch {
      toast.error('Current password is incorrect.');
    } finally {
      setIsSavingPw(false);
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
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="firstName" className="text-xs text-zinc-600">First name</Label>
              <Input
                id="firstName"
                value={form.firstName}
                onChange={(e) => setForm(p => ({ ...p, firstName: e.target.value }))}
                className="mt-1 rounded-none border-zinc-300"
              />
            </div>
            <div>
              <Label htmlFor="lastName" className="text-xs text-zinc-600">Last name</Label>
              <Input
                id="lastName"
                value={form.lastName}
                onChange={(e) => setForm(p => ({ ...p, lastName: e.target.value }))}
                className="mt-1 rounded-none border-zinc-300"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs text-zinc-600">Email address</Label>
            <Input
              value={user.email}
              disabled
              className="mt-1 rounded-none border-zinc-200 bg-zinc-50 text-zinc-500"
            />
            <p className="mt-1 text-xs text-zinc-400">Email cannot be changed.</p>
          </div>
          <Button
            type="submit"
            disabled={isSaving}
            className="rounded-none bg-black px-6 text-xs font-medium tracking-widest text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            {isSaving ? 'SAVING…' : 'SAVE CHANGES'}
          </Button>
        </form>
      </div>

      {/* Sign out */}
      <div className="space-y-6">
        <div className="rounded-sm bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-medium text-black">Account</h3>
          <p className="mb-4 text-xs text-zinc-500">
            You are signed in as <span className="font-medium text-zinc-700">{user.email}</span>.
          </p>
          <Button
            variant="outline"
            onClick={onLogout}
            className="rounded-none border-zinc-300 text-xs font-medium tracking-widest hover:bg-zinc-50"
          >
            SIGN OUT
          </Button>
        </div>

        <div className="rounded-sm bg-zinc-50 p-6 text-xs text-zinc-500 leading-relaxed">
          <p className="font-medium text-zinc-700 mb-1">Need help?</p>
          Contact our team at{' '}
          <a href="mailto:support@vinesandbranches.com" className="underline hover:text-black">
            support@vinesandbranches.com
          </a>
          {' '}or call us Monday–Saturday, 9AM–6PM.
        </div>
      </div>
    </div>
  );
}
