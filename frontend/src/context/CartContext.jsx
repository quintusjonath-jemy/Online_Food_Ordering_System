import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [items,   setItems]   = useState([]);
  const [total,   setTotal]   = useState(0);
  const [count,   setCount]   = useState(0);
  const [loading, setLoading] = useState(false);

  /** Fetch cart from server */
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) { setItems([]); setTotal(0); setCount(0); return; }
    try {
      setLoading(true);
      const { data } = await cartAPI.getCart();
      if (data.success) {
        setItems(data.items  ?? []);
        setTotal(data.total  ?? 0);
        setCount(data.count  ?? 0);
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [isAuthenticated]);

  // Reload cart when auth state changes
  useEffect(() => { fetchCart(); }, [fetchCart]);

  /** Add item to cart */
  const addToCart = async (foodId, quantity = 1) => {
    if (!isAuthenticated) return false;
    try {
      const { data } = await cartAPI.addItem({ food_id: foodId, quantity });
      if (data.success) await fetchCart();
      return data.success;
    } catch { return false; }
  };

  /** Update quantity */
  const updateQuantity = async (cartItemId, quantity) => {
    try {
      const { data } = await cartAPI.updateQuantity(cartItemId, quantity);
      if (data.success) await fetchCart();
      return data.success;
    } catch { return false; }
  };

  /** Remove single item */
  const removeItem = async (cartItemId) => {
    try {
      const { data } = await cartAPI.removeItem(cartItemId);
      if (data.success) await fetchCart();
      return data.success;
    } catch { return false; }
  };

  /** Clear entire cart */
  const clearCart = async () => {
    try {
      await cartAPI.clearCart();
      setItems([]); setTotal(0); setCount(0);
    } catch { /* silent */ }
  };

  return (
    <CartContext.Provider value={{ items, total, count, loading, fetchCart, addToCart, updateQuantity, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
