import { motion } from 'motion/react';
import { ShoppingBag, Truck, ArrowLeftRight, Lock, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useRouter } from '../context/RouterContext';
import logo from "../assets/logo.png";
import { useCart } from '../context/CartContext';
import { ArrowRight } from 'lucide-react';
export function CartPage() {
  const { goBack, navigateTo } = useRouter();
  const { cart, loading, updateItem, removeItem, clear } = useCart();
  const isEmpty = !(cart && cart.item_count && cart.item_count > 0);

  return (
    <div className="min-h-screen bg-zinc-50 pt-20">
      {/* Header with Logo */}
      <div className="border-b border-zinc-200 bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <button
            onClick={goBack}
            className="mb-4 flex items-center gap-2 text-sm text-zinc-700 transition-colors hover:text-black"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <img src={logo} alt="VNB" className="mx-auto h-12 w-auto" />
        </div>
      </div>

      {/* Progress Steps */}
      <div className="border-b border-zinc-200 bg-white py-8">
        <div className="mx-auto max-w-4xl px-4 md:px-8">
          <div className="flex items-center justify-between">
            <StepIndicator label="CART" active />
            <div className="h-px flex-1 bg-zinc-300" />
            <StepIndicator label="CHECKOUT" />
            <div className="h-px flex-1 bg-zinc-300" />
            <StepIndicator label="CONFIRMATION" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart Content */}
          <div className="lg:col-span-2">
            {loading ? (
              <motion.div className="rounded-sm bg-white p-12 text-center shadow-sm">Loading...</motion.div>
            ) : isEmpty ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-sm bg-white p-12 text-center shadow-sm"
              >
                <ShoppingBag className="mx-auto mb-6 h-16 w-16 text-zinc-300" />
                <h2 className="mb-4 text-black">Your cart is empty</h2>
                <Button
                  onClick={goBack}
                  className="mt-4 rounded-none bg-zinc-800 px-8 hover:bg-black"
                >
                  CONTINUE SHOPPING
                </Button>
              </motion.div>
            ) : (
              <div className="rounded-sm bg-white p-6 shadow-sm">
                <h2 className="mb-6 text-black">Shopping Cart</h2>
                <div className="space-y-4">
                  {cart?.items.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-4 border-b border-zinc-100 pb-4">
                      <img src={item.product_detail?.image || '/logo.png'} alt={item.product_detail?.name} className="h-20 w-20 object-cover" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium text-black">{item.product_detail?.name || 'Product'}</div>
                            <div className="text-xs text-zinc-600">{item.size ? `Size: ${item.size}` : ''} {item.color ? ` • ${item.color}` : ''}</div>
                          </div>
                          <div className="text-sm text-black">${Number(item.product_detail?.price || 0).toFixed(2)}</div>
                        </div>
                        <div className="mt-3 flex items-center gap-3">
                          <button onClick={() => updateItem(item.id, item.quantity - 1)} className="px-3 py-1 border">-</button>
                          <div className="px-3">{item.quantity}</div>
                          <button onClick={() => updateItem(item.id, item.quantity + 1)} className="px-3 py-1 border">+</button>
                          <button onClick={() => removeItem(item.id)} className="ml-4 text-sm text-red-600">Remove</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary + Checkout */}
            {!isEmpty && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-sm bg-white p-6 shadow-sm"
              >
                <h3 className="mb-4 text-sm font-medium text-black">ORDER SUMMARY</h3>
                <div className="space-y-2 border-b border-zinc-100 pb-4">
                  <div className="flex justify-between text-xs text-zinc-700">
                    <span>Subtotal</span>
                    <span>${Number(cart?.total ?? 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-zinc-700">
                    <span>Shipping</span>
                    <span className="text-green-700">Free</span>
                  </div>
                  <div className="flex justify-between text-xs text-zinc-700">
                    <span>Tax (8%)</span>
                    <span>${(Number(cart?.total ?? 0) * 0.08).toFixed(2)}</span>
                  </div>
                </div>
                <div className="mt-4 flex justify-between text-sm font-medium text-black">
                  <span>Total</span>
                  <span>${(Number(cart?.total ?? 0) * 1.08).toFixed(2)}</span>
                </div>
                <Button
                  onClick={() => navigateTo('checkout')}
                  className="mt-6 w-full rounded-none bg-black py-6 text-xs font-medium tracking-widest text-white hover:bg-zinc-800"
                >
                  PROCEED TO CHECKOUT
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            )}

            {/* The Orange Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-sm bg-white p-6 shadow-sm"
            >
              <h3 className="mb-4 text-sm text-black">THE VNB BOX</h3>
              <div className="mb-4 flex items-start gap-4">
                <div className="h-16 w-16 flex-shrink-0 rounded-sm bg-amber-500" />
                <p className="text-xs text-zinc-700">
                  All orders are delivered in a VNB box tied with a ribbon, with the exception of{' '}
                  <a href="#" className="underline">
                    certain items
                  </a>
                  .
                </p>
              </div>
            </motion.div>

            {/* Customer Service */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-sm bg-white p-6 shadow-sm"
            >
              <h3 className="mb-4 text-sm text-black">CUSTOMER SERVICE</h3>
              <p className="mb-4 text-xs text-zinc-700">
                Monday to Saturday 10am - 9pm EST
                <br />
                <a href="tel:8004614468" className="underline hover:text-black">
                  800-461-4468
                </a>
              </p>

              <div className="grid grid-cols-3 gap-4 border-t border-zinc-200 pt-4">
                <ServiceIcon icon={Truck} label="Free standard delivery" />
                <ServiceIcon icon={ArrowLeftRight} label="Returns & exchanges" />
                <ServiceIcon icon={Lock} label="Shop securely" />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Minimal Footer */}
      <footer className="border-t border-zinc-200 bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex flex-wrap justify-center gap-4">
              <a href="#" className="text-xs text-zinc-600 hover:text-black">
                Terms and conditions
              </a>
              <a href="#" className="text-xs text-zinc-600 hover:text-black">
                Privacy & cookies
              </a>
              <a href="#" className="text-xs text-zinc-600 hover:text-black">
                Legal issues
              </a>
              <a href="#" className="text-xs text-zinc-600 hover:text-black">
                Accessibility
              </a>
            </div>
            <p className="text-xs text-zinc-600">© Vines & Branches 2025. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StepIndicator({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`mb-2 h-3 w-3 rounded-full transition-colors ${
          active ? 'bg-black' : 'bg-zinc-300'
        }`}
      />
      <span className={`text-xs ${active ? 'text-black' : 'text-zinc-400'}`}>{label}</span>
    </div>
  );
}

function ServiceIcon({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <Icon className="mb-2 h-6 w-6 text-zinc-700" />
      <p className="text-xs text-zinc-700">{label}</p>
    </div>
  );
}
