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

function recalculate(cart: CartShape): CartShape {
  const items = cart.items.map((item) => {
    const price = Number(item.product_detail?.price || 0);
    return {
      ...item,
      subtotal: price * item.quantity,
    };
  });
  const total = items.reduce((sum, item) => sum + Number(item.subtotal || 0), 0);
  const item_count = items.reduce((sum, item) => sum + item.quantity, 0);
  return { ...cart, items, total, item_count };
}

function emptyCart(): CartShape {
  return { items: [], total: 0, item_count: 0 };
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartShape | null>(null);
  const [loading, setLoading] = useState(true);

  const saveLocal = (nextCart: CartShape | null) => {
    try {
      if (!nextCart) {
        localStorage.removeItem(LOCAL_KEY);
        return;
      }
      localStorage.setItem(LOCAL_KEY, JSON.stringify(recalculate(nextCart)));
    } catch {
      // Ignore storage failures.
    }
  };

  const loadLocal = (): CartShape => {
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      return raw ? recalculate(JSON.parse(raw)) : emptyCart();
    } catch {
      return emptyCart();
    }
  };

  const refresh = async () => {
    setLoading(true);
    try {
      setCart(loadLocal());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const addItem = async (productId: number, quantity = 1, size = '', color = '') => {
    setLoading(true);
    try {
      const current = loadLocal();
      const existing = current.items.find(
        (item) => item.product === productId && item.size === size && item.color === color,
      );

      if (existing) {
        existing.quantity += quantity;
        const next = recalculate(current);
        setCart(next);
        saveLocal(next);
        return;
      }

      const product = await api.getProductById(productId);
      const next = recalculate({
        ...current,
        items: [
          ...current.items,
          {
            id: Date.now(),
            product: productId,
            quantity,
            size,
            color,
            product_detail: {
              id: product.id,
              name: product.name,
              price: product.price,
              image: product.image,
              slug: product.slug,
            },
          },
        ],
      });
      setCart(next);
      saveLocal(next);
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (itemId: number, quantity: number) => {
    setLoading(true);
    try {
      const current = loadLocal();
      const items = quantity <= 0
        ? current.items.filter((item) => item.id !== itemId)
        : current.items.map((item) => (item.id === itemId ? { ...item, quantity } : item));
      const next = recalculate({ ...current, items });
      setCart(next);
      saveLocal(next);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (itemId: number) => {
    setLoading(true);
    try {
      const current = loadLocal();
      const next = recalculate({
        ...current,
        items: current.items.filter((item) => item.id !== itemId),
      });
      setCart(next);
      saveLocal(next);
    } finally {
      setLoading(false);
    }
  };

  const clear = async () => {
    setLoading(true);
    try {
      const next = emptyCart();
      setCart(next);
      saveLocal(next);
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
