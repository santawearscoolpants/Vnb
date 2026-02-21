import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

type ProductDetail = {
  id: number;
  name: string;
  price: string | number;
  image?: string;
  slug?: string;
};

type CartItem = {
  id: number;
  product: number;
  product_detail?: ProductDetail;
  quantity: number;
  size?: string;
  color?: string;
  subtotal?: string | number;
};

type CartShape = {
  id?: number;
  items: CartItem[];
  total?: number;
  item_count?: number;
};

type CartContextShape = {
  cart: CartShape | null;
  loading: boolean;
  refresh: () => Promise<void>;
  addItem: (productId: number, quantity?: number, size?: string, color?: string) => Promise<void>;
  updateItem: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clear: () => Promise<void>;
};

const CartContext = createContext<CartContextShape | undefined>(undefined);

const LOCAL_KEY = 'vnb_cart_local';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartShape | null>(null);
  const [loading, setLoading] = useState(true);

  const saveLocal = (c: CartShape | null) => {
    try {
      if (c) localStorage.setItem(LOCAL_KEY, JSON.stringify(c));
      else localStorage.removeItem(LOCAL_KEY);
    } catch (e) {
      // ignore
    }
  };

  const loadLocal = (): CartShape | null => {
    try {
      const v = localStorage.getItem(LOCAL_KEY);
      return v ? JSON.parse(v) : null;
    } catch (e) {
      return null;
    }
  };

  const refresh = async () => {
    setLoading(true);
    try {
      const data = (await api.getCurrentCart()) as any as CartShape;
      setCart(data);
      saveLocal(data);
    } catch (e) {
      // fallback to local
      const local = loadLocal();
      setCart(local);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addItem = async (productId: number, quantity = 1, size = '', color = '') => {
    setLoading(true);
    try {
  const data = (await api.addToCart(productId, quantity, size, color)) as any as CartShape;
  setCart(data);
  saveLocal(data);
    } catch (e) {
      // local fallback: merge into local cart
      const local = loadLocal() || { items: [], total: 0, item_count: 0 };
      const existing = local.items.find((it: any) => it.product === productId && it.size === size && it.color === color);
      if (existing) existing.quantity += quantity;
      else
  local.items.push({ id: Date.now(), product: productId, quantity, size, color, product_detail: { id: productId, name: 'Product', price: 0 }, subtotal: 0 });
      local.item_count = local.items.reduce((s: number, it: any) => s + it.quantity, 0);
      setCart(local);
      saveLocal(local);
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (itemId: number, quantity: number) => {
    setLoading(true);
    try {
  const data = (await api.updateCartItem(itemId, quantity)) as any as CartShape;
  setCart(data);
  saveLocal(data);
    } catch (e) {
      const local = loadLocal();
      if (local) {
        const it = local.items.find((i: any) => i.id === itemId);
        if (it) {
          if (quantity <= 0) local.items = local.items.filter((i: any) => i.id !== itemId);
          else it.quantity = quantity;
          local.item_count = local.items.reduce((s: number, it: any) => s + it.quantity, 0);
          setCart(local);
          saveLocal(local);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (itemId: number) => {
    setLoading(true);
    try {
  const data = (await api.removeCartItem(itemId)) as any as CartShape;
  setCart(data);
  saveLocal(data);
    } catch (e) {
      const local = loadLocal();
      if (local) {
        local.items = local.items.filter((i: any) => i.id !== itemId);
        local.item_count = local.items.reduce((s: number, it: any) => s + it.quantity, 0);
        setCart(local);
        saveLocal(local);
      }
    } finally {
      setLoading(false);
    }
  };

  const clear = async () => {
    setLoading(true);
    try {
  const data = (await api.clearCart()) as any as CartShape;
  setCart(data);
  saveLocal(data);
    } catch (e) {
      setCart({ items: [], total: 0, item_count: 0 });
      saveLocal(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CartContext.Provider value={{ cart, loading, refresh, addItem, updateItem, removeItem, clear }}>
      {children}
    </CartContext.Provider>
  );
};

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

export default CartContext;
